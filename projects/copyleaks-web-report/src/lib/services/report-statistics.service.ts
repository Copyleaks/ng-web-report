import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { distinct, distinctUntilChanged, filter } from 'rxjs/operators';
import {
	ICompleteResults,
	IExcludedCorrection,
	IWritingFeedback,
	IWritingFeedbackScanScource,
} from '../models/report-data.models';
import { ResultDetailItem } from '../models/report-matches.models';
import { ICopyleaksReportOptions } from '../models/report-options.models';
import { IWritingFeedbackTypeStatistics, ReportStatistics } from '../models/report-statistics.models';
import * as helpers from '../utils/report-statistics-helpers';
import { untilDestroy } from '../utils/until-destroy';
import { ReportDataService } from './report-data.service';
import { ReportViewService } from './report-view.service';
import { IReportViewEvent } from '../models/report-view.models';
import { EWritingFeedbackTypes, EWritingFeedbackCategories } from '../enums/copyleaks-web-report.enums';

@Injectable()
export class ReportStatisticsService implements OnDestroy {
	private _statistics = new BehaviorSubject<ReportStatistics | undefined>(undefined);
	public statistics$ = this._statistics.asObservable().pipe(distinct());

	constructor(private _reportDataSvc: ReportDataService, private _reportViewSvc: ReportViewService) {
		const {
			scanResultsPreviews$,
			scanResultsDetails$,
			excludedResultsIds$,
			filterOptions$,
			writingFeedback$,
			excludedCorrections$,
		} = this._reportDataSvc;
		const { selectedResult$, reportViewMode$ } = this._reportViewSvc;

		combineLatest([
			scanResultsPreviews$.pipe(distinctUntilChanged()),
			selectedResult$.pipe(distinctUntilChanged()),
			reportViewMode$.pipe(distinctUntilChanged()),
		])
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

		combineLatest([
			scanResultsPreviews$.pipe(distinctUntilChanged()),
			scanResultsDetails$.pipe(distinctUntilChanged()),
			reportViewMode$.pipe(distinctUntilChanged()),
			excludedResultsIds$.pipe(distinctUntilChanged()),
			filterOptions$.pipe(distinctUntilChanged()),
			writingFeedback$.pipe(distinctUntilChanged()),
			excludedCorrections$.pipe(distinctUntilChanged()),
		])
			.pipe(
				untilDestroy(this),
				filter(
					([, , viewModeData, excludedResultsIds, filterOptions, ,]: [
						ICompleteResults,
						ResultDetailItem[],
						IReportViewEvent,
						string[],
						ICopyleaksReportOptions,
						IWritingFeedback,
						IExcludedCorrection[]
					]) =>
						(viewModeData?.viewMode === 'one-to-many' ||
							viewModeData?.viewMode === 'only-ai' ||
							viewModeData?.viewMode === 'writing-feedback') &&
						excludedResultsIds != undefined &&
						filterOptions != undefined
				)
			)
			.subscribe(([completeResult, , , excludedResultsIds, filterOptions, writingFeedback, excludedCorrections]) => {
				if (completeResult && filterOptions && excludedResultsIds) {
					const isRealtimeInitView =
						this._reportDataSvc.isRealTimeView &&
						!this._reportDataSvc.isFilterOn &&
						(!this._reportDataSvc.excludedResultsIds || this._reportDataSvc.excludedResultsIds.length === 0);

					const filteredResults = this._reportDataSvc.filterResults(filterOptions, excludedResultsIds);
					let filteredCorrections: IWritingFeedbackScanScource;
					if (writingFeedback) {
						filteredCorrections = this._reportDataSvc.filterCorrections(
							JSON.parse(JSON.stringify(writingFeedback?.corrections)),
							filterOptions,
							excludedCorrections
						);
					}
					if (isRealtimeInitView && this._reportDataSvc.totalCompleteResults != filteredResults.length) return;
					this.retreieveOneToManyStatistics(
						completeResult,
						filteredResults,
						filterOptions,
						filteredCorrections,
						writingFeedback
					);
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
		filteredResults: ResultDetailItem[],
		options: ICopyleaksReportOptions,
		filteredCorrections?: IWritingFeedbackScanScource,
		writingFeedback?: IWritingFeedback
	) {
		const showAll = options.showIdentical && options.showMinorChanges && options.showRelated;
		const missingAggregated =
			this._reportDataSvc.totalCompleteResults !== 0 && completeResult.results.score.aggregatedScore === 0;
		const numberOfOriginalResults = this._reportDataSvc.totalOriginalCompleteResults;
		let stats: ReportStatistics;
		if (
			this._reportDataSvc.totalCompleteResults != filteredResults.length ||
			!showAll ||
			missingAggregated ||
			!this._reportDataSvc.completeResultsSnapshot ||
			numberOfOriginalResults != this._reportDataSvc.totalCompleteResults
		) {
			stats = helpers.calculateStatistics(completeResult, filteredResults, options);

			if (
				this._reportDataSvc.isWritingFeedbackEnabled() &&
				this._reportDataSvc.writingFeedback &&
				this._reportDataSvc.writingFeedback?.corrections.text.chars.operationTexts?.length !=
					filteredCorrections?.text?.chars?.operationTexts?.length
			) {
				const wfStats = helpers.getWritingFeedbackStatistics(
					writingFeedback?.score,
					filteredCorrections,
					completeResult.scannedDocument?.totalWords
				);
				stats.writingFeedbackOverallIssues = wfStats.overallTotalIssues;
				stats.writingFeedbackOverallScore = wfStats.overallScore;
			} else {
				stats.writingFeedbackOverallIssues = filteredCorrections?.text?.chars?.operationTexts?.length ?? 0;
				stats.writingFeedbackOverallScore =
					(this._reportDataSvc.completeResultsSnapshot?.writingFeedback?.score?.overallScore ?? 0) / 100;
			}
		} else {
			// * if results are still loading  or no results are fitlered while all match types are visible
			// * we can use the complete result stats without heavy calculations
			const aiStatistics = helpers.getAiStatistics(completeResult);
			stats = {
				aggregatedScore: (this._reportDataSvc.completeResultsSnapshot?.results?.score?.aggregatedScore ?? 0) / 100,
				identical: this._reportDataSvc.completeResultsSnapshot?.results?.score?.identicalWords ?? 0,
				relatedMeaning: this._reportDataSvc.completeResultsSnapshot?.results?.score?.relatedMeaningWords ?? 0,
				minorChanges: this._reportDataSvc.completeResultsSnapshot?.results?.score?.minorChangedWords ?? 0,
				omittedWords: this._reportDataSvc.completeResultsSnapshot?.scannedDocument?.totalExcluded ?? 0,
				total: this._reportDataSvc.completeResultsSnapshot?.scannedDocument?.totalWords,
				aiScore: aiStatistics?.ai ?? 0,
				humanScore: aiStatistics?.human ?? 0,
				writingFeedbackOverallScore:
					(this._reportDataSvc.completeResultsSnapshot?.writingFeedback?.score?.overallScore ?? 0) / 100,
				writingFeedbackOverallIssues: filteredCorrections?.text?.chars?.operationTexts?.length ?? 0,
			};
		}

		this._statistics.next(stats);
	}

	public initCorrectionsStatistics(): IWritingFeedbackTypeStatistics[] {
		return [
			{
				type: EWritingFeedbackTypes.General,
				categories: [
					{
						type: EWritingFeedbackCategories.General,
						totalIssues: 0,
					},
				],
			},
			{
				type: EWritingFeedbackTypes.Grammar,
				categories: [
					{
						type: EWritingFeedbackCategories.SubjectVerbDisagreement,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.NounForm,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.VerbForm,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.Article,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.Preposition,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.Pronoun,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.PartOfSpeech,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.Conjunction,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.HomoglyphError,
						totalIssues: 0,
					},
				],
			},
			{
				type: EWritingFeedbackTypes.WordChoice,
				categories: [
					{
						type: EWritingFeedbackCategories.MisusedWord,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.Homophone,
						totalIssues: 0,
					},
				],
			},
			{
				type: EWritingFeedbackTypes.Mechanics,
				categories: [
					{
						type: EWritingFeedbackCategories.Capitalization,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.Hyphen,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.Punctuation,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.Comma,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.Apostrophe,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.Space,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.Spelling,
						totalIssues: 0,
					},
				],
			},
			{
				type: EWritingFeedbackTypes.SentenceStructure,
				categories: [
					{
						type: EWritingFeedbackCategories.FusedSentence,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.CommaSplice,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.SentenceFragments,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.IneffectiveConstruction,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.ExtraWords,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.MissingWords,
						totalIssues: 0,
					},
				],
			},
			{
				type: EWritingFeedbackTypes.MismatchInGenderBetweenAdjectives,
				categories: [
					{
						type: EWritingFeedbackCategories.AdjectiveGenderAgreement,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.AdjectiveNumberAgreement,
						totalIssues: 0,
					},
				],
			},
			{
				type: EWritingFeedbackTypes.IncorrectNumberAgreementBetweenArticles,
				categories: [
					{
						type: EWritingFeedbackCategories.ArticleGenderAgreement,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.ArticleNumberAgreement,
						totalIssues: 0,
					},
				],
			},
			{
				type: EWritingFeedbackTypes.IncorrectNumberAgreementBetweenNouns,
				categories: [
					{
						type: EWritingFeedbackCategories.NounGenderAgreement,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.SubjunctiveMood,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.CompoundWordError,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.MoodInconsistency,
						totalIssues: 0,
					},
					{
						type: EWritingFeedbackCategories.AccentError,
						totalIssues: 0,
					},
				],
			},
		];
	}

	public increaseCorrectionsCategoryTotal(
		writingFeedbackStats: IWritingFeedbackTypeStatistics[],
		type: EWritingFeedbackCategories
	) {
		switch (type) {
			case EWritingFeedbackCategories.General:
				writingFeedbackStats[EWritingFeedbackTypes.General].categories[0].totalIssues++;
				break;

			case EWritingFeedbackCategories.SubjectVerbDisagreement:
			case EWritingFeedbackCategories.NounForm:
			case EWritingFeedbackCategories.VerbForm:
			case EWritingFeedbackCategories.Article:
			case EWritingFeedbackCategories.Preposition:
			case EWritingFeedbackCategories.Pronoun:
			case EWritingFeedbackCategories.PartOfSpeech:
			case EWritingFeedbackCategories.Conjunction:
				writingFeedbackStats[EWritingFeedbackTypes.Grammar].categories[
					type - EWritingFeedbackCategories.SubjectVerbDisagreement
				].totalIssues++;
				break;

			case EWritingFeedbackCategories.MisusedWord:
			case EWritingFeedbackCategories.Homophone:
				writingFeedbackStats[EWritingFeedbackTypes.WordChoice].categories[type - EWritingFeedbackCategories.MisusedWord]
					.totalIssues++;
				break;

			case EWritingFeedbackCategories.Capitalization:
			case EWritingFeedbackCategories.Hyphen:
			case EWritingFeedbackCategories.Punctuation:
			case EWritingFeedbackCategories.Comma:
			case EWritingFeedbackCategories.Apostrophe:
			case EWritingFeedbackCategories.Space:
			case EWritingFeedbackCategories.Spelling:
				writingFeedbackStats[EWritingFeedbackTypes.Mechanics].categories[
					type - EWritingFeedbackCategories.Capitalization
				].totalIssues++;
				break;

			case EWritingFeedbackCategories.FusedSentence:
			case EWritingFeedbackCategories.CommaSplice:
			case EWritingFeedbackCategories.SentenceFragments:
			case EWritingFeedbackCategories.IneffectiveConstruction:
			case EWritingFeedbackCategories.ExtraWords:
			case EWritingFeedbackCategories.MissingWords:
				writingFeedbackStats[EWritingFeedbackTypes.SentenceStructure].categories[
					type - EWritingFeedbackCategories.FusedSentence
				].totalIssues++;
				break;

			case EWritingFeedbackCategories.AdjectiveGenderAgreement:
			case EWritingFeedbackCategories.AdjectiveNumberAgreement:
				writingFeedbackStats[EWritingFeedbackTypes.MismatchInGenderBetweenAdjectives].categories[
					type - EWritingFeedbackCategories.AdjectiveGenderAgreement
				].totalIssues++;
				break;

			case EWritingFeedbackCategories.ArticleGenderAgreement:
			case EWritingFeedbackCategories.ArticleNumberAgreement:
				writingFeedbackStats[EWritingFeedbackTypes.IncorrectNumberAgreementBetweenArticles].categories[
					type - EWritingFeedbackCategories.ArticleGenderAgreement
				].totalIssues++;
				break;

			case EWritingFeedbackCategories.NounGenderAgreement:
			case EWritingFeedbackCategories.SubjunctiveMood:
			case EWritingFeedbackCategories.CompoundWordError:
			case EWritingFeedbackCategories.MoodInconsistency:
			case EWritingFeedbackCategories.AccentError:
				writingFeedbackStats[EWritingFeedbackTypes.IncorrectNumberAgreementBetweenNouns].categories[
					type - EWritingFeedbackCategories.NounGenderAgreement
				].totalIssues++;
				break;

			case EWritingFeedbackCategories.HomoglyphError:
				writingFeedbackStats[EWritingFeedbackTypes.Grammar].categories[8].totalIssues++;
				break;
			default:
				break;
		}
	}

	/** dtor */
	ngOnDestroy() {
		this._statistics.complete();
	}
}
