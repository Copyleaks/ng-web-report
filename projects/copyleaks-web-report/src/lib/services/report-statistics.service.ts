import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { distinct, filter } from 'rxjs/operators';
import * as helpers from '../utils/report-statistics-helpers';
import { ReportStatistics } from '../models/report-statistics.models';
import { ICompleteResults } from '../models/report-data.models';
import { ResultDetailItem } from '../models/report-matches.models';
import { CopyleaksReportOptions } from '../models/report-options.models';
import { untilDestroy } from '../utils/until-destroy';
import { ReportDataService } from './report-data.service';
import { ReportViewService } from './report-view.service';

@Injectable()
export class ReportStatisticsService implements OnDestroy {
	private _statistics = new BehaviorSubject<ReportStatistics | undefined>(undefined);
	constructor(private _reportDataSvc: ReportDataService, private _reportViewSvc: ReportViewService) {
		const { scanResultsPreviews$, scanResultsDetails$ } = this._reportDataSvc;
		const { selectedResult$, reportViewMode$ } = this._reportViewSvc;

		combineLatest([scanResultsPreviews$, selectedResult$, reportViewMode$])
			.pipe(
				untilDestroy(this),
				filter(([, suspect, viewModeData]) => viewModeData?.viewMode === 'one-to-one' && !!suspect)
			)
			.subscribe(([completeResult, suspect]) => {
				if (completeResult && suspect)
					this.retreiveOneToOneStatistics(completeResult, suspect, {
						showRelated: true,
						showIdentical: true,
						showMinorChanges: true,
						showPageSources: true,
						showOnlyTopResults: true,
						setAsDefault: true,
					} as CopyleaksReportOptions);
			});

		combineLatest([scanResultsPreviews$, scanResultsDetails$, reportViewMode$])
			.pipe(
				untilDestroy(this),
				filter(([, , viewModeData]) => viewModeData?.viewMode === 'one-to-many')
			)
			.subscribe(([completeResult, results]) => {
				if (completeResult)
					this.retreieveOneToManyStatistics(completeResult, results ?? [], results ?? [], {
						showRelated: true,
						showIdentical: true,
						showMinorChanges: true,
						showPageSources: true,
						showOnlyTopResults: true,
						setAsDefault: true,
					} as CopyleaksReportOptions);
			});
	}

	public statistics$ = this._statistics.asObservable().pipe(distinct());
	/**
	 * Retreive statistics for a one-to-one comparison using the complete result, suspect, and report options
	 * @param completeResult The complete result - contains the count of total words and excluded words in the document
	 * @param suspect the currently viewed suspect Result
	 * @param options the current report options
	 */
	retreiveOneToOneStatistics(
		completeResult: ICompleteResults,
		suspect: ResultDetailItem,
		options: CopyleaksReportOptions
	) {
		this._statistics.next({
			identical: options.showIdentical && suspect.result ? suspect.result.statistics.identical : 0,
			relatedMeaning: options.showRelated && suspect.result ? suspect.result.statistics.relatedMeaning : 0,
			minorChanges: options.showMinorChanges && suspect.result ? suspect.result.statistics.minorChanges : 0,
			omittedWords: completeResult.scannedDocument.totalExcluded,
			total: completeResult.scannedDocument.totalWords,
			aiScore: helpers.calculateAiScore(completeResult),
		});
	}

	/**
	 * Retreive statistics for a one-to-many comparison using the complete result, results,filtered results, and report options
	 * @param completeResult the complete result
	 * @param results list of result items containing all the results from the current scan
	 * @param filteredResults list of results filtered by user settings, will be the same as `results` when no filter applied
	 * @param options the current report options
	 */
	retreieveOneToManyStatistics(
		completeResult: ICompleteResults,
		results: ResultDetailItem[],
		filteredResults: ResultDetailItem[],
		options: CopyleaksReportOptions
	) {
		const totalResults =
			(completeResult.results.repositories && completeResult.results.repositories.length
				? completeResult.results.repositories.length
				: 0) +
			completeResult.results.batch.length +
			completeResult.results.internet.length +
			completeResult.results.database.length;
		const showAll = options.showIdentical && options.showMinorChanges && options.showRelated;
		const missingAggregated = totalResults !== 0 && completeResult.results.score.aggregatedScore === 0;
		let stats: ReportStatistics;
		if (
			(!completeResult.filters || !completeResult.filters.resultIds || !completeResult.filters.resultIds.length) &&
			(results.length !== totalResults || (totalResults === filteredResults.length && showAll && !missingAggregated))
		) {
			// * if results are still loading  or no results are fitlered while all match types are visible
			// * we can use the complete result stats without heavy calculations
			stats = {
				identical: completeResult.results.score.identicalWords,
				relatedMeaning: completeResult.results.score.relatedMeaningWords,
				minorChanges: completeResult.results.score.minorChangedWords,
				omittedWords: completeResult.scannedDocument.totalExcluded,
				total: completeResult.scannedDocument.totalWords,
				aiScore: helpers.calculateAiScore(completeResult),
			};
		} else {
			stats = helpers.calculateStatistics(completeResult, filteredResults, options);
		}
		this._statistics.next(stats);
	}

	/** dtor */
	ngOnDestroy() {
		this._statistics.complete();
	}
}
