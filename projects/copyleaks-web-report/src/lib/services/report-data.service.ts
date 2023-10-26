import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
	ICompleteResults,
	IResultDetailResponse as IResultDetailResponse,
	IScanSource,
} from '../models/report-data.models';
import { BehaviorSubject, forkJoin, from } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { ResultDetailItem } from '../models/report-matches.models';
import { IClsReportEndpointConfigModel } from '../models/report-config.models';
import { untilDestroy } from '../utils/until-destroy';
import { EResultPreviewType } from '../enums/copyleaks-web-report.enums';

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

	constructor(private _http: HttpClient) {}

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

	ngOnDestroy() {}
}
