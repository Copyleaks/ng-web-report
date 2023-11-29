import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, combineLatest, forkJoin, from, interval } from 'rxjs';
import { concatMap, filter, take, takeWhile, switchMapTo, switchMap } from 'rxjs/operators';
import { ALERTS } from '../constants/report-alerts.constants';
import { EResultPreviewType } from '../enums/copyleaks-web-report.enums';
import { IClsReportEndpointConfigModel, IEndpointDetails } from '../models/report-config.models';
import { IAPIProgress, ICompleteResults, IResultDetailResponse, IScanSource } from '../models/report-data.models';
import { AIScanResult, ResultDetailItem } from '../models/report-matches.models';
import { ICopyleaksReportOptions } from '../models/report-options.models';
import * as helpers from '../utils/report-statistics-helpers';
import { untilDestroy } from '../utils/until-destroy';
import { ReportViewService } from './report-view.service';

@Injectable()
export class ReportDataService {
	private _reportEndpointConfig$ = new BehaviorSubject<IClsReportEndpointConfigModel | undefined>(undefined);
	/**
	 * Subject for sharing the report data endpoints.
	 */
	public get reportEndpointConfig$() {
		return this._reportEndpointConfig$;
	}
	/**
	 * Getter for the report data endpoints.
	 */
	public get reportEndpointConfig() {
		return this._reportEndpointConfig$.value;
	}

	private _scanResultsDetails$ = new BehaviorSubject<ResultDetailItem[] | undefined>(undefined);
	private _loadedResultsDetails$: ResultDetailItem[] = [];
	/**
	 * Subject for sharing the report complete results.
	 */
	public get scanResultsDetails$() {
		return this._scanResultsDetails$;
	}
	/**
	 * Getter for the report complete results.
	 */
	public get scanResultsDetails() {
		return this._scanResultsDetails$.value;
	}

	private _scanResultsPreviews$ = new BehaviorSubject<ICompleteResults | undefined>(undefined);
	/**
	 * Subject for sharing the report complete results.
	 */
	public get scanResultsPreviews$() {
		return this._scanResultsPreviews$;
	}
	/**
	 * Getter for the report complete results.
	 */
	public get scanResultsPreviews() {
		return this._scanResultsPreviews$.value;
	}

	private _crawledVersion$ = new BehaviorSubject<IScanSource | undefined>(undefined);
	/**
	 * Subject for sharing the report complete results.
	 */
	public get crawledVersion$() {
		return this._crawledVersion$;
	}
	/**
	 * Getter for the report complete results.
	 */
	public get crawledVersion() {
		return this._crawledVersion$.value;
	}

	private _filterOptions$ = new BehaviorSubject<ICopyleaksReportOptions | undefined>(undefined);
	/** Emits matches that are relevant to source html one-to-many mode */
	public get filterOptions$() {
		return this._filterOptions$;
	}
	public get filterOptions() {
		return this._filterOptions$.value;
	}

	private _excludedResultsIds$ = new BehaviorSubject<string[] | undefined>(undefined);
	/** Emits matches that are relevant to source html one-to-many mode */
	public get excludedResultsIds$() {
		return this._excludedResultsIds$;
	}
	public get excludedResultsIds() {
		return this._excludedResultsIds$.value;
	}

	public get isFilterOn(): boolean {
		return (
			this._filterOptions$.value?.showIdentical === false ||
			this._filterOptions$.value?.showMinorChanges === false ||
			this._filterOptions$.value?.showRelated === false ||
			this._filterOptions$.value?.showAlerts === false ||
			this._filterOptions$.value?.showSameAuthorSubmissions === false ||
			this._filterOptions$.value?.showInternetResults === false ||
			this._filterOptions$.value?.showInternalDatabaseResults === false ||
			this._filterOptions$.value?.showBatchResults === false ||
			this._filterOptions$.value?.showTop100Results === false ||
			(this._filterOptions$.value?.includedTags?.length && this._filterOptions$.value?.includedTags?.length > 0) ||
			!!this._filterOptions$.value?.publicationDate ||
			!!this._filterOptions$.value?.wordLimit ||
			this._filterOptions$.value?.includeResultsWithoutDate == false
		);
	}

	constructor(private _http: HttpClient, private _viewSvc: ReportViewService) {
		combineLatest([this.filterOptions$, this.excludedResultsIds$])
			.pipe(
				untilDestroy(this),
				filter(([options, excludedResultsIds]) => options !== undefined && excludedResultsIds !== undefined)
			)
			.subscribe(([options, excludedResultsIds]) => {
				if (!this.scanResultsPreviews || !options || !excludedResultsIds) return;

				const filteredResults = this.filterResults(this.scanResultsDetails, options, excludedResultsIds);
				const stats = helpers.calculateStatistics(this.scanResultsPreviews, filteredResults, options);

				this._scanResultsPreviews$.next({
					...this.scanResultsPreviews,
					results: {
						...this.scanResultsPreviews.results,
						score: {
							identicalWords: stats.identical,
							minorChangedWords: stats.minorChanges,
							relatedMeaningWords: stats.relatedMeaning,
							aggregatedScore: stats.aggregatedScore ?? 0,
						},
					},
					filters: {
						general: {
							alerts: options?.showAlerts ?? true,
							authorSubmissions: options?.showSameAuthorSubmissions ?? true,
							topResult: options?.showTop100Results ?? true,
						},
						includedTags: options?.includedTags,
						matchType: {
							identicalText: options?.showIdentical ?? true,
							minorChanges: options?.showMinorChanges ?? true,
							paraphrased: options?.showRelated ?? true,
						},
						resultsMetaData: {
							publicationDate: {
								publicationEnabled: !!options?.publicationDate,
								resultsWithNoDates: options?.includeResultsWithoutDate ?? true,
								startDate: options?.publicationDate,
							},
							wordLimit: {
								wordLimitEnabled: !!options?.wordLimit,
								totalWordlimt: options?.wordLimit,
							},
						},
						resultIds: excludedResultsIds ?? [],
						sourceType: {
							batch: options?.showBatchResults ?? true,
							internalDatabase: options?.showInternalDatabaseResults ?? true,
							internet: options?.showInternetResults ?? true,
							repositories: [],
						},
					},
				});
			});
	}

	/**
	 * Initializes report data by fetching necessary information from specified endpoints:
	 * Crawled Version & Complete Results
	 *
	 * @param {IClsReportEndpointConfigModel} endpointsConfig - The configuration object for API endpoints required for the report data.
	 *
	 * @returns {void} - The function does not return anything.
	 *
	 * @example
	 *
	 * initReportData({
	 *   "authToken": "",
	 *   "crawledVersion": "assets/scans/bundle/default/source.json",
	 *   "completeResults": "assets/scans/bundle/default/complete.json",
	 *   "result": "assets/scans/bundle/default/results/{RESULT_ID}",
	 *   "filter": {
	 *     "get": "",
	 *     "update": ""
	 *   }
	 * });
	 *
	 */
	public initReportData(endpointsConfig: IClsReportEndpointConfigModel) {
		if (!endpointsConfig) return;

		// init the subject values
		this._reportEndpointConfig$.next(endpointsConfig);

		if (!endpointsConfig.progress?.url) {
			this.initSync(endpointsConfig);
		} else {
			const progressResult$ = this._http.get<IAPIProgress>(endpointsConfig.progress.url, {
				headers: this._createHeaders(endpointsConfig.progress, endpointsConfig.authToken),
			});
			progressResult$.pipe(take(1)).subscribe(progress => {
				if (progress?.percents == 100) this.initSync(endpointsConfig);
				else this.initAsync();
			});
		}
	}

	public initSync(endpointsConfig: IClsReportEndpointConfigModel) {
		// first emit the prgress as 100, so no real time view is rendered
		this._viewSvc.progress$.next(100);

		// Run the GET report crawled version & GET complete results requests in parallel using the created headers
		const crawledVersionReq$ = this._http.get<IScanSource>(endpointsConfig.crawledVersion.url, {
			headers: this._createHeaders(endpointsConfig.crawledVersion, endpointsConfig.authToken),
		});
		const completeResultsReq$ = this._http.get<ICompleteResults>(endpointsConfig.completeResults.url, {
			headers: this._createHeaders(endpointsConfig.completeResults, endpointsConfig.authToken),
		});

		forkJoin([crawledVersionReq$, completeResultsReq$])
			.pipe(untilDestroy(this))
			.subscribe(([crawledVersionRes, completeResultsRes]) => {
				this._crawledVersion$.next(crawledVersionRes);
				this._updateCompleteResults(completeResultsRes);
			});
	}

	public initAsync() {
		const progress$ = interval(10000).pipe(
			concatMap(() => this._getReportScanProgress()),
			untilDestroy(this)
		);

		progress$.subscribe(progress => {
			this._viewSvc.progress$.next(progress.percents);
		});

		const inProgress$ = progress$.pipe(
			concatMap(() => this._getReportScanProgress()),
			filter(progress => progress.percents < 100 && progress.percents > 36),
			take(1),
			switchMapTo(this._getReportCrawledVersion()),
			untilDestroy(this)
		);

		const completed$ = progress$.pipe(
			concatMap(() => this._getReportScanProgress()),
			takeWhile(progress => progress.percents === 100, true),
			untilDestroy(this)
		);

		inProgress$.subscribe(scanSource => {
			this._crawledVersion$.next(scanSource);
		});

		completed$
			.pipe(
				switchMap(_ => this._getReportCompleteResults()),
				untilDestroy(this)
			)
			.subscribe(completeResults => {
				this._updateCompleteResults(completeResults);
			});
	}

	public loadAllReportScanResults(completeResults: ICompleteResults) {
		const cachedResults = this._scanResultsDetails$.getValue();

		if (cachedResults !== undefined) {
			return;
		}

		if (completeResults?.results) {
			// Put all the results IDs in one lits
			let resultsIds = [
				...completeResults.results.internet.map(result => result.id),
				...completeResults.results.database.map(result => result.id),
				...(completeResults.results.repositories?.map(result => result.id) ?? []),
				...completeResults.results.batch?.map(result => result.id),
			];

			resultsIds = resultsIds.filter(id => !this._scanResultsDetails$.value?.find(r => r.id === id));

			// But the results ids in a list of batches (10 each)
			const batchSize = 10;
			const idBatches = [];
			for (let i = 0; i < resultsIds.length; i += batchSize) {
				idBatches.push(resultsIds.slice(i, i + batchSize));
			}

			// Calculate the total number of batches you'll have
			const totalBatches = idBatches.length;
			let currentBatchIndex = 0; // Initialize a variable to keep track of the current batch index

			if (totalBatches === 0) this._scanResultsDetails$.next([]);

			this._loadedResultsDetails$ = [...(this._scanResultsDetails$.value ?? [])];
			// Send the GET results requests in batches
			const fetchResultsBatches = from(idBatches);
			fetchResultsBatches
				.pipe(
					concatMap(ids => {
						currentBatchIndex++; // Increment the current batch index each time a new batch starts
						return forkJoin(...ids.map(id => this.getReportResultAsync(id)));
					}),
					untilDestroy(this)
				)
				.subscribe((results: ResultDetailItem[]) => {
					if (results) {
						// Add the new fetched results to the Cache subject
						this._loadedResultsDetails$ = [...this._loadedResultsDetails$, ...results] as ResultDetailItem[];

						// Check if this is the last batch
						if (currentBatchIndex === totalBatches) {
							this._scanResultsDetails$.next(this._loadedResultsDetails$);
						}
					}
				});
		}
	}

	public async getReportResultAsync(resultId: string) {
		if (!this._reportEndpointConfig$?.value?.result) return;

		var requestUrl = this._reportEndpointConfig$.value.result.url.replace('{RESULT_ID}', resultId);

		const response = await this._http
			.get<IResultDetailResponse>(requestUrl, {
				headers: this._createHeaders(
					this._reportEndpointConfig$?.value.result,
					this._reportEndpointConfig$?.value.authToken
				),
			})
			.toPromise();

		return {
			id: resultId,
			result: response,
		} as ResultDetailItem;
	}

	public filterResults(
		results: ResultDetailItem[] | undefined,
		settings: ICopyleaksReportOptions,
		excludedResultsIds: string[]
	): ResultDetailItem[] {
		let completeResults = [
			...(this.scanResultsPreviews$.value?.results.internet ?? []),
			...(this.scanResultsPreviews$.value?.results.batch ?? []),
			...(this.scanResultsPreviews$.value?.results.database ?? []),
			...(this.scanResultsPreviews$.value?.results.repositories ?? []),
		];
		if (!results || !completeResults || !settings) return [];

		if (settings.showTop100Results !== undefined && settings.showTop100Results === true)
			completeResults = completeResults.sort((a, b) => b.matchedWords - a.matchedWords).slice(0, 100);

		let filteredResultsIds: string[] = completeResults
			.filter(r => !excludedResultsIds.find(id => id === r.id))
			.map(result => result.id);

		if (filteredResultsIds && filteredResultsIds.length === 0) return [];

		if (settings.showInternetResults !== undefined && settings.showInternetResults === false)
			filteredResultsIds = filteredResultsIds.filter(id =>
				completeResults.find(cr => cr.id === id && cr.type !== EResultPreviewType.Internet)
			);

		if (settings.showBatchResults !== undefined && settings.showBatchResults === false)
			filteredResultsIds = filteredResultsIds.filter(id =>
				completeResults.find(cr => cr.id === id && cr.type !== EResultPreviewType.Batch)
			);

		if (settings.showInternalDatabaseResults !== undefined && settings.showInternalDatabaseResults === false)
			filteredResultsIds = filteredResultsIds.filter(id =>
				completeResults.find(cr => cr.id === id && cr.type !== EResultPreviewType.Database)
			);

		// TODO Repos
		if (settings.showRepositoriesResults !== undefined && settings.showRepositoriesResults.length === 0)
			filteredResultsIds = filteredResultsIds.filter(id =>
				completeResults.find(cr => cr.id === id && cr.type !== EResultPreviewType.Repositroy)
			);

		if (!!settings.wordLimit)
			filteredResultsIds = filteredResultsIds.filter(id =>
				completeResults.find(cr => cr.id === id && cr.matchedWords <= (settings.wordLimit ?? 0))
			);

		if (!!settings.publicationDate)
			filteredResultsIds = filteredResultsIds.filter(id =>
				completeResults.find(
					cr =>
						cr.id === id &&
						new Date(settings.publicationDate ?? new Date()).getTime() <=
							new Date(cr.metadata?.publishDate ?? settings.publicationDate ?? new Date()).getTime()
				)
			);

		if (settings.includeResultsWithoutDate != undefined && settings.includeResultsWithoutDate === false)
			filteredResultsIds = filteredResultsIds.filter(id =>
				completeResults.find(cr => cr.id === id && !!cr.metadata?.publishDate)
			);

		if (settings.includedTags && settings.includedTags.length > 0)
			filteredResultsIds = filteredResultsIds.filter(id =>
				completeResults.find(cr => cr.id === id && cr.tags?.find(t => settings.includedTags?.includes(t.code)))
			);

		// check if a match hiding will make one of the results score zero
		let resultsUpdateStatistics = results.map(r => {
			return {
				...r,
				result: {
					...r.result,
					statistics: {
						identical: r.result?.statistics.identical,
						minorChanges: r.result?.statistics.minorChanges,
						relatedMeaning: r.result?.statistics.relatedMeaning,
					},
				},
			} as ResultDetailItem;
		});
		resultsUpdateStatistics.forEach(r => {
			if (!settings.showIdentical && r.result?.statistics.identical != undefined) r.result.statistics.identical = 0;
			if (!settings.showMinorChanges && r.result?.statistics.minorChanges != undefined)
				r.result.statistics.minorChanges = 0;
			if (!settings.showRelated && r.result?.statistics.relatedMeaning != undefined)
				r.result.statistics.relatedMeaning = 0;
		});

		filteredResultsIds = filteredResultsIds.filter(id =>
			resultsUpdateStatistics.find(
				cr =>
					cr.id === id &&
					(cr.result?.statistics?.identical != 0 ||
						cr.result?.statistics?.minorChanges != 0 ||
						cr.result?.statistics?.relatedMeaning != 0)
			)
		);

		return results.filter(r => !!filteredResultsIds.find(id => r.id === id));
	}

	public hasNonAIAlerts() {
		const completeResult = this.scanResultsPreviews;
		if (completeResult === undefined) return null;
		if (
			(completeResult?.notifications?.alerts?.filter(s => s.code != ALERTS.SUSPECTED_AI_TEXT_DETECTED)?.length ?? 0) > 0
		) {
			return true;
		}
		return false;
	}

	public isPlagiarismEnabled() {
		const completeResult = this.scanResultsPreviews;
		if (completeResult) {
			if (completeResult?.scannedDocument?.enabled?.plagiarismDetection != null)
				return completeResult?.scannedDocument?.enabled?.plagiarismDetection;
		}
		return true;
	}
	public isAiDetectionEnabled() {
		const completeResult = this.scanResultsPreviews;
		if (completeResult) {
			if (completeResult?.scannedDocument?.enabled?.aiDetection) return true;
			return (
				completeResult?.notifications?.alerts?.length &&
				completeResult?.notifications?.alerts.filter(alert => alert.code == ALERTS.SUSPECTED_AI_TEXT_DETECTED).length ==
					1
			);
		}
		return false;
	}
	public getAiScore() {
		if (this.isAiDetectionEnabled()) {
			const completeResult = this.scanResultsPreviews;
			if (completeResult === undefined) return null;
			const aiAlert = completeResult.notifications?.alerts.find(
				alert => alert.code == ALERTS.SUSPECTED_AI_TEXT_DETECTED
			);
			if (aiAlert) {
				const aiData = JSON.parse(aiAlert.additionalData) as AIScanResult;
				return aiData.summary.ai;
			}
			return 0;
		}
		return null;
	}
	public clearFilter() {
		// Load the filter options from the complete results response
		this.filterOptions$.next({
			showIdentical: true,
			showMinorChanges: true,
			showRelated: true,

			showAlerts: true,
			showTop100Results: false,
			showSameAuthorSubmissions: true,

			includedTags: [],

			showInternetResults: true,
			showInternalDatabaseResults: true,
			showBatchResults: true,
			showRepositoriesResults: [],

			wordLimit: undefined,

			includeResultsWithoutDate: true,
			publicationDate: undefined,
		});
	}

	private _updateCompleteResults(completeResultsRes: ICompleteResults) {
		completeResultsRes.results.batch.forEach(result => {
			result.type = EResultPreviewType.Batch;
		});
		completeResultsRes.results.database.forEach(result => {
			result.type = EResultPreviewType.Database;
		});
		completeResultsRes.results.internet.forEach(result => {
			result.type = EResultPreviewType.Internet;
		});
		completeResultsRes.results?.repositories?.forEach(result => {
			result.type = EResultPreviewType.Repositroy;
		});
		this._scanResultsPreviews$.next(completeResultsRes);

		// Load the excluded results Ids
		this.excludedResultsIds$.next(completeResultsRes.filters?.resultIds ?? []);

		// Load the filter options from the complete results response
		this.filterOptions$.next({
			showIdentical:
				completeResultsRes.filters?.matchType?.identicalText != undefined
					? completeResultsRes.filters?.matchType?.identicalText
					: true,
			showMinorChanges:
				completeResultsRes.filters?.matchType?.minorChanges != undefined
					? completeResultsRes.filters?.matchType?.minorChanges
					: true,
			showRelated:
				completeResultsRes.filters?.matchType?.paraphrased != undefined
					? completeResultsRes.filters?.matchType?.paraphrased
					: true,

			showAlerts:
				completeResultsRes.filters?.general?.alerts != undefined ? completeResultsRes.filters?.general?.alerts : true,
			showTop100Results:
				completeResultsRes.filters?.general?.topResult != undefined
					? completeResultsRes.filters?.general?.topResult
					: true,
			showSameAuthorSubmissions:
				completeResultsRes.filters?.general?.authorSubmissions != undefined
					? completeResultsRes.filters?.general?.authorSubmissions
					: true,

			includedTags: completeResultsRes.filters?.includedTags,

			showInternetResults:
				completeResultsRes.filters?.sourceType?.internet != undefined
					? completeResultsRes.filters?.sourceType?.internet
					: true,
			showInternalDatabaseResults:
				completeResultsRes.filters?.sourceType?.internalDatabase != undefined
					? completeResultsRes.filters?.sourceType?.internalDatabase
					: true,
			showBatchResults:
				completeResultsRes.filters?.sourceType?.batch != undefined
					? completeResultsRes.filters?.sourceType?.batch
					: true,
			showRepositoriesResults: completeResultsRes.filters?.sourceType?.repositories,

			wordLimit: completeResultsRes.filters?.resultsMetaData?.wordLimit?.wordLimitEnabled
				? completeResultsRes.filters?.resultsMetaData?.wordLimit?.totalWordlimt
				: undefined,

			includeResultsWithoutDate:
				completeResultsRes.filters?.resultsMetaData?.publicationDate?.resultsWithNoDates != undefined
					? completeResultsRes.filters?.resultsMetaData?.publicationDate?.resultsWithNoDates
					: true,
			publicationDate: completeResultsRes.filters?.resultsMetaData?.publicationDate?.startDate,
		});

		// Load all the complete scan results
		this.loadAllReportScanResults(completeResultsRes);
	}

	private _createHeaders(endpointDetails: IEndpointDetails, authToken: string): HttpHeaders {
		// Create HttpHeaders using the authToken and any additional headers provided in the endpoint details
		return new HttpHeaders({
			Authorization: `Bearer ${authToken}`,
			...endpointDetails.headers,
		});
	}

	private _getReportScanProgress() {
		if (!this._reportEndpointConfig$.value || !this._reportEndpointConfig$.value.progress?.url) return EMPTY;

		return this._http.get<IAPIProgress>(this._reportEndpointConfig$.value.progress.url, {
			headers: this._createHeaders(
				this._reportEndpointConfig$.value.progress,
				this._reportEndpointConfig$.value.authToken
			),
		});
	}

	private _getReportCrawledVersion() {
		if (!this._reportEndpointConfig$.value || !this._reportEndpointConfig$.value.crawledVersion?.url) return EMPTY;

		return this._http.get<IScanSource>(this._reportEndpointConfig$.value.crawledVersion.url, {
			headers: this._createHeaders(
				this._reportEndpointConfig$.value.crawledVersion,
				this._reportEndpointConfig$.value.authToken
			),
		});
	}

	private _getReportCompleteResults() {
		if (!this._reportEndpointConfig$.value || !this._reportEndpointConfig$.value.completeResults?.url) return EMPTY;

		return this._http.get<ICompleteResults>(this._reportEndpointConfig$.value.completeResults.url, {
			headers: this._createHeaders(
				this._reportEndpointConfig$.value.completeResults,
				this._reportEndpointConfig$.value.authToken
			),
		});
	}

	ngOnDestroy() {}
}
