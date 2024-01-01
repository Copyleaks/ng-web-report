import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { distinct, filter } from 'rxjs/operators';
import { ICompleteResults } from '../models/report-data.models';
import { ResultDetailItem } from '../models/report-matches.models';
import { ICopyleaksReportOptions } from '../models/report-options.models';
import { ReportStatistics } from '../models/report-statistics.models';
import * as helpers from '../utils/report-statistics-helpers';
import { untilDestroy } from '../utils/until-destroy';
import { ReportDataService } from './report-data.service';
import { ReportViewService } from './report-view.service';

@Injectable()
export class ReportStatisticsService implements OnDestroy {
	private _statistics = new BehaviorSubject<ReportStatistics | undefined>(undefined);
	public statistics$ = this._statistics.asObservable().pipe(distinct());

	constructor(private _reportDataSvc: ReportDataService, private _reportViewSvc: ReportViewService) {
		const { scanResultsPreviews$, scanResultsDetails$, excludedResultsIds$, filterOptions$ } = this._reportDataSvc;
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
					} as ICopyleaksReportOptions);
			});

		combineLatest([scanResultsPreviews$, scanResultsDetails$, reportViewMode$, excludedResultsIds$, filterOptions$])
			.pipe(
				untilDestroy(this),
				filter(
					([, , viewModeData, excludedResultsIds, filterOptions]) =>
						(viewModeData?.viewMode === 'one-to-many' || viewModeData?.viewMode === 'only-ai') &&
						excludedResultsIds != undefined &&
						filterOptions != undefined
				)
			)
			.subscribe(([completeResult, results, , excludedResultsIds, filterOptions]) => {
				if (completeResult && filterOptions && excludedResultsIds) {
					const filteredResults = this._reportDataSvc.filterResults(filterOptions, excludedResultsIds);
					this.retreieveOneToManyStatistics(completeResult, results ?? [], filteredResults, filterOptions);
				}
			});
	}

	/**
	 * Retreive statistics for a one-to-one comparison using the complete result, suspect, and report options
	 * @param completeResult The complete result - contains the count of total words and excluded words in the document
	 * @param suspect the currently viewed suspect Result
	 * @param options the current report options
	 */
	retreiveOneToOneStatistics(
		completeResult: ICompleteResults,
		suspect: ResultDetailItem,
		options: ICopyleaksReportOptions
	) {
		const aiStatistics = helpers.getAiStatistics(completeResult);
		this._statistics.next({
			identical: options.showIdentical && suspect.result ? suspect.result.statistics.identical : 0,
			relatedMeaning: options.showRelated && suspect.result ? suspect.result.statistics.relatedMeaning : 0,
			minorChanges: options.showMinorChanges && suspect.result ? suspect.result.statistics.minorChanges : 0,
			omittedWords: completeResult.scannedDocument.totalExcluded,
			total: completeResult.scannedDocument.totalWords,
			aiScore: aiStatistics?.ai ?? 0,
			humanScore: aiStatistics?.human ?? 0,
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
		options: ICopyleaksReportOptions
	) {
		const showAll = options.showIdentical && options.showMinorChanges && options.showRelated;
		const missingAggregated =
			this._reportDataSvc.totalCompleteResults !== 0 && completeResult.results.score.aggregatedScore === 0;
		let stats: ReportStatistics;
		if (this._reportDataSvc.totalCompleteResults != filteredResults.length || !showAll || missingAggregated) {
			stats = helpers.calculateStatistics(completeResult, filteredResults, options);
		} else {
			// * if results are still loading  or no results are fitlered while all match types are visible
			// * we can use the complete result stats without heavy calculations
			const aiStatistics = helpers.getAiStatistics(completeResult);
			stats = {
				aggregatedScore: this._reportDataSvc.completeResultsSnapshot?.results?.score?.aggregatedScore ?? 0,
				identical: this._reportDataSvc.completeResultsSnapshot?.results?.score?.identicalWords ?? 0,
				relatedMeaning: this._reportDataSvc.completeResultsSnapshot?.results?.score?.relatedMeaningWords ?? 0,
				minorChanges: this._reportDataSvc.completeResultsSnapshot?.results?.score?.minorChangedWords ?? 0,
				omittedWords: this._reportDataSvc.completeResultsSnapshot?.scannedDocument?.totalExcluded ?? 0,
				total: this._reportDataSvc.completeResultsSnapshot?.scannedDocument?.totalWords,
				aiScore: aiStatistics?.ai ?? 0,
				humanScore: aiStatistics?.human ?? 0,
			};
		}

		this._statistics.next(stats);
	}

	/** dtor */
	ngOnDestroy() {
		this._statistics.complete();
	}
}
