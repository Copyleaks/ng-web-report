import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription, concatMap, forkJoin, from, map } from 'rxjs';
import {
	IClsReportEndpointConfigModel,
	ICompleteResults,
	IScanResult,
	IScanSource,
} from '../models/copyleaks-report-data.models';

@Injectable()
export class CopyleaksReportDataService {
	private _reportEndpointConfig$ = new BehaviorSubject<IClsReportEndpointConfigModel | undefined>(undefined);
	/**
	 * Subject for sharing the report data endpoints.
	 */
	public get reportEndpointConfigSubject$() {
		return this._reportEndpointConfig$;
	}
	/**
	 * Getter for the report data endpoints.
	 */
	public get reportEndpointConfig() {
		return this._reportEndpointConfig$.value;
	}

	private _scanResults$ = new BehaviorSubject<IScanResult[] | undefined>(undefined);
	/**
	 * Subject for sharing the report complete results.
	 */
	public get scanResultsSubject$() {
		return this._scanResults$;
	}
	/**
	 * Getter for the report complete results.
	 */
	public get scanResults() {
		return this._scanResults$.value;
	}

	private _crawledVersion$ = new BehaviorSubject<IScanSource | undefined>(undefined);
	/**
	 * Subject for sharing the report complete results.
	 */
	public get crawledVersionSubject$() {
		return this._crawledVersion$;
	}
	/**
	 * Getter for the report complete results.
	 */
	public get crawledVersion() {
		return this._crawledVersion$.value;
	}

	private subscriptions: Subscription[] = [];

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

		const sub = forkJoin([crawledVersionReq, completeResultsReq]).subscribe(
			([crawledVersionRes, completeResultsRes]) => {
				console.log('Crawled Version', crawledVersionRes);
				console.log('Complete Results', completeResultsRes);

				this._crawledVersion$.next(crawledVersionRes);

				// Load all the complete scan results
				this.loadAllReportScanResults(completeResultsRes);
			},
			error => {
				// TODO: Error handling
				console.error('Error occurred:', error);
			}
		);

		this.subscriptions.push(sub);
	}

	public loadAllReportScanResults(completeResults: ICompleteResults) {
		const cachedResults = this._scanResults$.getValue();

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

			// Send the GET results requests in batches
			const fetchResultsBatches = from(idBatches);
			const sub = fetchResultsBatches
				.pipe(concatMap(ids => forkJoin(...ids.map(id => this.getReportResultAsync(id)))))
				.subscribe(results => {
					if (results) {
						console.log(results);

						// Add the new fetched results to the Cache subject
						const fetchedResults: IScanResult[] = this._scanResults$.value ?? [];
						this._scanResults$.next([...fetchedResults, ...results] as IScanResult[]);
					}
				});

			this.subscriptions.push(sub);
		}
	}

	public async getReportResultAsync(resultId: string) {
		if (!this._reportEndpointConfig$?.value?.result) return;

		var requestUrl = this._reportEndpointConfig$.value.result.replace('{RESULT_ID}', resultId);

		// TODO: ONLY FOR DEMO - REMOVE LATER
		requestUrl += '.json';

		return await this._http.get<IScanResult>(requestUrl).toPromise();
	}

	ngOnDestroy() {
		if (this.subscriptions && this.subscriptions.length > 0) this.subscriptions.forEach(sub => sub.unsubscribe());
	}
}
