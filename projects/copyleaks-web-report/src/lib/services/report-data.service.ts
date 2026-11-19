import { PercentPipe } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
	BehaviorSubject,
	EMPTY,
	Observable,
	Subject,
	Subscription,
	asapScheduler,
	combineLatest,
	concat,
	defer,
	forkJoin,
	from,
	interval,
	of,
} from 'rxjs';
import {
	catchError,
	concatMap,
	distinctUntilChanged,
	filter,
	map,
	mergeMap,
	subscribeOn,
	take,
	takeUntil,
} from 'rxjs/operators';
import { IResultItem } from '../components/containers/report-results-item-container/components/models/report-result-item.models';
import { ALERTS } from '../constants/report-alerts.constants';
import { EResultPreviewType, EScanStatus } from '../enums/copyleaks-web-report.enums';
import { IClsReportEndpointConfigModel, IEndpointDetails } from '../models/report-config.models';
import {
	IAPIProgress,
	ICompleteResults,
	IDatabaseResultPreview,
	IDeleteScanResultModel,
	IExcludedCorrection,
	IHtmlWritingFeedbackRange,
	IInternetResultPreview,
	IRepositoryResultPreview,
	IResultDetailResponse,
	IResultPreviewBase,
	IResultsChunkResponse,
	IResultsExportInfo,
	IScanSource,
	IWritingFeedback,
	IWritingFeedbackCorrectionViewModel,
	IWritingFeedbackRange,
	IWritingFeedbackScanScource,
	ResultPreview,
} from '../models/report-data.models';
import { AIScanResult, ResultDetailItem } from '../models/report-matches.models';
import { ICopyleaksReportOptions } from '../models/report-options.models';
import * as helpers from '../utils/report-statistics-helpers';
import { untilDestroy } from '../utils/until-destroy';
import { ReportErrorsService } from './report-errors.service';
import { ReportViewService } from './report-view.service';
import { ReportStatistics } from '../models/report-statistics.models';
import { retryWithDelay } from '../utils/retry-with-delay';
import { ERROR_MESSAGES } from '../constants/report-scan-errors.constants';
import { RESULT_TAGS_CODES } from '../constants/report-result-tags.constants';

/** The plagiarism numbers of the report's statistics. */
type PlagiarismStatistics = Pick<ReportStatistics, 'aggregatedScore' | 'identical' | 'minorChanges' | 'relatedMeaning'>;

@Injectable()
export class ReportDataService {
	public isRealTimeView$ = new BehaviorSubject<boolean>(false);
	public get isRealTimeView(): boolean {
		return this.isRealTimeView$.value;
	}

	//#region Report Endpoint Configuration

	private _reportEndpointConfig$ = new BehaviorSubject<IClsReportEndpointConfigModel | undefined>(undefined);
	/**
	 * Observable stream for the report endpoint configuration.
	 */
	public get reportEndpointConfig$() {
		return this._reportEndpointConfig$;
	}
	/**
	 * Current value of the report endpoint configuration.
	 */
	public get reportEndpointConfig() {
		return this._reportEndpointConfig$.value;
	}

	//#endregion

	//#region Scan Results Details

	private _scanResultsDetails$ = new BehaviorSubject<ResultDetailItem[] | undefined>(undefined);
	private _loadedResultsDetails$: ResultDetailItem[] = [];
	/**
	 * Observable stream for the complete scan result details.
	 */
	public get scanResultsDetails$() {
		return this._scanResultsDetails$;
	}
	/**
	 * Current value of the complete scan result details.
	 */
	public get scanResultsDetails() {
		return this._scanResultsDetails$.value;
	}

	//#endregion

	//#region Scan Results Previews

	public completeResultsSnapshot: ICompleteResults | undefined;
	private _scanResultsPreviews$ = new BehaviorSubject<ICompleteResults | undefined>(undefined);
	/**
	 * Observable stream for scan results preview data.
	 */
	public get scanResultsPreviews$() {
		return this._scanResultsPreviews$;
	}
	/**
	 * Current value of the scan results preview data.
	 */
	public get scanResultsPreviews() {
		return this._scanResultsPreviews$.value;
	}

	//#endregion

	//#region Crawled Version

	private _crawledVersion$ = new BehaviorSubject<IScanSource | undefined | null>(undefined);
	/**
	 * Observable stream for the crawled source version information.
	 */
	public get crawledVersion$() {
		return this._crawledVersion$;
	}
	/**
	 * Current value of the crawled source version information.
	 */
	public get crawledVersion() {
		return this._crawledVersion$.value;
	}

	//#endregion

	//#region Writing Feedback

	private _writingFeedback$ = new BehaviorSubject<IWritingFeedback | undefined>(undefined);
	/**
	 * Observable stream for writing feedback associated with the report.
	 */
	public get writingFeedback$() {
		return this._writingFeedback$;
	}
	/**
	 * Current value of the writing feedback.
	 */
	public get writingFeedback() {
		return this._writingFeedback$.value;
	}

	//#endregion

	//#region Excluded Corrections

	private _excludedCorrections$ = new BehaviorSubject<IExcludedCorrection[] | undefined>(undefined);
	/**
	 * Observable stream for excluded corrections in one-to-many source mode.
	 */
	public get excludedCorrections$() {
		return this._excludedCorrections$;
	}
	/**
	 * Current value of the excluded corrections.
	 */
	public get excludedCorrections() {
		return this._excludedCorrections$.value;
	}

	//#endregion

	//#region Filter Options

	private _filterOptions$ = new BehaviorSubject<ICopyleaksReportOptions | undefined>(undefined);
	/**
	 * Observable stream for the report filtering options.
	 */
	public get filterOptions$() {
		return this._filterOptions$;
	}
	/**
	 * Current value of the report filtering options.
	 */
	public get filterOptions() {
		return this._filterOptions$.value;
	}

	//#endregion

	//#region Excluded Results IDs

	private _excludedResultsIds$ = new BehaviorSubject<string[] | undefined>(undefined);
	/**
	 * Observable stream for IDs of results excluded from the report.
	 */
	public get excludedResultsIds$() {
		return this._excludedResultsIds$;
	}
	/**
	 * Current value of the excluded result IDs.
	 */
	public get excludedResultsIds() {
		return this._excludedResultsIds$.value;
	}

	//#endregion

	//#region Selected Category Result IDs

	private _selectedCategoryResultsIds$ = new BehaviorSubject<string[] | undefined>(undefined);
	/**
	 * Observable stream for IDs of results selected by category.
	 */
	public get selectedCategoryResultsIds$() {
		return this._selectedCategoryResultsIds$;
	}
	/**
	 * Current value of the selected category result IDs.
	 */
	public get selectedCategoryResultsIds() {
		return this._selectedCategoryResultsIds$.value;
	}

	//#endregion

	//#region Loading State

	private _loadingMoreResults$ = new BehaviorSubject<boolean>(false);
	/**
	 * Observable stream indicating whether additional results are currently being loaded.
	 */
	public get loadingMoreResults$() {
		return this._loadingMoreResults$;
	}
	/**
	 * Current loading state for additional results.
	 */
	public get loadingMoreResults() {
		return this._loadingMoreResults$.value;
	}

	//#endregion

	public get isFilterOn(): boolean {
		let totalIdentical = 0,
			totalMinorChanges = 0,
			totalParaphrased = 0;
		this.scanResultsDetails?.forEach(result => {
			if (result.result?.statistics.identical && result.result?.statistics.identical > 0) totalIdentical++;
			if (result.result?.statistics.minorChanges && result.result?.statistics.minorChanges > 0) totalMinorChanges++;
			if (result.result?.statistics.relatedMeaning && result.result?.statistics.relatedMeaning > 0) totalParaphrased++;
		});

		let totalYourFiles = 0,
			totalOthersFiles = 0;
		this.scanResultsPreviews?.results.database.forEach((result: IDatabaseResultPreview) => {
			if (result.scanId) totalYourFiles++;
			else totalOthersFiles++;
		});

		return (
			(totalIdentical > 0 && this._filterOptions$.value?.showIdentical === false) ||
			(totalMinorChanges > 0 && this._filterOptions$.value?.showMinorChanges === false) ||
			(totalParaphrased > 0 && this._filterOptions$.value?.showRelated === false) ||
			this._filterOptions$.value?.showAlerts === false ||
			this._filterOptions$.value?.showSameAuthorSubmissions === false ||
			(this.scanResultsPreviews?.results.internet.length &&
				this._filterOptions$.value?.showInternetResults === false) ||
			(this.scanResultsPreviews?.results.database.length &&
				((this._filterOptions$.value?.showOthersResults === false && totalOthersFiles > 0) ||
					(this._filterOptions$.value?.showYourResults === false && totalYourFiles > 0))) ||
			(this.scanResultsPreviews?.results.batch.length && this._filterOptions$.value?.showBatchResults === false) ||
			(!!this.scanResultsPreviews?.results.repositories?.length &&
				!!this._filterOptions$.value?.hiddenRepositories?.length) ||
			(this._filterOptions$.value?.showTop100Results === true && this.totalCompleteResults > 100) ||
			(this._filterOptions$.value?.includedTags?.length && this._filterOptions$.value?.includedTags?.length > 0) ||
			(this._filterOptions$.value?.excludedDomains?.length &&
				this._filterOptions$.value?.excludedDomains?.length > 0) ||
			!!this._filterOptions$.value?.publicationDate ||
			!!this._filterOptions$.value?.wordLimit ||
			this._filterOptions$.value?.includeResultsWithoutDate == false
		);
	}

	public get totalCompleteResults(): number {
		let completeResults = [
			...(this.scanResultsPreviews$.value?.results.internet ?? []),
			...(this.scanResultsPreviews$.value?.results.batch ?? []),
			...(this.scanResultsPreviews$.value?.results.database ?? []),
			...(this.scanResultsPreviews$.value?.results.repositories ?? []),
		];

		return completeResults.length;
	}

	public get totalOriginalCompleteResults(): number {
		let completeResults = [
			...(this.completeResultsSnapshot?.results.internet ?? []),
			...(this.completeResultsSnapshot?.results.batch ?? []),
			...(this.completeResultsSnapshot?.results.database ?? []),
			...(this.completeResultsSnapshot?.results.repositories ?? []),
		];

		return completeResults.length;
	}

	private _newResults$ = new BehaviorSubject<IResultItem[] | undefined>([]);
	/** Emits matches that are relevant to source html one-to-many mode */
	public get newResults$() {
		return this._newResults$;
	}
	public get newResults() {
		return this._newResults$.value;
	}

	constructor(
		private _http: HttpClient,
		private _viewSvc: ReportViewService,
		private _reportErrorsSvc: ReportErrorsService,
		private _percentPipe: PercentPipe
	) {
		combineLatest([
			this.filterOptions$.pipe(distinctUntilChanged()),
			this.excludedResultsIds$.pipe(distinctUntilChanged()),
			this.scanResultsDetails$.pipe(distinctUntilChanged()),
			this.excludedCorrections$.pipe(distinctUntilChanged()),
			this.writingFeedback$.pipe(distinctUntilChanged()),
		])
			.pipe(
				untilDestroy(this),
				filter(
					([options, excludedResultsIds, , excludedCorrections]) =>
						options !== undefined && excludedResultsIds !== undefined && excludedCorrections !== undefined
				)
			)
			.subscribe(([options, excludedResultsIds, , excludedCorrections, writingFeedback]) => {
				if (
					!this.scanResultsPreviews ||
					this.scanResultsPreviews === undefined ||
					!this.scanResultsDetails ||
					!this.scanResultsDetails === undefined ||
					!options ||
					!excludedResultsIds ||
					!excludedCorrections ||
					this._viewSvc.progress$.value !== 100 ||
					(this.totalCompleteResults <= 100 &&
						this.scanResultsDetails.length != this.totalCompleteResults &&
						this.isRealTimeView) ||
					(this.isWritingFeedbackEnabled() && writingFeedback === undefined)
				)
					return;

				const filteredResults = this.filterResults(options, excludedResultsIds);
				let filteredCorrections: IWritingFeedbackScanScource;
				if (writingFeedback) {
					filteredCorrections = this.filterCorrections(
						JSON.parse(JSON.stringify(writingFeedback?.corrections)),
						this.filterOptions,
						this.excludedCorrections
					);
				}

				const stats: ReportStatistics = this._getReportStats(
					filteredResults,
					this.scanResultsPreviews,
					filteredCorrections,
					writingFeedback
				);
				const filteredOutResultsIds = [
					...(this.scanResultsPreviews$.value?.results.internet ?? []),
					...(this.scanResultsPreviews$.value?.results.batch ?? []),
					...(this.scanResultsPreviews$.value?.results.database ?? []),
					...(this.scanResultsPreviews$.value?.results.repositories ?? []),
				]
					.filter(
						result => !filteredResults.find(r => result.id === r.id) && !excludedResultsIds.find(id => result.id === id)
					)
					.map(result => result.id);

				// Load all the viewed results
				if (
					!this.isRealTimeView ||
					(this.isRealTimeView &&
						this.totalCompleteResults > 100 &&
						this.scanResultsDetails.length != this.totalCompleteResults &&
						!options.showTop100Results)
				)
					this.loadViewedResultsDetails();

				this._scanResultsPreviews$.next({
					...this.scanResultsPreviews,
					results: {
						...this.scanResultsPreviews.results,
						score: {
							identicalWords: stats.identical,
							minorChangedWords: stats.minorChanges,
							relatedMeaningWords: stats.relatedMeaning,
							aggregatedScore: this.isPlagiarismEnabled() ? stats.aggregatedScore ?? 0 : null,
							writingFeedbackOverallIssues: this.isWritingFeedbackEnabled() ? stats.writingFeedbackOverallIssues : null,
							writingFeedbackOverallScore: this.isWritingFeedbackEnabled() ? stats.writingFeedbackOverallScore : null,
						},
					},
					filters: {
						isFilterEnabled: this.isFilterOn || excludedResultsIds?.length > 0,
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
								totalWordLimit: options?.wordLimit,
							},
						},
						sourceType: {
							batch: options?.showBatchResults ?? true,
							internalDatabase: options?.showYourResults || options?.showOthersResults,
							yourResults: options?.showYourResults ?? true,
							othersResults: options?.showOthersResults ?? true,
							internet: options?.showInternetResults ?? true,
							repositories: options?.hiddenRepositories ?? [],
							aiSourceMatch: options?.showAISourceMatch ?? true,
						},
						execludedResultIds: excludedResultsIds ?? [],
						filteredResultIds: filteredOutResultsIds ?? [],
						writingFeedback: {
							hiddenCategories: options.writingFeedback.hiddenCategories ?? [],
							excludedCorrections: excludedCorrections,
						},
						excludedDomains: options?.excludedDomains ?? [],
						aiPhrases: {
							minProportion: options?.minAIProportion,
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
	 */
	public initReportData(endpointsConfig: IClsReportEndpointConfigModel) {
		if (!endpointsConfig) return;

		// LMS-10324: the host may give the same report a new scan; nothing of the previous scan's chunks carries over.
		this._resetResultChunks();

		// init the subject values
		this._reportEndpointConfig$.next(endpointsConfig);

		if (!endpointsConfig.progress?.url) {
			this.initSync(endpointsConfig);
		} else {
			const progressResult$ = this._http.get<IAPIProgress>(endpointsConfig.progress.url, {
				headers: this._createHeaders(endpointsConfig.progress),
			});
			progressResult$.pipe(retryWithDelay(), take(1), untilDestroy(this)).subscribe(
				progress => {
					if (progress.status === EScanStatus.Error) {
						this._handleProgressErrorResponse(progress, endpointsConfig);
						return;
					}

					if (progress?.percents == 100) this.initSync(endpointsConfig);
					else {
						this._viewSvc.progress$.next(progress.percents);
						this._checkScanProgress(progress).then(
							_ => {
								this.initAsync();
							},
							error => {
								this._reportErrorsSvc.handleHttpError(error as HttpErrorResponse, 'initReportData');
							}
						);
					}
				},
				(error: HttpErrorResponse) => {
					// Error handling logic
					this._reportErrorsSvc.handleHttpError(error, 'initReportData');
				}
			);
		}
	}
	public initSync(endpointsConfig: IClsReportEndpointConfigModel) {
		// first emit the progress as 100, so no real-time view is rendered
		this._viewSvc.progress$.next(100);

		// completeResults gates the rest: if the scan isn't exported yet this request fails,
		// and we must NOT fan out to crawledVersion / writingFeedback / per-result fetches —
		// they would all fail the same way and flood the backend.
		this._http
			.get<ICompleteResults>(endpointsConfig.completeResults.url, {
				headers: this._createHeaders(endpointsConfig.completeResults),
			})
			.pipe(retryWithDelay(), untilDestroy(this))
			.subscribe(
				completeResultsRes => {
					// LMS-10324: a host with `resultsChunk` that has since given the report another scan drops this response.
					if (this._isFromEarlierScan(endpointsConfig)) return;
					this.completeResultsSnapshot = JSON.parse(JSON.stringify(completeResultsRes));
					this._scanResultsPreviews$.next(completeResultsRes);

					this._http
						.get<IScanSource>(endpointsConfig.crawledVersion.url, {
							headers: this._createHeaders(endpointsConfig.crawledVersion),
						})
						.pipe(retryWithDelay(), untilDestroy(this))
						.subscribe(
							crawledVersionRes => {
								if (this._isFromEarlierScan(endpointsConfig)) return; // LMS-10324
								this._crawledVersion$.next(crawledVersionRes);

								if (!crawledVersionRes.html?.value && this._viewSvc.reportViewMode.isHtmlView)
									this._viewSvc.reportViewMode$.next({
										...this._viewSvc.reportViewMode,
										isHtmlView: false,
									});
							},
							(error: HttpErrorResponse) => {
								if (this._isFromEarlierScan(endpointsConfig)) return; // LMS-10324
								this._reportErrorsSvc.handleHttpError(error, 'initSync - crawledVersion');
							}
						);

					// if the writing feedback endpoint is passed & is enabled in the complete results response then fetch its data
					if (endpointsConfig.writingFeedback && endpointsConfig.writingFeedback.url && this.isWritingFeedbackEnabled())
						this._http
							.get<IWritingFeedback>(endpointsConfig.writingFeedback?.url, {
								headers: this._createHeaders(endpointsConfig.writingFeedback),
							})
							.pipe(retryWithDelay(), untilDestroy(this))
							.subscribe(
								writingFeedbackVersionRes => {
									if (this._isFromEarlierScan(endpointsConfig)) return; // LMS-10324
									this._writingFeedback$.next(writingFeedbackVersionRes);
									this._updateCompleteResults(completeResultsRes);
								},
								(error: HttpErrorResponse) => {
									if (this._isFromEarlierScan(endpointsConfig)) return; // LMS-10324
									this._reportErrorsSvc.handleHttpError(error, 'initSync - writingFeedback');
								}
							);
					else this._updateCompleteResults(completeResultsRes);
				},
				(error: HttpErrorResponse) => {
					if (this._isFromEarlierScan(endpointsConfig)) return; // LMS-10324
					this._reportErrorsSvc.handleHttpError(error, 'initSync - completeResults');
					this.scanResultsDetails$.next([]);
					// crawledVersion never fires (gated by completeResults success) — emit null so
					// downstream subscribers waiting on crawledVersion$ unblock and the UI can move
					// out of the skeleton-loading state into the error state.
					this._crawledVersion$.next(null);
					this.scanResultsPreviews$.next({
						results: {
							batch: [],
							internet: [],
							database: [],
							score: {
								aggregatedScore: 0,
								identicalWords: 0,
								minorChangedWords: 0,
								relatedMeaningWords: 0,
							},
						},
						scannedDocument: {
							credits: 0,
							scanId: '',
							totalWords: 0,
							totalExcluded: 0,
							creationTime: '',
							enabled: {
								aiDetection: false,
								plagiarismDetection: false,
								cheatDetection: false,
								pdfReport: false,
								writingFeedback: false,
							},
						},
						status: EScanStatus.Error,
					});
				}
			);
	}

	public async initAsync() {
		const ENABLE_REALTIME_MOCK_TESTING = false;
		let testCounter = 25;

		// Set the layout view to: one-to-many plagiarism with no selected alerts
		this._viewSvc.selectedAlert$.next(null);
		this._viewSvc.reportViewMode$.next({
			viewMode: 'one-to-many',
			alertCode: undefined,
			suspectId: undefined,
			...this._viewSvc.reportViewMode,
		});

		this.isRealTimeView$.next(true);

		// subscribtion to stop the 10 sec inteval when the progress is 100% and the report data is loaded
		var _realTimeUpdateSub = new Subject();
		interval(5000)
			.pipe(
				concatMap(() => this._getReportScanProgress()),
				untilDestroy(this),
				takeUntil(_realTimeUpdateSub)
			)
			.subscribe(
				progress => {
					if (ENABLE_REALTIME_MOCK_TESTING) {
						if (testCounter < 80) {
							testCounter += Math.floor(Math.random() * 26);
							progress.percents = testCounter;
						} else {
							testCounter = 100;
							progress.percents = 100;
						}
					}

					if (progress.percents >= 0 && progress.percents <= 100) {
						this._viewSvc.progress$.next(progress.percents);
					}

					this._checkScanProgress(progress)
						.catch(error => {
							this._reportErrorsSvc.handleHttpError(error as HttpErrorResponse, '_checkScanProgress');
							_realTimeUpdateSub.next(null);
							_realTimeUpdateSub.complete();
						})
						.finally(() => {
							if (progress.percents === 100) {
								_realTimeUpdateSub.next(null);
								_realTimeUpdateSub.complete();
							}
						});
				},
				(error: HttpErrorResponse) => {
					// Error handling logic here
					this._reportErrorsSvc.handleHttpError(error, 'getReportScanProgress');
					_realTimeUpdateSub.next(null);
					_realTimeUpdateSub.complete();
				}
			);
	}

	public loadViewedResultsDetails(firstLoad: boolean = false) {
		// LMS-10324: a scan exported as chunks (LMS batch export, hosts with a `resultsChunk` endpoint) loads only the
		// chunks that hold the results being shown. Every other scan and host loads them one by one below, as before.
		if (this._isChunkedMode) {
			this._loadViewedResultChunks(firstLoad);
			return;
		}

		const cachedResults = this._scanResultsDetails$.getValue();

		if (cachedResults?.length === this.totalCompleteResults || !this.filterOptions || !this.excludedResultsIds) {
			this._loadingMoreResults$.next(false);
			return;
		}

		this._loadingMoreResults$.next(true);

		let resultsIds = this.filterPreviewedResults(this.filterOptions, this.excludedResultsIds);
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

		if (totalBatches === 0) {
			if (this.totalCompleteResults === 0 || firstLoad) this._scanResultsDetails$.next([]);
			this._loadingMoreResults$.next(false);
		}

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
						this._loadingMoreResults$.next(false);
					}
				}
			});
	}

	//#region Chunked results loading (LMS batch export)

	/** The only `resultsExport` version this report reads: the scan's results laid out in chunks of `chunkSize`. */
	private readonly _supportedResultsExportVersion = 2;

	/** How many chunks are requested at once - each holds up to `chunkSize` decompressed results on the server. */
	private readonly _resultChunksConcurrency = 3;

	/** How many results are requested at once when they are loaded one by one (as the legacy path does). */
	private readonly _resultsBatchSize = 10;

	/**
	 * The method name a failed chunk is reported under (`onReportRequestError`). Not fatal: the shown results it held are
	 * loaded one by one afterwards, so a host can tell it from an error that leaves the report without results.
	 */
	private readonly _resultChunkErrorMethod = '_getResultChunk';

	/**
	 * The `resultsExport` section of the current scan. Set only when the host configured `resultsChunk` and the section
	 * is one this report can read; taken when the complete results arrive and cleared when a new scan is loaded.
	 */
	private _resultsExport: IResultsExportInfo | undefined;

	/** The chunk of every exported result id: its position in `resultsExport.resultIds` divided by the chunk size. */
	private _resultChunkIndexById = new Map<string, number>();

	/** The chunks requested for this scan, loaded or failed. A chunk is never requested twice. */
	private _requestedResultChunks = new Set<number>();

	/** Results that came with a chunk while the filters hid them; they are shown from here when the filters show them. */
	private _hiddenChunkResults = new Map<string, ResultDetailItem>();

	/** Results that neither their chunk nor the `result` endpoint could load. They are not requested again for this scan. */
	private _unavailableResultIds = new Set<string>();

	/** The plagiarism numbers last computed from every shown result of this scan. */
	private _lastComputedStatistics: PlagiarismStatistics | undefined;

	/** The loading round in flight. One round runs at a time. */
	private _resultChunksRound: Subscription | undefined;

	/** A load was asked for while a round was in flight, so another round runs when it ends. */
	private _resultChunksReloadRequested = false;

	/**
	 * Whether the results of this scan are loaded in chunks (LMS batch export) instead of one by one: the host configured
	 * `resultsChunk` and the complete results carry a valid `resultsExport` section. Always false for other hosts.
	 */
	public get isResultsChunkMode(): boolean {
		return this._isChunkedMode;
	}

	private get _isChunkedMode(): boolean {
		return !!this._resultsExport && !!this._reportEndpointConfig$.value?.resultsChunk?.url;
	}

	/**
	 * Chunk mode only: whether the host must not be given the complete results yet - a round is loading, or some of the
	 * shown results are not loaded (still loading, or they could not be loaded). The host is given them again once every
	 * shown result is loaded, so it only ever receives a score computed from all of them: never one computed from part of
	 * them, nor a stand-in after the filters changed (LMS stores the score it receives). Always false for other hosts.
	 */
	public get isHostUpdateDeferred(): boolean {
		return this._isChunkedMode && (this.loadingMoreResults || this._isMissingShownResults());
	}

	/**
	 * Chunk mode only: the plagiarism numbers the report shows while some of the results the filters show are not loaded
	 * (still loading, or they could not be loaded): the last ones computed from every shown result of this scan, or, before
	 * any were, the server's. Never numbers computed from part of the results. `undefined` when every shown result is
	 * loaded, when there is nothing to stand in (nothing computed yet and no aggregated score in the complete results),
	 * and always when the results are loaded one by one, so the statistics of those hosts are computed exactly as before.
	 */
	public get statisticsWhileResultsMissing(): PlagiarismStatistics | undefined {
		if (!this._isChunkedMode || !this._isMissingShownResults()) return undefined;
		if (this._lastComputedStatistics) return this._lastComputedStatistics;

		const score = this.completeResultsSnapshot?.results?.score;
		if (!score || (!score.aggregatedScore && this.totalCompleteResults !== 0)) return undefined;

		return {
			aggregatedScore: (score.aggregatedScore ?? 0) / 100,
			identical: score.identicalWords ?? 0,
			minorChanges: score.minorChangedWords ?? 0,
			relatedMeaning: score.relatedMeaningWords ?? 0,
		};
	}

	/** Whether some of the results the filters show are not loaded (still loading, or they could not be loaded). */
	private _isMissingShownResults(): boolean {
		if (!this.filterOptions || !this.excludedResultsIds) return false;
		const loadedIds = new Set((this.scanResultsDetails ?? []).map(result => result?.id));
		return this.filterPreviewedResults(this.filterOptions, this.excludedResultsIds).some(id => !loadedIds.has(id));
	}

	/**
	 * Chunk mode only: keeps the numbers computed from every shown result for the time results are missing, or puts the
	 * stand-in in place of numbers computed from part of them.
	 */
	private _applyChunkModeStatistics(stats: ReportStatistics): ReportStatistics {
		if (!this._isChunkedMode) return stats;

		if (!this._isMissingShownResults()) {
			this._lastComputedStatistics = {
				aggregatedScore: stats.aggregatedScore,
				identical: stats.identical,
				minorChanges: stats.minorChanges,
				relatedMeaning: stats.relatedMeaning,
			};
			return stats;
		}

		const standIn = this.statisticsWhileResultsMissing;
		return standIn ? { ...stats, ...standIn } : stats;
	}

	/**
	 * Keeps the scan's `resultsExport` section when the host configured `resultsChunk` and the section is valid: version 2,
	 * a whole positive `chunkSize` and a non-empty list of string ids, every one of them listed by the complete results.
	 * A chunk arrives whole, so a viewer who may see only some of the results (the complete results leave the others
	 * out, e.g. for a student) loads the listed ones one by one instead. Otherwise the results are loaded one by one.
	 */
	private _setResultsExport(completeResults: ICompleteResults | undefined) {
		const resultsExport = completeResults?.resultsExport;
		const isValid =
			!!this._reportEndpointConfig$.value?.resultsChunk?.url &&
			resultsExport?.version === this._supportedResultsExportVersion &&
			Number.isInteger(resultsExport.chunkSize) &&
			resultsExport.chunkSize > 0 &&
			Array.isArray(resultsExport.resultIds) &&
			resultsExport.resultIds.length > 0 &&
			resultsExport.resultIds.every(id => typeof id === 'string' && id.length > 0) &&
			this._areAllListed(resultsExport.resultIds, completeResults);

		this._resultsExport = isValid ? resultsExport : undefined;
		this._resultChunkIndexById.clear();
		if (!isValid) return;

		resultsExport.resultIds.forEach((id, position) => {
			if (!this._resultChunkIndexById.has(id))
				this._resultChunkIndexById.set(id, Math.floor(position / resultsExport.chunkSize));
		});
	}

	/** Whether every id is listed by the complete results, including the self-match excluded ones. */
	private _areAllListed(ids: string[], completeResults: ICompleteResults): boolean {
		const results = completeResults?.results;
		const listedIds = new Set(
			[
				...(results?.internet ?? []),
				...(results?.database ?? []),
				...(results?.batch ?? []),
				...(results?.repositories ?? []),
				...(results?.selfMatchExcluded?.internet ?? []),
				...(results?.selfMatchExcluded?.database ?? []),
				...(results?.selfMatchExcluded?.batch ?? []),
				...(results?.selfMatchExcluded?.repositories ?? []),
			].map(result => result?.id)
		);
		return ids.every(id => listedIds.has(id));
	}

	/**
	 * Whether a response belongs to an earlier scan: the host has since given the report other endpoints. Only for hosts
	 * that configured `resultsChunk` (their late responses are dropped); other hosts keep the legacy behaviour.
	 */
	private _isFromEarlierScan(endpointsConfig: IClsReportEndpointConfigModel): boolean {
		return !!endpointsConfig?.resultsChunk?.url && endpointsConfig !== this._reportEndpointConfig$.value;
	}

	/** Forgets the previous scan's chunks and stops its loading round (its requests are aborted), so a new scan starts clean. */
	private _resetResultChunks() {
		const hadRoundInFlight = !!this._resultChunksRound;
		this._resultChunksRound?.unsubscribe();
		this._resultChunksRound = undefined;
		this._resultChunksReloadRequested = false;
		this._requestedResultChunks.clear();
		this._hiddenChunkResults.clear();
		this._unavailableResultIds.clear();
		this._lastComputedStatistics = undefined;
		this._setResultsExport(undefined);
		if (hadRoundInFlight) this._loadingMoreResults$.next(false);
	}

	/**
	 * Loads the results being shown - the ids the filters show, plus the suspect of a one-to-one view - through the
	 * chunks that hold them: a few chunks at a time, top matches first, and never a chunk twice. Whatever the chunks do
	 * not bring (a failed chunk, an id missing from its chunk, an id outside the export) is loaded one by one through the
	 * `result` endpoint, like the legacy path. The results are emitted once, when the round ends - also when nothing could
	 * be loaded or the round failed - so the loading state always ends and nothing is computed from part of the results.
	 */
	private _loadViewedResultChunks(firstLoad: boolean) {
		if (!this.filterOptions || !this.excludedResultsIds) {
			this._loadingMoreResults$.next(false);
			return;
		}

		if (this._resultChunksRound) {
			this._resultChunksReloadRequested = true;
			return;
		}

		const loadedIds = new Set((this.scanResultsDetails ?? []).map(result => result?.id));
		const idsToShow = this._getResultIdsToShow().filter(id => !loadedIds.has(id));

		// Results that came with an earlier chunk need no request.
		const loadedInRound: ResultDetailItem[] = [];
		idsToShow.forEach(id => {
			const hiddenResult = this._hiddenChunkResults.get(id);
			if (!hiddenResult) return;
			this._hiddenChunkResults.delete(id);
			loadedInRound.push(hiddenResult);
			loadedIds.add(id);
		});

		const missingIds = new Set(idsToShow.filter(id => !loadedIds.has(id) && !this._unavailableResultIds.has(id)));
		if (!missingIds.size && !loadedInRound.length && this.scanResultsDetails && !firstLoad) {
			this._loadingMoreResults$.next(false);
			return;
		}

		const chunksToRequest = Array.from(
			new Set(
				Array.from(missingIds)
					.map(id => this._resultChunkIndexById.get(id))
					.filter((chunkIndex): chunkIndex is number => chunkIndex !== undefined)
			)
		)
			.filter(chunkIndex => !this._requestedResultChunks.has(chunkIndex))
			.sort((a, b) => a - b);
		chunksToRequest.forEach(chunkIndex => this._requestedResultChunks.add(chunkIndex));

		const previewedIds = this._getPreviewedResultIds();
		const addResult = (item: ResultDetailItem) => {
			// Only results listed by this scan's complete results, never anything else a response may hold.
			if (!item?.id || !item.result || !previewedIds.has(item.id) || loadedIds.has(item.id)) return;
			if (missingIds.delete(item.id)) {
				loadedInRound.push(item);
				loadedIds.add(item.id);
			} else this._hiddenChunkResults.set(item.id, item);
		};

		// The same end for a round that completes and for one that fails, so the loading state always ends.
		const endRound = () => {
			this._resultChunksRound = undefined;
			missingIds.forEach(id => this._unavailableResultIds.add(id));
			this._loadingMoreResults$.next(false);

			const currentResults = this.scanResultsDetails ?? [];
			const currentIds = new Set(currentResults.map(result => result?.id));
			const currentPreviewedIds = this._getPreviewedResultIds();
			this._scanResultsDetails$.next([
				...currentResults,
				...loadedInRound.filter(result => !currentIds.has(result.id) && currentPreviewedIds.has(result.id)),
			]);

			if (this._resultChunksReloadRequested) {
				this._resultChunksReloadRequested = false;
				this._loadViewedResultChunks(false);
			}
		};

		this._loadingMoreResults$.next(true);
		// Always asynchronous: the round may be started by a subscriber of the results it emits. Only HttpClient requests,
		// so unsubscribing (a new scan, or the report's destruction in ngOnDestroy) aborts them and emits nothing.
		this._resultChunksRound = concat(
			from(chunksToRequest).pipe(
				mergeMap(chunkIndex => this._getResultChunk(chunkIndex), this._resultChunksConcurrency)
			),
			// Whatever the chunks did not bring is loaded one by one (the chunks completed before this runs).
			defer(() => this._getResultsOneByOne(Array.from(missingIds)))
		)
			.pipe(subscribeOn(asapScheduler))
			.subscribe({ next: items => items.forEach(addResult), complete: endRound, error: endRound });
	}

	/** The ids the filters show, plus the suspect of a one-to-one view (a deep link or a reload) when it is a result of this scan. */
	private _getResultIdsToShow(): string[] {
		const ids = this.filterPreviewedResults(this.filterOptions, this.excludedResultsIds);
		const viewMode = this._viewSvc.reportViewMode;
		const suspectId = viewMode?.viewMode === 'one-to-one' ? viewMode.suspectId : undefined;
		if (suspectId && !ids.includes(suspectId) && this._getPreviewedResultIds().has(suspectId)) ids.push(suspectId);
		return ids;
	}

	/** The ids of every result listed by the complete results. */
	private _getPreviewedResultIds(): Set<string> {
		const results = this.scanResultsPreviews?.results;
		return new Set(
			[
				...(results?.internet ?? []),
				...(results?.database ?? []),
				...(results?.batch ?? []),
				...(results?.repositories ?? []),
			].map(result => result?.id)
		);
	}

	/**
	 * One results chunk. A failed chunk is reported to the host once, under its own method name, and gives no results;
	 * a malformed one gives no results either. The shown results it held are then loaded one by one.
	 */
	private _getResultChunk(chunkIndex: number): Observable<ResultDetailItem[]> {
		const chunkEndpoint = this._reportEndpointConfig$.value.resultsChunk;
		return this._http
			.get<IResultsChunkResponse>(
				chunkEndpoint.url.replace('{CHUNK_INDEX}', () => chunkIndex.toString()),
				{
					headers: this._createHeaders(chunkEndpoint),
				}
			)
			.pipe(
				retryWithDelay(),
				map(chunk =>
					Array.isArray(chunk) ? chunk.map(item => ({ id: item?.id, result: item?.result } as ResultDetailItem)) : []
				),
				catchError((error: HttpErrorResponse) => {
					this._reportErrorsSvc.handleHttpError(error, this._resultChunkErrorMethod);
					return of([] as ResultDetailItem[]);
				})
			);
	}

	/**
	 * Results through the `result` endpoint, 10 at a time like the legacy path. A failed one is reported to the host like
	 * a legacy per-result failure and left out. HttpClient requests, so a cancelled round aborts them: none of their
	 * results or errors reaches the report after the scan changed.
	 */
	private _getResultsOneByOne(ids: string[]): Observable<ResultDetailItem[]> {
		const resultEndpoint = this._reportEndpointConfig$.value?.result;
		if (!resultEndpoint?.url) return EMPTY;

		const batches: string[][] = [];
		for (let i = 0; i < ids.length; i += this._resultsBatchSize) batches.push(ids.slice(i, i + this._resultsBatchSize));

		return from(batches).pipe(
			concatMap(batch =>
				forkJoin(
					batch.map(id =>
						this._http
							.get<IResultDetailResponse>(
								resultEndpoint.url.replace('{RESULT_ID}', () => encodeURIComponent(id)),
								{
									headers: this._createHeaders(resultEndpoint),
								}
							)
							.pipe(
								retryWithDelay(),
								map(result => ({ id, result } as ResultDetailItem)),
								catchError((error: HttpErrorResponse) => {
									this._reportErrorsSvc.handleHttpError(error, 'getReportResultAsync');
									return of(undefined);
								})
							)
					)
				)
			),
			map(results => results.filter(result => !!result) as ResultDetailItem[])
		);
	}

	//#endregion

	public async getReportResultAsync(resultId: string, throwError: boolean = false) {
		if (!this._reportEndpointConfig$?.value?.result) return;

		var requestUrl = this._reportEndpointConfig$.value.result.url.replace('{RESULT_ID}', resultId);

		try {
			const response = await this._http
				.get<IResultDetailResponse>(requestUrl, {
					headers: this._createHeaders(this._reportEndpointConfig$?.value.result),
				})
				.pipe(retryWithDelay())
				.toPromise();

			return {
				id: resultId,
				result: response,
			} as ResultDetailItem;
		} catch (error) {
			// Error handling logic
			this._reportErrorsSvc.handleHttpError(error as HttpErrorResponse, 'getReportResultAsync');
			if (throwError) throw error;
		}
	}

	public filterResults(settings?: ICopyleaksReportOptions, excludedResultsIds?: string[]): ResultDetailItem[] {
		if (!this.scanResultsDetails || !this.scanResultsPreviews || !settings || !excludedResultsIds) return [];

		let completeResults = [
			...(this.scanResultsPreviews$.value?.results.internet ?? []),
			...(this.scanResultsPreviews$.value?.results.batch ?? []),
			...(this.scanResultsPreviews$.value?.results.database ?? []),
			...(this.scanResultsPreviews$.value?.results.repositories ?? []),
		];

		let filteredResultsIds = this._getFilteredResultsIds(settings, completeResults, excludedResultsIds);

		// check if a match hiding will make one of the results score zero, if so filter theses results out
		let resultsUpdateStatistics = this.scanResultsDetails
			.filter(r => r != undefined)
			.map(r => {
				return {
					...r,
					result: {
						...r.result,
						statistics: {
							identical: r.result?.statistics?.identical,
							minorChanges: r.result?.statistics?.minorChanges,
							relatedMeaning: r.result?.statistics?.relatedMeaning,
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
					(cr.id === id &&
						// check if after the percentage transform, the viewed percentage will be 0.0
						this._percentPipe.transform(
							((cr.result?.statistics?.relatedMeaning ?? 0) +
								(cr.result?.statistics?.minorChanges ?? 0) +
								(cr.result?.statistics?.identical ?? 0)) /
								((this.scanResultsPreviews?.scannedDocument.totalWords ?? 0) -
									(this.scanResultsPreviews?.scannedDocument.totalExcluded ?? 0)),
							'1.0-1'
						) !== '0%') ||
					// for compare scan situation: check if the filter match options are on, then don't hide the results with zero matches
					(settings.showIdentical &&
						settings.showRelated &&
						settings.showMinorChanges &&
						this._percentPipe.transform(
							((cr.result?.statistics?.relatedMeaning ?? 0) +
								(cr.result?.statistics?.minorChanges ?? 0) +
								(cr.result?.statistics?.identical ?? 0)) /
								((this.scanResultsPreviews?.scannedDocument.totalWords ?? 0) -
									(this.scanResultsPreviews?.scannedDocument.totalExcluded ?? 0)),
							'1.0-1'
						) === '0%')
			)
		);

		var result = this.scanResultsDetails.filter(r => !!filteredResultsIds.find(id => r.id === id));
		return this._removeDuplicates(result, 'id');
	}

	private _removeDuplicates(array: ResultDetailItem[], property: string) {
		const seen = new Set();
		return array.filter((obj: any) => {
			const value = obj[property];
			if (!seen.has(value)) {
				seen.add(value);
				return true;
			}
			return false;
		});
	}

	public filterPreviewedResults(settings: ICopyleaksReportOptions, excludedResultsIds: string[]): string[] {
		if (!this.scanResultsPreviews || !settings || !excludedResultsIds) return [];

		let completeResults = [
			...(this.scanResultsPreviews$.value?.results.internet ?? []),
			...(this.scanResultsPreviews$.value?.results.batch ?? []),
			...(this.scanResultsPreviews$.value?.results.database ?? []),
			...(this.scanResultsPreviews$.value?.results.repositories ?? []),
		];

		let filteredResultsIds = this._getFilteredResultsIds(settings, completeResults, excludedResultsIds);

		return filteredResultsIds;
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
		if (this._viewSvc.progress$.value != 100) return true;
		if (!completeResult) return false;
		if (completeResult) {
			if (completeResult?.scannedDocument?.enabled?.plagiarismDetection != null)
				return completeResult?.scannedDocument?.enabled?.plagiarismDetection;
		}
		return true;
	}

	public isAiDetectionEnabled() {
		const completeResult = this.scanResultsPreviews;
		if (this._viewSvc.progress$.value != 100) return true;
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

	public isAiSourceMatchEnabled() {
		const completeResult = this.scanResultsPreviews;
		if (this._viewSvc.progress$.value != 100) return true;
		if (completeResult?.scannedDocument?.enabled?.aiSourceMatch) return true;
		return false;
	}

	public isWritingFeedbackEnabled() {
		const completeResult = this.scanResultsPreviews;
		if (this._viewSvc.progress$.value != 100) return true;
		if (!completeResult || !this.reportEndpointConfig?.writingFeedback) return false;
		if (
			completeResult?.notifications?.alerts?.length &&
			completeResult?.notifications?.alerts.filter(
				alert =>
					alert.code == ALERTS.WRITING_FEEDBACK_LANG_NOT_SUPPORTED || alert.code == ALERTS.WRITING_FEEDBACK_FAILED
			).length >= 1
		)
			return false;
		if (completeResult?.scannedDocument?.enabled?.writingFeedback != null)
			return completeResult?.scannedDocument?.enabled?.writingFeedback;
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

	public getWritingFeedbackScore() {
		if (this.isWritingFeedbackEnabled()) {
			const completeResult = this.scanResultsPreviews;
			if (completeResult === undefined || !completeResult.writingFeedback) return null;
			return completeResult.writingFeedback.score.overallScore;
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
			showYourResults: true,
			showOthersResults: true,
			showAISourceMatch: true,

			showBatchResults: true,
			hiddenRepositories: [],

			wordLimit: undefined,

			includeResultsWithoutDate: true,
			publicationDate: undefined,

			writingFeedback: {
				hiddenCategories: this.filterOptions?.writingFeedback?.hiddenCategories ?? [],
			},
		});
	}

	public clearCorrectionsFilter() {
		// Load the filter options from the complete results response
		this.filterOptions$.next({
			...this.filterOptions,
			writingFeedback: {
				hiddenCategories: [],
			},
		});
	}

	public async deleteResultById(resultInfo: IResultItem): Promise<void> {
		if (
			!this._reportEndpointConfig$.value ||
			!this._reportEndpointConfig$.value.deleteResult?.url ||
			!this.scanResultsPreviews ||
			!resultInfo ||
			!resultInfo.resultDetails
		)
			return;

		try {
			let filteredResults = this.filterResults(this.filterOptions, this.excludedResultsIds);
			filteredResults = filteredResults.filter(result => result.id != resultInfo.resultPreview?.id);
			// LMS-10324: in chunk mode, as in the legacy path, this score comes from the loaded results only. No LMS report
			// configures `deleteResult` (checked 19/11/2026); a chunk-mode host that does must load the shown results first.
			const stats = helpers.calculateStatistics(this.scanResultsPreviews, filteredResults, this.filterOptions);

			// Build the request model & URL
			var requestUrl = this._reportEndpointConfig$.value.deleteResult.url.replace(
				'{RESULT_ID}',
				resultInfo.resultDetails.id
			);
			var requestModel: IDeleteScanResultModel = {
				resultId: resultInfo.resultDetails.id,
				/** */
				totalWords: this.scanResultsPreviews.scannedDocument.totalWords,
				totalExcluded: this.scanResultsPreviews.scannedDocument.totalExcluded,
				/** */
				aggregatedScore: stats.aggregatedScore ?? 0,
				identicalWords: stats.identical ?? 0,
				minorChangedWords: stats.minorChanges ?? 0,
				relatedMeaningWords: stats.relatedMeaning ?? 0,
			};

			// Send the delete request & update UI accordingly if the request was successful
			await this._http
				.patch(requestUrl, requestModel, {
					headers: this._createHeaders(this._reportEndpointConfig$.value.deleteResult),
				})
				.pipe(retryWithDelay())
				.toPromise();

			// Function to find and remove an result by ID from a the give results list
			const removeResultById = (results: IResultPreviewBase[]) => {
				const index = results.findIndex(result => result.id === resultInfo.resultDetails?.id);
				if (index !== -1) {
					results.splice(index, 1);
					if (!this.scanResultsPreviews) return;
					this.scanResultsPreviews$.next({
						...this.scanResultsPreviews,
						results: {
							...this.scanResultsPreviews.results,
							score: {
								aggregatedScore: stats.aggregatedScore ?? 0,
								identicalWords: stats.identical ?? 0,
								minorChangedWords: stats.minorChanges ?? 0,
								relatedMeaningWords: stats.relatedMeaning ?? 0,
							},
						},
					});
				}
			};

			// Remove the result *if found* from the complete results & update the score
			if (this.scanResultsPreviews?.results?.internet) removeResultById(this.scanResultsPreviews.results.internet);
			if (this.scanResultsPreviews?.results?.database) removeResultById(this.scanResultsPreviews?.results?.database);
			if (this.scanResultsPreviews?.results?.batch) removeResultById(this.scanResultsPreviews?.results?.batch);
			if (this.scanResultsPreviews?.results?.repositories)
				removeResultById(this.scanResultsPreviews?.results?.repositories);

			// Remove the result *if found* from the results details list
			if (this.scanResultsDetails) {
				const index = this.scanResultsDetails.findIndex(result => result.id === resultInfo.resultDetails?.id);
				if (index !== -1) {
					this.scanResultsDetails.splice(index, 1);
					this.scanResultsDetails$.next(this.scanResultsDetails);
				}
			}
		} catch (error) {
			this._reportErrorsSvc.handleHttpError(error as HttpErrorResponse, 'deleteResultById');
		}
	}

	public filterCorrections(
		corrections: IWritingFeedbackScanScource,
		filterOptions: ICopyleaksReportOptions,
		excludedCorrections: IWritingFeedbackCorrectionViewModel[]
	): IWritingFeedbackScanScource {
		// Filter indices where the type matches any of the corrections hidden categories

		let htmlFilteredFeedback: IHtmlWritingFeedbackRange;
		const hasHtml =
			!!corrections?.html?.chars &&
			!!corrections?.html?.chars.types &&
			!!corrections?.html?.chars.groupIds &&
			!!corrections?.html?.chars.lengths &&
			!!corrections?.html?.chars.starts;
		if (hasHtml) {
			const htmlFilterIndices = corrections?.html?.chars.types.reduce((indices, currentType, index) => {
				const groupId = corrections?.html?.chars.groupIds[index];
				const start = corrections.text.chars.starts[groupId];
				const length = corrections.text.chars.lengths[groupId];
				if (
					(filterOptions?.writingFeedback?.hiddenCategories ?? []).includes(currentType) ||
					(excludedCorrections ?? []).find(ex => ex.start === start && ex.end === start + length)
				) {
					indices.push(index);
				}
				return indices;
			}, [] as number[]);

			// Update both the text & html corrections ranges to filter the hidden categories
			htmlFilteredFeedback = {
				starts: corrections?.html?.chars.starts.filter((_, index) => !htmlFilterIndices.includes(index)),
				lengths: corrections?.html?.chars.lengths.filter((_, index) => !htmlFilterIndices.includes(index)),
				types: corrections?.html?.chars.types.filter((_, index) => !htmlFilterIndices.includes(index)),
				operationTexts: corrections?.html?.chars.operationTexts.filter(
					(_, index) => !htmlFilterIndices.includes(index)
				),
				groupIds: corrections?.html?.chars.groupIds.filter((_, index) => !htmlFilterIndices.includes(index)),
			};
		}

		const textFilterIndices = corrections.text.chars.types.reduce((indices, currentType, index) => {
			const start = corrections.text.chars.starts[index];
			const length = corrections.text.chars.lengths[index];
			if (
				(filterOptions?.writingFeedback?.hiddenCategories ?? []).includes(currentType) ||
				(excludedCorrections ?? []).find(ex => ex.start === start && ex.end === start + length)
			) {
				indices.push(index);
			}
			return indices;
		}, [] as number[]);
		const textFilteredFeedback: IWritingFeedbackRange = {
			starts: corrections.text.chars.starts.filter((_, index) => !textFilterIndices.includes(index)),
			lengths: corrections.text.chars.lengths.filter((_, index) => !textFilterIndices.includes(index)),
			types: corrections.text.chars.types.filter((_, index) => !textFilterIndices.includes(index)),
			operationTexts: corrections.text.chars.operationTexts.filter((_, index) => !textFilterIndices.includes(index)),
		};

		corrections.text.chars = textFilteredFeedback;
		if (hasHtml) corrections.html.chars = htmlFilteredFeedback;

		return corrections;
	}

	private _handleProgressErrorResponse(progress: IAPIProgress, endpointsConfig: IClsReportEndpointConfigModel) {
		this._viewSvc.progress$.next(100);
		const errorMessage = ERROR_MESSAGES[progress.errorCode] || $localize`Scan failed`;
		throw {
			status: 500,
			statusText: errorMessage,
			url: endpointsConfig.progress.url,
			headers: new HttpHeaders(),
			error: new Error(errorMessage),
			message: errorMessage,
		} as HttpErrorResponse;
	}

	private async _checkScanProgress(progress: IAPIProgress) {
		if (progress.status === EScanStatus.Error) {
			this._handleProgressErrorResponse(progress, this._reportEndpointConfig$.value);
			return;
		}

		if (progress.percents < 100 && progress.percents > 36 && !this._crawledVersion$.value) {
			const crawledVersion = await this._getReportCrawledVersion();
			this._crawledVersion$.next(crawledVersion);

			if (!crawledVersion?.html?.value)
				this._viewSvc.reportViewMode$.next({
					...this._viewSvc.reportViewMode,
					isHtmlView: false,
				});
		} else if (progress.percents === 100) {
			const completeResults = await this._getReportCompleteResults();
			// If completeResults didn't resolve (no URL configured, or empty response), stop
			// here — fetching crawledVersion / writingFeedback against an unexported scan would
			// just produce parallel failures.
			if (!completeResults) return;

			this.completeResultsSnapshot = JSON.parse(JSON.stringify(completeResults));
			this._scanResultsPreviews$.next(completeResults);
			this._updateCompleteResults(completeResults);

			if (!this._crawledVersion$.value) {
				const crawledVersion = await this._getReportCrawledVersion();
				this._crawledVersion$.next(crawledVersion);

				if (!crawledVersion?.html?.value)
					this._viewSvc.reportViewMode$.next({
						...this._viewSvc.reportViewMode,
						isHtmlView: false,
					});
			}

			if (
				this.reportEndpointConfig.writingFeedback &&
				this.reportEndpointConfig.writingFeedback.url &&
				this.isWritingFeedbackEnabled()
			) {
				const writingFeedback = await this._getReportWritingFeedback();
				this._writingFeedback$.next(writingFeedback);
			}
		}
	}

	private _updateCompleteResults(completeResultsRes?: ICompleteResults) {
		if (!completeResultsRes) return;

		// LMS-10324: chunk loading needs the host's `resultsChunk` endpoint and a valid `resultsExport` section whose ids
		// the complete results all list (read before the self-match results are merged below).
		this._setResultsExport(completeResultsRes);

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

		// Process self-match excluded results: tag them, merge into main arrays, and auto-exclude
		const selfMatchExcludedIds: string[] = [];
		const selfMatchExcluded = completeResultsRes.results.selfMatchExcluded;
		if (selfMatchExcluded) {
			const selfMatchTag = {
				code: RESULT_TAGS_CODES.SELF_MATCH,
				title: $localize`Self-Match`,
				description: $localize`This source was automatically excluded since it was submitted by the same student to another assignment in this course.`,
			};

			const tagAndCollect = (results: IResultPreviewBase[], type: EResultPreviewType) => {
				results.forEach(result => {
					result.type = type;
					if (!result.tags) result.tags = [];
					result.tags.unshift(selfMatchTag);
					selfMatchExcludedIds.push(result.id);
				});
			};

			tagAndCollect(selfMatchExcluded.internet ?? [], EResultPreviewType.Internet);
			tagAndCollect(selfMatchExcluded.database ?? [], EResultPreviewType.Database);
			tagAndCollect(selfMatchExcluded.batch ?? [], EResultPreviewType.Batch);
			tagAndCollect(selfMatchExcluded.repositories ?? [], EResultPreviewType.Repositroy);

			// Merge self-match results into main result arrays so they appear in excluded list
			completeResultsRes.results.internet = [
				...completeResultsRes.results.internet,
				...(selfMatchExcluded.internet ?? []),
			];
			completeResultsRes.results.database = [
				...completeResultsRes.results.database,
				...(selfMatchExcluded.database ?? []),
			];
			completeResultsRes.results.batch = [...completeResultsRes.results.batch, ...(selfMatchExcluded.batch ?? [])];
			completeResultsRes.results.repositories = [
				...(completeResultsRes.results.repositories ?? []),
				...(selfMatchExcluded.repositories ?? []),
			];
		}

		// Load the excluded results Ids.
		// First-ever load (no persisted filter state) → auto-exclude every self-match result so the
		// "exclude self match" indicator appears by default. Once the user has saved at least once,
		// `filters.execludedResultIds` is the source of truth — do NOT re-merge `selfMatchExcludedIds`,
		// otherwise any self-match result the user explicitly toggled to "include" would be re-excluded
		// on every refresh.
		const savedExcludedIds = completeResultsRes.filters?.execludedResultIds;
		const hasPersistedFilters = savedExcludedIds !== undefined;
		const mergedExcludedIds = hasPersistedFilters ? savedExcludedIds : Array.from(new Set(selfMatchExcludedIds));
		this._excludedResultsIds$.next(mergedExcludedIds);

		// Load the excluded corrections
		this._excludedCorrections$.next(completeResultsRes.filters?.writingFeedback?.excludedCorrections ?? []);

		// Load the filter options from the complete results response
		this._filterOptions$.next({
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
				completeResultsRes.filters?.sourceType?.yourResults != undefined &&
				completeResultsRes.filters?.sourceType?.othersResults != undefined
					? completeResultsRes.filters?.sourceType?.yourResults || completeResultsRes.filters?.sourceType?.othersResults
					: completeResultsRes.filters?.sourceType?.internalDatabase != undefined
					? completeResultsRes.filters?.sourceType?.internalDatabase
					: true,
			showYourResults:
				completeResultsRes.filters?.sourceType?.yourResults != undefined
					? completeResultsRes.filters?.sourceType?.yourResults
					: completeResultsRes.filters?.sourceType?.internalDatabase != undefined
					? completeResultsRes.filters?.sourceType?.internalDatabase
					: true,
			showOthersResults:
				completeResultsRes.filters?.sourceType?.othersResults != undefined
					? completeResultsRes.filters?.sourceType?.othersResults
					: completeResultsRes.filters?.sourceType?.internalDatabase != undefined
					? completeResultsRes.filters?.sourceType?.internalDatabase
					: true,
			showBatchResults:
				completeResultsRes.filters?.sourceType?.batch != undefined
					? completeResultsRes.filters?.sourceType?.batch
					: true,
			hiddenRepositories: completeResultsRes.filters?.sourceType?.repositories,
			showAISourceMatch:
				completeResultsRes.filters?.sourceType?.aiSourceMatch != undefined
					? completeResultsRes.filters?.sourceType?.aiSourceMatch
					: true,

			wordLimit: completeResultsRes.filters?.resultsMetaData?.wordLimit?.wordLimitEnabled
				? completeResultsRes.filters?.resultsMetaData?.wordLimit?.totalWordLimit
				: undefined,

			includeResultsWithoutDate:
				completeResultsRes.filters?.resultsMetaData?.publicationDate?.resultsWithNoDates != undefined
					? completeResultsRes.filters?.resultsMetaData?.publicationDate?.resultsWithNoDates
					: true,
			publicationDate: completeResultsRes.filters?.resultsMetaData?.publicationDate?.startDate,
			writingFeedback: {
				hiddenCategories: completeResultsRes.filters?.writingFeedback?.hiddenCategories ?? [],
			},
			excludedDomains: completeResultsRes.filters?.excludedDomains ?? [],
			minAIProportion: completeResultsRes.filters?.aiPhrases?.minProportion ?? 0,
		});

		const filteredResults = this.filterResults(this.filterOptions, this.excludedResultsIds);
		let filteredCorrections: IWritingFeedbackScanScource;
		if (this.writingFeedback) {
			filteredCorrections = this.filterCorrections(
				JSON.parse(JSON.stringify(this.writingFeedback?.corrections)),
				this.filterOptions,
				this.excludedCorrections
			);
		}
		const stats: ReportStatistics = this._getReportStats(
			filteredResults,
			completeResultsRes,
			filteredCorrections,
			this.writingFeedback
		);

		this._scanResultsPreviews$.next({
			...completeResultsRes,
			results: {
				...completeResultsRes.results,
				score: {
					identicalWords: stats.identical,
					minorChangedWords: stats.minorChanges,
					relatedMeaningWords: stats.relatedMeaning,
					aggregatedScore: this.isPlagiarismEnabled() ? stats.aggregatedScore ?? 0 : null,
					writingFeedbackOverallIssues: this.isWritingFeedbackEnabled() ? stats.writingFeedbackOverallIssues : null,
					writingFeedbackOverallScore: this.isWritingFeedbackEnabled() ? stats.writingFeedbackOverallScore : null,
				},
			},
			filters: {
				general: {
					alerts: this.filterOptions?.showAlerts ?? true,
					authorSubmissions: this.filterOptions?.showSameAuthorSubmissions ?? true,
					topResult: this.filterOptions?.showTop100Results ?? true,
				},
				includedTags: this.filterOptions?.includedTags,
				matchType: {
					identicalText: this.filterOptions?.showIdentical ?? true,
					minorChanges: this.filterOptions?.showMinorChanges ?? true,
					paraphrased: this.filterOptions?.showRelated ?? true,
				},
				resultsMetaData: {
					publicationDate: {
						publicationEnabled: !!this.filterOptions?.publicationDate,
						resultsWithNoDates: this.filterOptions?.includeResultsWithoutDate ?? true,
						startDate: this.filterOptions?.publicationDate,
					},
					wordLimit: {
						wordLimitEnabled: !!this.filterOptions?.wordLimit,
						totalWordLimit: this.filterOptions?.wordLimit,
					},
				},
				sourceType: {
					batch: this.filterOptions?.showBatchResults ?? true,
					internalDatabase: this.filterOptions?.showYourResults || this.filterOptions?.showOthersResults,
					internet: this.filterOptions?.showInternetResults ?? true,
					repositories: this.filterOptions?.hiddenRepositories ?? [],
					yourResults: this.filterOptions?.showYourResults ?? true,
					othersResults: this.filterOptions?.showOthersResults ?? true,
					aiSourceMatch: this.filterOptions?.showAISourceMatch ?? true,
				},
				execludedResultIds: this.excludedResultsIds ?? [],
				filteredResultIds: [],
				excludedDomains: this.filterOptions?.excludedDomains ?? [],
				aiPhrases: {
					minProportion: this.filterOptions?.minAIProportion ?? null,
				},
			},
		});

		if (this.filterOptions && this.excludedResultsIds) {
			// Load all the complete scan results
			this.loadViewedResultsDetails(this.isRealTimeView ? false : true);
		}
	}

	private _getReportStats(
		filteredResults: ResultDetailItem[],
		completeResultsRes: ICompleteResults,
		filteredCorrections?: IWritingFeedbackScanScource,
		writingFeedback?: IWritingFeedback
	) {
		const showAll =
			this.filterOptions?.showIdentical && this.filterOptions?.showMinorChanges && this.filterOptions?.showRelated;

		const numberOfOriginalResults = this.totalOriginalCompleteResults;
		let stats: ReportStatistics;
		if (
			this.totalCompleteResults != filteredResults.length ||
			!showAll ||
			!this.completeResultsSnapshot ||
			numberOfOriginalResults != this.totalCompleteResults ||
			(this.isWritingFeedbackEnabled() &&
				this.writingFeedback &&
				this.writingFeedback?.corrections.text.chars.operationTexts?.length !=
					filteredCorrections?.text?.chars?.operationTexts?.length)
		) {
			stats = helpers.calculateStatistics(completeResultsRes, filteredResults, this.filterOptions);

			if (
				this.isWritingFeedbackEnabled() &&
				this.writingFeedback &&
				this.writingFeedback?.corrections.text.chars.operationTexts?.length !=
					filteredCorrections?.text?.chars?.operationTexts?.length
			) {
				const wfStats = helpers.getWritingFeedbackStatistics(
					writingFeedback?.score,
					filteredCorrections,
					completeResultsRes?.scannedDocument?.totalWords
				);
				stats.writingFeedbackOverallIssues = wfStats.overallTotalIssues;
				stats.writingFeedbackOverallScore = wfStats.overallScore;
			} else {
				stats.writingFeedbackOverallIssues = filteredCorrections?.text?.chars?.operationTexts?.length ?? 0;
				stats.writingFeedbackOverallScore =
					(this.completeResultsSnapshot?.writingFeedback?.score?.overallScore ?? 0) / 100;
			}
		} else {
			// * if results are still loading  or no results are fitlered while all match types are visible
			// * we can use the complete result stats without heavy calculations
			const aiStatistics = helpers.getAiStatistics(completeResultsRes);
			stats = {
				aggregatedScore: (this.completeResultsSnapshot.results?.score?.aggregatedScore ?? 0) / 100,
				identical: this.completeResultsSnapshot.results.score.identicalWords,
				relatedMeaning: this.completeResultsSnapshot.results.score.relatedMeaningWords,
				minorChanges: this.completeResultsSnapshot.results.score.minorChangedWords,
				omittedWords: this.completeResultsSnapshot.scannedDocument.totalExcluded,
				total: this.completeResultsSnapshot.scannedDocument.totalWords,
				aiScore: aiStatistics?.ai ?? 0,
				humanScore: aiStatistics?.human ?? 0,
				writingFeedbackOverallScore: (this.completeResultsSnapshot?.writingFeedback?.score?.overallScore ?? 0) / 100,
				writingFeedbackOverallIssues: filteredCorrections?.text?.chars?.operationTexts?.length ?? 0,
			};
		}

		// LMS-10324 (chunk mode only): never a score computed from part of the shown results - the host may store it.
		return this._applyChunkModeStatistics(stats);
	}

	private _createHeaders(endpointDetails: IEndpointDetails): HttpHeaders {
		// Create HttpHeaders using the authToken and any additional headers provided in the endpoint details
		return new HttpHeaders({
			...endpointDetails.headers,
		});
	}

	private _getReportScanProgress() {
		if (!this._reportEndpointConfig$.value || !this._reportEndpointConfig$.value.progress?.url) return EMPTY;

		return this._http
			.get<IAPIProgress>(this._reportEndpointConfig$.value.progress.url, {
				headers: this._createHeaders(this._reportEndpointConfig$.value.progress),
			})
			.pipe(retryWithDelay());
	}

	private async _getReportCrawledVersion() {
		if (!this._reportEndpointConfig$.value || !this._reportEndpointConfig$.value.crawledVersion?.url) return undefined;

		return await this._http
			.get<IScanSource>(this._reportEndpointConfig$.value.crawledVersion.url, {
				headers: this._createHeaders(this._reportEndpointConfig$.value.crawledVersion),
			})
			.pipe(retryWithDelay())
			.toPromise();
	}

	private async _getReportCompleteResults() {
		if (!this._reportEndpointConfig$.value || !this._reportEndpointConfig$.value.completeResults?.url) return undefined;

		return await this._http
			.get<ICompleteResults>(this._reportEndpointConfig$.value.completeResults.url, {
				headers: this._createHeaders(this._reportEndpointConfig$.value.completeResults),
			})
			.pipe(retryWithDelay())
			.toPromise();
	}

	private async _getReportWritingFeedback() {
		if (!this._reportEndpointConfig$.value || !this._reportEndpointConfig$.value.completeResults?.url) return undefined;

		return await this._http
			.get<IWritingFeedback>(this._reportEndpointConfig$.value.writingFeedback.url, {
				headers: this._createHeaders(this._reportEndpointConfig$.value.writingFeedback),
			})
			.pipe(retryWithDelay())
			.toPromise();
	}

	private _getFilteredResultsIds(
		settings: ICopyleaksReportOptions,
		completeResults: (IInternetResultPreview | IDatabaseResultPreview | IRepositoryResultPreview)[],
		excludedResultsIds: string[]
	) {
		if (settings.showTop100Results !== undefined && settings.showTop100Results === true)
			completeResults = completeResults.sort((a, b) => b.matchedWords - a.matchedWords).slice(0, 100);

		let filteredResultsIds: string[] = completeResults
			.filter(r => !excludedResultsIds.find(id => id === r.id))
			.map(result => result.id);

		if (filteredResultsIds && filteredResultsIds.length === 0) return [];

		if (settings.showInternetResults !== undefined && settings.showInternetResults === false)
			filteredResultsIds = filteredResultsIds.filter(id =>
				completeResults.find(
					cr =>
						cr.id === id &&
						(cr.type !== EResultPreviewType.Internet ||
							cr.tags?.find(t => t.code === RESULT_TAGS_CODES.AI_SOURCE_MATCH))
				)
			);

		if (settings.showBatchResults !== undefined && settings.showBatchResults === false)
			filteredResultsIds = filteredResultsIds.filter(id =>
				completeResults.find(
					cr =>
						cr.id === id &&
						(cr.type !== EResultPreviewType.Batch || cr.tags?.find(t => t.code === RESULT_TAGS_CODES.AI_SOURCE_MATCH))
				)
			);

		if (
			settings.showInternalDatabaseResults !== undefined &&
			settings.showYourResults === false &&
			settings.showOthersResults === false
		)
			filteredResultsIds = filteredResultsIds.filter(id =>
				completeResults.find(
					cr =>
						cr.id === id &&
						(cr.type !== EResultPreviewType.Database ||
							cr.tags?.find(t => t.code === RESULT_TAGS_CODES.AI_SOURCE_MATCH))
				)
			);
		else if (settings.showInternalDatabaseResults !== undefined && settings.showYourResults === false)
			filteredResultsIds = filteredResultsIds.filter(id =>
				completeResults.find(
					cr =>
						cr.id === id &&
						(cr.type !== EResultPreviewType.Database ||
							!cr.scanId ||
							cr.tags?.find(t => t.code === RESULT_TAGS_CODES.AI_SOURCE_MATCH))
				)
			);
		else if (settings.showInternalDatabaseResults !== undefined && settings.showOthersResults === false)
			filteredResultsIds = filteredResultsIds.filter(id =>
				completeResults.find(
					cr =>
						cr.id === id &&
						(cr.type !== EResultPreviewType.Database ||
							!!cr.scanId ||
							cr.tags?.find(t => t.code === RESULT_TAGS_CODES.AI_SOURCE_MATCH))
				)
			);

		if (settings.hiddenRepositories !== undefined && settings.hiddenRepositories.length > 0) {
			filteredResultsIds = filteredResultsIds.filter(id =>
				completeResults.find(
					cr =>
						cr.id === id &&
						(cr.type !== EResultPreviewType.Repositroy ||
							!settings.hiddenRepositories?.find(id => id === (cr as IRepositoryResultPreview)?.repositoryId) ||
							cr.tags?.find(t => t.code === RESULT_TAGS_CODES.AI_SOURCE_MATCH))
				)
			);
		}

		if (settings.showAISourceMatch !== undefined && settings.showAISourceMatch === false)
			filteredResultsIds = filteredResultsIds.filter(id =>
				completeResults.find(cr => cr.id === id && !cr.tags?.find(t => t.code === RESULT_TAGS_CODES.AI_SOURCE_MATCH))
			);

		if (!!settings.wordLimit)
			filteredResultsIds = filteredResultsIds.filter(id =>
				completeResults.find(cr => cr.id === id && cr.matchedWords >= (settings.wordLimit ?? 0))
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
				completeResults.find(cr => cr.id === id && cr.tags?.find(t => settings.includedTags?.includes(t.title)))
			);

		if (settings.excludedDomains && settings.excludedDomains.length > 0)
			filteredResultsIds = filteredResultsIds.filter(id =>
				// check if the result is from the internet and the domain is not excluded, the domain exclude must check if it has the domain in case also the excluded domain is like copyleaks.com
				completeResults.find(
					cr =>
						cr.id === id &&
						(cr.type !== EResultPreviewType.Internet ||
							!settings.excludedDomains?.find(domain => cr.url && cr.url?.includes(domain)))
				)
			);
		return filteredResultsIds;
	}

	pushNewResults(newResults: ResultPreview[]) {
		if (!this.reportEndpointConfig || !newResults || !this.crawledVersion) return;

		// Remove duplicates from newResults based on the id
		const uniqueIds = new Set();
		const filteredNewResults = newResults.filter(result => {
			if (!uniqueIds.has(result.id)) {
				uniqueIds.add(result.id);
				return true;
			}
			return false;
		});
		newResults = filteredNewResults;

		// check for only *new* results, i.e. don't add new results that exists already
		const existingResults = this._newResults$.value || [];
		const uniqueNewResults = newResults.filter(
			newResult => !existingResults.some(existingResult => existingResult.resultPreview.id === newResult.id)
		);

		// Put all the results IDs in one lits
		const resultsIds = [...uniqueNewResults.map(result => result.id)];

		// But the results ids in a list of batches (10 each)
		const batchSize = 10;
		const idBatches = [];
		for (let i = 0; i < resultsIds.length; i += batchSize) {
			idBatches.push(resultsIds.slice(i, i + batchSize));
		}

		// Calculate the total number of batches you'll have
		const totalBatches = idBatches.length;
		let currentBatchIndex = 0; // Initialize a variable to keep track of the current batch index

		if (totalBatches === 0) this._newResults$.next([]);

		this._loadedResultsDetails$ = [];

		// Send the GET results requests in batches
		const fetchResultsBatches = from(idBatches);
		fetchResultsBatches
			.pipe(
				concatMap(ids => {
					currentBatchIndex++; // Increment the current batch index each time a new batch starts
					return forkJoin(...ids.map(id => this.getReportResultAsync(id, true)));
				}),
				untilDestroy(this)
			)
			.subscribe((results: ResultDetailItem[]) => {
				if (results) {
					// Add the new fetched results to the Cache subject
					this._loadedResultsDetails$ = [...this._loadedResultsDetails$, ...results] as ResultDetailItem[];

					this.scanResultsDetails$.next([...(this.scanResultsDetails ?? []), ...this._loadedResultsDetails$]);

					// Check if this is the last batch
					if (currentBatchIndex === totalBatches) {
						const mappedResults = this._loadedResultsDetails$.map(resultDetail => {
							const foundResultDetail = newResults?.find(r => r.id === resultDetail.id);
							return {
								resultPreview: foundResultDetail,
								resultDetails: resultDetail,
								iStatisticsResult: resultDetail?.result?.statistics,
								metadataSource: {
									words: this.crawledVersion?.metadata.words ?? 0,
									excluded: this.crawledVersion?.metadata.excluded ?? 0,
								},
							} as IResultItem;
						});
						const allNewResults = [...existingResults, ...mappedResults].sort(
							(a, b) => b.resultPreview.matchedWords - a.resultPreview.matchedWords
						);
						this._newResults$.next(allNewResults);
					}
				}
			});
	}

	ngOnDestroy() {
		// LMS-10324: Angular calls this method of a component-provided service directly, so the chunk round in flight
		// (and its requests) stops here.
		this._resultChunksRound?.unsubscribe();
	}
}
