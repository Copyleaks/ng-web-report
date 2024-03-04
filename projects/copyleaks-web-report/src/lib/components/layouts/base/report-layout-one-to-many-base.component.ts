import { Renderer2, TemplateRef } from '@angular/core';
import { combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ALERTS } from '../../../constants/report-alerts.constants';
import {
	EReportViewType,
	EResponsiveLayoutType,
	EWritingFeedbackCategories,
	EWritingFeedbackTypes,
} from '../../../enums/copyleaks-web-report.enums';
import {
	ICompleteResultNotificationAlert,
	ICompleteResults,
	IScanSource,
	IWritingFeedback,
	IWritingFeedbackCorrectionViewModel,
	IWritingFeedbackScanScource,
	IWritingFeedbackTypeStatistics,
	ResultPreview,
} from '../../../models/report-data.models';
import { PostMessageEvent } from '../../../models/report-iframe-events.models';
import { Match, MatchType, ResultDetailItem, SlicedMatch } from '../../../models/report-matches.models';
import { ICopyleaksReportOptions } from '../../../models/report-options.models';
import { ReportStatistics } from '../../../models/report-statistics.models';
import { ReportDataService } from '../../../services/report-data.service';
import { ReportMatchHighlightService } from '../../../services/report-match-highlight.service';
import { ReportMatchesService } from '../../../services/report-matches.service';
import { ReportNgTemplatesService } from '../../../services/report-ng-templates.service';
import { ReportStatisticsService } from '../../../services/report-statistics.service';
import { ReportViewService } from '../../../services/report-view.service';
import { untilDestroy } from '../../../utils/until-destroy';
import { IAuthorAlertCard } from '../../containers/report-alerts-container/components/author-alert-card/models/author-alert-card.models';
import { IResultsActions } from '../../containers/report-results-container/components/results-actions/models/results-actions.models';
import { IResultItem } from '../../containers/report-results-item-container/components/models/report-result-item.models';
import { ECustomResultsReportView } from '../../core/cr-custom-results/models/cr-custom-results.enums';
import { ReportLayoutBaseComponent } from './report-layout-base.component';
import { ReportRealtimeResultsService } from '../../../services/report-realtime-results.service';
import { ViewMode } from '../../../models/report-config.models';
import * as helpers from '../../../utils/report-match-helpers';

export abstract class OneToManyReportLayoutBaseComponent extends ReportLayoutBaseComponent {
	hideRightSection: boolean = false;

	reportCrawledVersion: IScanSource;
	iframeHtml: string;
	reportMatches: Match[];

	contentTextMatches: SlicedMatch[][];
	numberOfPages: number;
	currentPageSource: number;

	oneToManyRerendered: boolean = false;
	EResponsiveLayoutType = EResponsiveLayoutType;
	alerts: ICompleteResultNotificationAlert[];
	reportStatistics: ReportStatistics | undefined;
	filterOptions: ICopyleaksReportOptions;
	selectedTap: EReportViewType = EReportViewType.PlagiarismView;

	scanResultsPreviews: ICompleteResults | undefined;
	scanResultsDetails: ResultDetailItem[] | undefined;
	scanResultsView: IResultItem[];
	scanResultsActions: IResultsActions = {
		totalResults: 0,
		totalExcluded: 0,
		totalFiltered: 0,
		selectedResults: 0,
	};
	newScanResultsView: IResultItem[];
	allScanCorrectionsView: IWritingFeedbackCorrectionViewModel[];
	displayedScanCorrectionsView: IWritingFeedbackCorrectionViewModel[];

	focusedMatch: Match | null;

	isLoadingScanContent: boolean = true;
	isLoadingScanResults: boolean = true;
	loadingProgressPct: number = 0;

	hidePlagarismTap: boolean = false;
	hideAiTap: boolean = false;
	hideWritingFeedbackTap: boolean = false;
	showDisabledProducts: boolean = false;
	reportTemplateMode: ECustomResultsReportView;
	viewMode: ViewMode = 'one-to-many';
	isMultiSelection: boolean = false;

	EReportViewType = EReportViewType;
	ECustomResultsReportView = ECustomResultsReportView;

	authorAlert: IAuthorAlertCard | null = null;

	customResultsTemplate: TemplateRef<any> | undefined = undefined;
	writingFeedback: IWritingFeedback;
	writingFeedbackStats: IWritingFeedbackTypeStatistics[];
	correctionClicked: boolean = false;
	totalFilteredCorrections: number;
	showCorrectionsLoadingView: boolean = true;
	showReadabilityLoadingView: boolean = true;

	override get rerendered(): boolean {
		return this.oneToManyRerendered;
	}

	get combined() {
		if (!this.reportStatistics) return 0;
		return (
			this.reportStatistics?.identical + this.reportStatistics?.relatedMeaning + this.reportStatistics?.minorChanges
		);
	}

	get filteredCorrections(): IWritingFeedbackCorrectionViewModel[] {
		if (!this.reportDataSvc.writingFeedback?.corrections) return [];
		const filteredCorrections = this.reportDataSvc.filterCorrections(
			JSON.parse(JSON.stringify(this.reportDataSvc.writingFeedback?.corrections)),
			this.reportDataSvc.filterOptions,
			this.reportDataSvc.excludedCorrections
		);
		return this._mapCorrectionsToViewModel(filteredCorrections);
	}

	plagiarismScore: number;
	numberOfWords: number;
	grammarScore: number;

	constructor(
		reportDataSvc: ReportDataService,
		reportViewSvc: ReportViewService,
		matchSvc: ReportMatchesService,
		renderer: Renderer2,
		highlightSvc: ReportMatchHighlightService,
		statisticsSvc: ReportStatisticsService,
		templatesSvc: ReportNgTemplatesService,
		realTimeResultsSvc: ReportRealtimeResultsService
	) {
		super(
			reportDataSvc,
			reportViewSvc,
			matchSvc,
			renderer,
			highlightSvc,
			statisticsSvc,
			templatesSvc,
			realTimeResultsSvc
		);
	}

	initOneToManyViewData(): void {
		this.reportViewSvc.reportViewMode$.pipe(untilDestroy(this)).subscribe(data => {
			if (!data) return;
			this.isHtmlView = data.isHtmlView;
			this.currentPageSource = data.sourcePageIndex;
			this.viewMode = data.viewMode;

			if (data.viewMode === 'writing-feedback') {
				this.selectedTap = EReportViewType.WritingFeedbackTabView;
			} else
				this.selectedTap =
					data.alertCode === ALERTS.SUSPECTED_AI_TEXT_DETECTED
						? EReportViewType.AIView
						: EReportViewType.PlagiarismView;

			this.showDisabledProducts = data.showDisabledProducts ?? false;

			combineLatest([this.reportDataSvc.scanResultsPreviews$, this.reportDataSvc.scanResultsDetails$])
				.pipe(untilDestroy(this))
				.subscribe(([previews, details]) => {
					if (data?.alertCode && this.selectedTap === EReportViewType.AIView) {
						this.isHtmlView = false;
					}
					if (this.reportDataSvc.filterOptions?.showAlerts === false) this.alerts = [];
					else
						this.alerts =
							previews?.notifications?.alerts?.filter(a => a.code != ALERTS.SUSPECTED_AI_TEXT_DETECTED) ?? [];
					this.scanResultsPreviews = previews;
					this.scanResultsDetails = details;

					this.isLoadingScanResults = this.scanResultsPreviews === undefined || this.scanResultsDetails === undefined;

					this.hideAiTap = !this.reportDataSvc.isAiDetectionEnabled();
					this.hidePlagarismTap = !this.reportDataSvc.isPlagiarismEnabled();
					this.hideWritingFeedbackTap = !this.reportDataSvc.isWritingFeedbackEnabled();

					this.numberOfWords = previews?.scannedDocument?.totalWords;

					if (this.scanResultsPreviews && this.scanResultsDetails) {
						this.scanResultsActions.totalResults = this.reportDataSvc.totalCompleteResults;
						const allResults = [
							...(this.scanResultsPreviews.results?.internet ?? []),
							...(this.scanResultsPreviews.results?.database ?? []),
							...(this.scanResultsPreviews.results?.batch ?? []),
							...(this.scanResultsPreviews.results?.repositories ?? []),
						];

						this.scanResultsView = allResults
							.sort((a, b) => (b.isLocked ? 0 : b.matchedWords) - (a.isLocked ? 0 : a.matchedWords))
							.map(result => {
								const foundResultDetail = this.scanResultsDetails?.find(r => r.id === result.id);
								return {
									resultPreview: result,
									resultDetails: foundResultDetail,
									iStatisticsResult: foundResultDetail?.result?.statistics,
									metadataSource: {
										words: this.scanResultsPreviews?.scannedDocument.totalWords ?? 0,
										excluded: this.scanResultsPreviews?.scannedDocument.totalExcluded ?? 0,
									},
								} as IResultItem;
							});
					}
				});
		});

		this.reportViewSvc.progress$.pipe(untilDestroy(this)).subscribe(progress => {
			this.loadingProgressPct = progress;
		});

		this.reportDataSvc.newResults$.pipe(untilDestroy(this)).subscribe(data => {
			if (data) this.newScanResultsView = data;
		});

		this.reportDataSvc.crawledVersion$.pipe(untilDestroy(this)).subscribe(data => {
			if (data) {
				this.reportCrawledVersion = data;
				this.numberOfPages = data.text?.pages?.startPosition?.length ?? 1;
			}
		});

		this.reportDataSvc.writingFeedback$.pipe(untilDestroy(this)).subscribe(data => {
			if (data) this.writingFeedback = data;
			this.showReadabilityLoadingView = !data;
		});

		combineLatest([this.reportDataSvc.crawledVersion$, this.reportDataSvc.writingFeedback$])
			.pipe(
				untilDestroy(this),
				filter(([scanSource, writingFeedback]) => !!writingFeedback && !!scanSource)
			)
			.subscribe(([scanSource, writingFeedback]) => {
				const filteredCorrections = this.reportDataSvc.filterCorrections(
					JSON.parse(JSON.stringify(writingFeedback?.corrections)),
					{
						writingFeedback: {
							hiddenCategories: [],
						},
					},
					[]
				);

				this.allScanCorrectionsView = [];

				this._initCorrectionsStatistics();

				const contentTextMatches = helpers.processCorrectionsText(filteredCorrections, 'text', scanSource);
				let correctionIndex: number = 0;
				for (let correctionsRow of contentTextMatches) {
					for (let correction of correctionsRow) {
						if (
							correction.match.type === MatchType.writingFeedback &&
							filteredCorrections?.text?.chars?.operationTexts
						) {
							this.allScanCorrectionsView.push({
								correctionText: filteredCorrections.text.chars.operationTexts[correctionIndex],
								type: correction.match.writingFeedbackType,
								wrongText: this.reportCrawledVersion.text.value.substring(correction.match.start, correction.match.end),
								start: correction.match.start,
								end: correction.match.end,
							} as IWritingFeedbackCorrectionViewModel);
							this._increaseCorrectionsCategoryTotal(correction.match.writingFeedbackType);
							correctionIndex++;
						}
					}
				}

				this.totalFilteredCorrections =
					(this.allScanCorrectionsView?.length ?? 0) -
					(this.displayedScanCorrectionsView?.length ?? 0) -
					(this.reportDataSvc.excludedCorrections?.length ?? 0);
			});

		this.reportDataSvc.filterOptions$.pipe(untilDestroy(this)).subscribe(data => {
			if (!data) return;
			if (data.showAlerts === false) {
				this.alerts = [];
				return;
			}
			this.filterOptions = data;
			this.alerts =
				this.scanResultsPreviews?.notifications?.alerts?.filter(a => a.code != ALERTS.SUSPECTED_AI_TEXT_DETECTED) ?? [];
		});

		this.matchSvc.originalHtmlMatches$.pipe(untilDestroy(this)).subscribe(data => {
			this.isLoadingScanContent = data === null;
			if (data != this.reportMatches) {
				this.oneToManyRerendered = false;
			}
			this.reportMatches = data ?? [];
			const updatedHtml = this._getRenderedMatches(data, this.reportDataSvc.crawledVersion?.html?.value);
			if (updatedHtml && data) {
				this.iframeHtml = updatedHtml;
				this.oneToManyRerendered = true;
			}
		});

		this.matchSvc.originalTextMatches$.pipe(untilDestroy(this)).subscribe(data => {
			if (data) {
				this.isLoadingScanContent = false;
				this.contentTextMatches = data;

				if (this.viewMode === 'writing-feedback') {
					const filteredCorrections = this.reportDataSvc.filterCorrections(
						JSON.parse(JSON.stringify(this.reportDataSvc.writingFeedback?.corrections)),
						this.reportDataSvc.filterOptions,
						this.reportDataSvc.excludedCorrections
					);
					this.displayedScanCorrectionsView = this._mapCorrectionsToViewModel(filteredCorrections);
					this.showCorrectionsLoadingView = false;
					this.totalFilteredCorrections =
						(this.allScanCorrectionsView?.length ?? 0) -
						(this.displayedScanCorrectionsView?.length ?? 0) -
						(this.reportDataSvc.excludedCorrections?.length ?? 0);
				}
			}
		});

		this.statisticsSvc.statistics$.pipe(untilDestroy(this)).subscribe(data => {
			if (data) this.reportStatistics = data;
			const res = Math.min(
				1,
				this.combined / ((this.reportStatistics?.total ?? 0) - (this.reportStatistics?.omittedWords ?? 0))
			);
			this.plagiarismScore = isNaN(res) ? 0 : res;
		});

		const { originalText$, originalHtml$, multiOriginalText$ } = this.highlightSvc;
		combineLatest([originalText$, originalHtml$, multiOriginalText$, this.reportViewSvc.reportViewMode$])
			.pipe(
				untilDestroy(this),
				filter(([, , , content]) => !content.alertCode)
			)
			.subscribe(([text, html, multiText, content]) => {
				if (multiText && multiText.length > 0) {
					const selectedMatches = multiText.map(c => c.match);
					if (this.viewMode === 'one-to-many') this._showResultsForMultiSelection(selectedMatches);
					else if (this.viewMode === 'writing-feedback') {
						if (selectedMatches.length === 0) this.displayedScanCorrectionsView = this.filteredCorrections;
						else
							this.displayedScanCorrectionsView = this.allScanCorrectionsView.filter(sc =>
								selectedMatches.find(sm => sm.start === sc.start && sm.end === sc.end)
							);
						this.correctionClicked = selectedMatches?.length > 0;
					}
				} else {
					this.focusedMatch = !content.isHtmlView ? text && text.match : html;
					if (this.viewMode === 'one-to-many') this._showResultsForSelectedMatch(this.focusedMatch);
					else if (this.viewMode === 'writing-feedback') {
						if (this.focusedMatch)
							this.displayedScanCorrectionsView = this.allScanCorrectionsView.filter(
								sc => this.focusedMatch.start === sc.start && this.focusedMatch.end === sc.end
							);
						this.correctionClicked = !!this.focusedMatch;
					}
				}
			});

		this.templatesSvc.reportTemplatesSubject$.pipe(untilDestroy(this)).subscribe(refs => {
			if (refs?.customResultsTemplate !== undefined && this.customResultsTemplate === undefined) {
				setTimeout(() => {
					this.customResultsTemplate = refs?.customResultsTemplate;
				});
			}
		});

		this.templatesSvc.reportTemplatesMode$.pipe(untilDestroy(this)).subscribe(mode => {
			if (mode === undefined) return;
			this.reportTemplateMode = mode;
		});
	}

	onIFrameMessage(message: PostMessageEvent) {
		switch (message.type) {
			case 'match-select':
				const selectedMatch = message.index !== -1 ? this.reportMatches[message.index] : null;
				if (this.viewMode === 'one-to-many') this._showResultsForSelectedMatch(selectedMatch);
				else if (this.viewMode === 'writing-feedback') {
					if (selectedMatch) {
						const textSelectedMatch = this.allScanCorrectionsView[selectedMatch.gid];
						this.displayedScanCorrectionsView = this.allScanCorrectionsView.filter(
							sc => textSelectedMatch.start === sc.start && textSelectedMatch.end === sc.end
						);
					} else this.displayedScanCorrectionsView = this.filteredCorrections;
					this.correctionClicked = !!selectedMatch;
				}
				break;
			case 'multi-match-select':
				let selectedMatches: Match[] = [];
				message.indexes.forEach(i => {
					if (!selectedMatches.find(s => s.gid === this.reportMatches[i].gid))
						selectedMatches.push(this.reportMatches[i]);
				});
				if (this.viewMode === 'one-to-many') {
					this._showResultsForMultiSelection(selectedMatches);
				} else if (this.viewMode === 'writing-feedback') {
					if (selectedMatches.length === 0) this.displayedScanCorrectionsView = this.filteredCorrections;
					else this.displayedScanCorrectionsView = [];
					selectedMatches.forEach(sc => {
						if (sc.gid > 0 && sc.gid < this.allScanCorrectionsView.length)
							this.displayedScanCorrectionsView.push(this.allScanCorrectionsView[sc.gid]);
					});
					this.correctionClicked = selectedMatches?.length > 0;
				}
				break;
			case 'upgrade-plan':
				console.log(message);
				break;
			case 'match-warn':
				console.warn('match not found');
				break;
			default:
				console.error('unknown event', message);
		}
	}

	private _showResultsForSelectedMatch(selectedMatch: Match | null) {
		this.isMultiSelection = false;
		let viewedResults: ResultPreview[] = [];
		if (selectedMatch)
			viewedResults = [
				...(this.reportDataSvc.scanResultsPreviews?.results?.internet?.filter(item =>
					selectedMatch?.ids?.includes(item.id)
				) ?? []),
				...(this.reportDataSvc.scanResultsPreviews?.results?.batch?.filter(item =>
					selectedMatch?.ids?.includes(item.id)
				) ?? []),
				...(this.reportDataSvc.scanResultsPreviews?.results?.database?.filter(item =>
					selectedMatch?.ids?.includes(item.id)
				) ?? []),
				...(this.reportDataSvc.scanResultsPreviews?.results?.repositories?.filter(item =>
					selectedMatch?.ids?.includes(item.id)
				) ?? []),
			];
		else
			viewedResults = [
				...(this.reportDataSvc.scanResultsPreviews?.results?.internet ?? []),
				...(this.reportDataSvc.scanResultsPreviews?.results?.batch ?? []),
				...(this.reportDataSvc.scanResultsPreviews?.results?.database ?? []),
				...(this.reportDataSvc.scanResultsPreviews?.results?.repositories ?? []),
			];

		if (this.reportDataSvc.filterOptions && this.reportDataSvc.excludedResultsIds) {
			const filteredResults = this.reportDataSvc.filterResults(
				this.reportDataSvc.filterOptions,
				this.reportDataSvc.excludedResultsIds
			);
			viewedResults = viewedResults.filter(r => filteredResults.find(fr => fr.id === r.id));
		}

		this.scanResultsView = viewedResults
			.sort((a, b) => (b.isLocked ? 0 : b.matchedWords) - (a.isLocked ? 0 : a.matchedWords))
			.map(result => {
				const foundResultDetail = this.scanResultsDetails?.find(r => r.id === result.id);
				return {
					resultPreview: result,
					resultDetails: foundResultDetail,
					iStatisticsResult: foundResultDetail?.result?.statistics,
					metadataSource: {
						words: this.scanResultsPreviews?.scannedDocument.totalWords ?? 0,
						excluded: this.scanResultsPreviews?.scannedDocument.totalExcluded ?? 0,
					},
				} as IResultItem;
			});

		if (selectedMatch)
			this.scanResultsActions = {
				...this.scanResultsActions,
				selectedResults: this.scanResultsView.length,
			};
		else
			this.scanResultsActions = {
				...this.scanResultsActions,
				selectedResults: 0,
			};
	}

	private _showResultsForMultiSelection(selctions: Match[]) {
		if (selctions?.length <= 1) this.isMultiSelection = false;
		else this.isMultiSelection = true;

		let viewedResults: ResultPreview[] = [];
		if (selctions && selctions.length > 0)
			viewedResults = [
				...(this.reportDataSvc.scanResultsPreviews?.results?.internet?.filter(
					item => !!selctions.find(match => match?.ids?.includes(item.id))
				) ?? []),
				...(this.reportDataSvc.scanResultsPreviews?.results?.batch?.filter(
					item => !!selctions.find(match => match?.ids?.includes(item.id))
				) ?? []),
				...(this.reportDataSvc.scanResultsPreviews?.results?.database?.filter(
					item => !!selctions.find(match => match?.ids?.includes(item.id))
				) ?? []),
				...(this.reportDataSvc.scanResultsPreviews?.results?.repositories?.filter(
					item => !!selctions.find(match => match?.ids?.includes(item.id))
				) ?? []),
			];
		else
			viewedResults = [
				...(this.reportDataSvc.scanResultsPreviews?.results?.internet ?? []),
				...(this.reportDataSvc.scanResultsPreviews?.results?.batch ?? []),
				...(this.reportDataSvc.scanResultsPreviews?.results?.database ?? []),
				...(this.reportDataSvc.scanResultsPreviews?.results?.repositories ?? []),
			];

		if (this.reportDataSvc.filterOptions && this.reportDataSvc.excludedResultsIds) {
			const filteredResults = this.reportDataSvc.filterResults(
				this.reportDataSvc.filterOptions,
				this.reportDataSvc.excludedResultsIds
			);
			viewedResults = viewedResults.filter(r => filteredResults.find(fr => fr.id === r.id));
		}

		this.scanResultsView = viewedResults
			.sort((a, b) => (b.isLocked ? 0 : b.matchedWords) - (a.isLocked ? 0 : a.matchedWords))
			.map(result => {
				const foundResultDetail = this.scanResultsDetails?.find(r => r.id === result.id);
				return {
					resultPreview: result,
					resultDetails: foundResultDetail,
					iStatisticsResult: foundResultDetail?.result?.statistics,
					metadataSource: {
						words: this.scanResultsPreviews?.scannedDocument.totalWords ?? 0,
						excluded: this.scanResultsPreviews?.scannedDocument.totalExcluded ?? 0,
					},
				} as IResultItem;
			});

		if (selctions && selctions.length > 0)
			this.scanResultsActions = {
				...this.scanResultsActions,
				selectedResults: this.scanResultsView.length,
			};
		else
			this.scanResultsActions = {
				...this.scanResultsActions,
				selectedResults: 0,
			};
	}
	private _mapCorrectionsToViewModel(
		filteredCorrections: IWritingFeedbackScanScource
	): IWritingFeedbackCorrectionViewModel[] {
		if (
			this.contentTextMatches.length * (this.contentTextMatches[0] ? this.contentTextMatches[0].length : 0) === 0 ||
			!this.contentTextMatches
		)
			return [];

		const viewedCorrections = [];
		let correctionIndex: number = 0;
		for (let correctionsRow of this.contentTextMatches) {
			for (let correction of correctionsRow) {
				if (correction.match.type === MatchType.writingFeedback && filteredCorrections?.text?.chars?.operationTexts) {
					viewedCorrections.push({
						correctionText: filteredCorrections.text.chars.operationTexts[correctionIndex],
						type: correction.match.writingFeedbackType,
						wrongText: this.reportCrawledVersion.text.value.substring(correction.match.start, correction.match.end),
						start: correction.match.start,
						end: correction.match.end,
					} as IWritingFeedbackCorrectionViewModel);

					correctionIndex++;
				}
			}
		}
		return viewedCorrections;
	}

	private _initCorrectionsStatistics() {
		this.writingFeedbackStats = [
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

	private _increaseCorrectionsCategoryTotal(type: EWritingFeedbackCategories) {
		switch (type) {
			case EWritingFeedbackCategories.General:
				this.writingFeedbackStats[EWritingFeedbackTypes.General].categories[0].totalIssues++;
				break;

			case EWritingFeedbackCategories.SubjectVerbDisagreement:
			case EWritingFeedbackCategories.NounForm:
			case EWritingFeedbackCategories.VerbForm:
			case EWritingFeedbackCategories.Article:
			case EWritingFeedbackCategories.Preposition:
			case EWritingFeedbackCategories.Pronoun:
			case EWritingFeedbackCategories.PartOfSpeech:
			case EWritingFeedbackCategories.Conjunction:
				this.writingFeedbackStats[EWritingFeedbackTypes.Grammar].categories[
					type - EWritingFeedbackCategories.SubjectVerbDisagreement
				].totalIssues++;
				break;

			case EWritingFeedbackCategories.MisusedWord:
			case EWritingFeedbackCategories.Homophone:
				this.writingFeedbackStats[EWritingFeedbackTypes.WordChoice].categories[
					type - EWritingFeedbackCategories.MisusedWord
				].totalIssues++;
				break;

			case EWritingFeedbackCategories.Capitalization:
			case EWritingFeedbackCategories.Hyphen:
			case EWritingFeedbackCategories.Punctuation:
			case EWritingFeedbackCategories.Comma:
			case EWritingFeedbackCategories.Apostrophe:
			case EWritingFeedbackCategories.Space:
			case EWritingFeedbackCategories.Spelling:
				this.writingFeedbackStats[EWritingFeedbackTypes.Mechanics].categories[
					type - EWritingFeedbackCategories.Capitalization
				].totalIssues++;
				break;

			case EWritingFeedbackCategories.FusedSentence:
			case EWritingFeedbackCategories.CommaSplice:
			case EWritingFeedbackCategories.SentenceFragments:
			case EWritingFeedbackCategories.IneffectiveConstruction:
			case EWritingFeedbackCategories.ExtraWords:
			case EWritingFeedbackCategories.MissingWords:
				this.writingFeedbackStats[EWritingFeedbackTypes.SentenceStructure].categories[
					type - EWritingFeedbackCategories.FusedSentence
				].totalIssues++;
				break;

			case EWritingFeedbackCategories.AdjectiveGenderAgreement:
			case EWritingFeedbackCategories.AdjectiveNumberAgreement:
				this.writingFeedbackStats[EWritingFeedbackTypes.MismatchInGenderBetweenAdjectives].categories[
					type - EWritingFeedbackCategories.AdjectiveGenderAgreement
				].totalIssues++;
				break;

			case EWritingFeedbackCategories.ArticleGenderAgreement:
			case EWritingFeedbackCategories.ArticleNumberAgreement:
				this.writingFeedbackStats[EWritingFeedbackTypes.IncorrectNumberAgreementBetweenArticles].categories[
					type - EWritingFeedbackCategories.ArticleGenderAgreement
				].totalIssues++;
				break;

			case EWritingFeedbackCategories.NounGenderAgreement:
			case EWritingFeedbackCategories.SubjunctiveMood:
			case EWritingFeedbackCategories.CompoundWordError:
			case EWritingFeedbackCategories.MoodInconsistency:
			case EWritingFeedbackCategories.AccentError:
				this.writingFeedbackStats[EWritingFeedbackTypes.IncorrectNumberAgreementBetweenNouns].categories[
					type - EWritingFeedbackCategories.NounGenderAgreement
				].totalIssues++;
				break;
			default:
				break;
		}
	}
}
