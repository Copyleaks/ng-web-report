import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
	ICompleteResults,
	IResultDetailResponse as IResultDetailResponse,
	IScanSource,
} from '../models/report-data.models';
import { BehaviorSubject, Subject, combineLatest, forkJoin, from } from 'rxjs';
import { concatMap, filter } from 'rxjs/operators';
import { ResultDetailItem } from '../models/report-matches.models';
import { IClsReportEndpointConfigModel } from '../models/report-config.models';
import { untilDestroy } from '../utils/until-destroy';
import { EResultPreviewType } from '../enums/copyleaks-web-report.enums';
import { ReportViewService } from './report-view.service';
import { ICopyleaksReportOptions } from '../models/report-options.models';

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

	constructor(private _http: HttpClient) {
		combineLatest([this.filterOptions$, this.excludedResultsIds$])
			.pipe(
				untilDestroy(this),
				filter(options => options != undefined)
			)
			.subscribe(([options, excludedResultsIds]) => {
				if (!this.scanResultsPreviews) return;
				this._scanResultsPreviews$.next({
					...this.scanResultsPreviews,
					filters: {
						general: {
							alerts: options?.showAlerts ?? true,
							authorSubmissions: options?.showSameAuthorSubmissions ?? true,
							topResult: options?.showTop100Results ?? false,
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

		// Run the GET report crawled version & GET complete results requests in parallel
		const crawledVersionReq = this._http.get<IScanSource>(endpointsConfig.crawledVersion);
		const completeResultsReq = this._http.get<ICompleteResults>(endpointsConfig.completeResults);

		forkJoin([crawledVersionReq, completeResultsReq])
			.pipe(untilDestroy(this))
			.subscribe(
				([crawledVersionRes, completeResultsRes]) => {
					this._crawledVersion$.next(crawledVersionRes);

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
							completeResultsRes.filters?.general?.alerts != undefined
								? completeResultsRes.filters?.general?.alerts
								: true,
						showTop100Results:
							completeResultsRes.filters?.general?.topResult != undefined
								? completeResultsRes.filters?.general?.topResult
								: false,
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
				},
				error => {
					// TODO: Error handling
					console.error('Error occurred:', error);
				}
			);
	}

	public loadAllReportScanResults(completeResults: ICompleteResults) {
		const cachedResults = this._scanResultsDetails$.getValue();

		if (cachedResults !== undefined) {
			return;
		}

		if (completeResults?.results) {
			// Put all the results IDs in one lits
			const resultsIds = [
				...completeResults.results.internet.map(result => result.id),
				...completeResults.results.database.map(result => result.id),
				...(completeResults.results.repositories?.map(result => result.id) ?? []),
				...completeResults.results.batch?.map(result => result.id),
			];

			// But the results ids in a list of batches (10 each)
			const batchSize = 10; // TODO: Do we need to move this constant to a separate file?
			const idBatches = [];
			for (let i = 0; i < resultsIds.length; i += batchSize) {
				idBatches.push(resultsIds.slice(i, i + batchSize));
			}

			// Calculate the total number of batches you'll have
			const totalBatches = idBatches.length;
			let currentBatchIndex = 0; // Initialize a variable to keep track of the current batch index

			if (totalBatches === 0) this._scanResultsDetails$.next([]);

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

		var requestUrl = this._reportEndpointConfig$.value.result.replace('{RESULT_ID}', resultId);

		const response = await this._http.get<IResultDetailResponse>(requestUrl).toPromise();

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
						new Date(settings.publicationDate ?? new Date()).getTime() >=
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

		return results.filter(r => !!filteredResultsIds.find(id => r.id === id));
	}

	ngOnDestroy() {}
}
