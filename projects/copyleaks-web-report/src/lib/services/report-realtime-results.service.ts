import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, from } from 'rxjs';
import { concatMap, filter } from 'rxjs/operators';
import { IResultItem } from '../components/containers/report-results-item-container/components/models/report-result-item.models';
import { ResultPreview } from '../models/report-data.models';
import { ResultDetailItem } from '../models/report-matches.models';
import { untilDestroy } from '../utils/until-destroy';
import { ReportDataService } from './report-data.service';

@Injectable()
export class ReportRealtimeResultsService {
	private _newResults$ = new BehaviorSubject<IResultItem[] | undefined>([]);
	/** Emits matches that are relevant to source html one-to-many mode */
	public get newResults$() {
		return this._newResults$;
	}
	public get newResults() {
		return this._newResults$.value;
	}

	private _loadedResultsDetails$: ResultDetailItem[] = [];

	constructor(private _reportDataService: ReportDataService) {}

	/**
	 * Function that adds new results to the report real-time view,
	 * these result will be added to the already existing results & will be available for one-to-one view
	 * @param newResults List of new results for real time view
	 */
	public pushNewResults(newResults: ResultPreview[]): void {
		this._reportDataService.reportEndpointConfig$
			.pipe(
				filter(value => value !== undefined),
				untilDestroy(this)
			)
			.subscribe(_ => {
				if (!newResults) return;

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

				// Send the GET results requests in batches
				const fetchResultsBatches = from(idBatches);
				fetchResultsBatches
					.pipe(
						concatMap(ids => {
							currentBatchIndex++; // Increment the current batch index each time a new batch starts
							return forkJoin(...ids.map(id => this._reportDataService.getReportResultAsync(id)));
						}),
						untilDestroy(this)
					)
					.subscribe((results: ResultDetailItem[]) => {
						if (results) {
							// Add the new fetched results to the Cache subject
							this._loadedResultsDetails$ = [...this._loadedResultsDetails$, ...results] as ResultDetailItem[];

							this._reportDataService.scanResultsDetails$.next(this._loadedResultsDetails$);

							// Check if this is the last batch
							if (currentBatchIndex === totalBatches) {
								const mappedResults = this._loadedResultsDetails$.map(resultDetail => {
									const foundResultDetail = newResults?.find(r => r.id === resultDetail.id);
									return {
										resultPreview: foundResultDetail,
										resultDetails: resultDetail,
										iStatisticsResult: resultDetail?.result?.statistics,
										metadataSource: {
											words: this._reportDataService.crawledVersion?.metadata.words ?? 0,
											excluded: this._reportDataService.crawledVersion?.metadata.excluded ?? 0,
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
			});
	}

	ngOnDestroy(): void {}
}
