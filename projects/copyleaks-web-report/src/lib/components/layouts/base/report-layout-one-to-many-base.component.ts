import { Renderer2, TemplateRef } from '@angular/core';
import { Subject, combineLatest } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { ALERTS } from '../../../constants/report-alerts.constants';
import { EExcludeReason, EReportViewType, EResponsiveLayoutType } from '../../../enums/copyleaks-web-report.enums';
import {
	ICompleteResultNotificationAlert,
	ICompleteResults,
	IScanSource,
	IWritingFeedback,
	IWritingFeedbackCorrectionViewModel,
	IWritingFeedbackScanScource,
	ResultPreview,
} from '../../../models/report-data.models';
import { PostMessageEvent } from '../../../models/report-iframe-events.models';
import {
	AIScanResult,
	ExplainableAIResults,
	Match,
	MatchType,
	ResultDetailItem,
	SlicedMatch,
} from '../../../models/report-matches.models';
import { ICopyleaksReportOptions } from '../../../models/report-options.models';
import {
	IMatchesTypeStatistics,
	IWritingFeedbackTypeStatistics,
	ReportStatistics,
} from '../../../models/report-statistics.models';
import { ReportDataService } from '../../../services/report-data.service';
import { ReportMatchHighlightService } from '../../../services/report-match-highlight.service';
import { ReportMatchesService } from '../../../services/report-matches.service';
import { ReportNgTemplatesService } from '../../../services/report-ng-templates.service';
import { ReportStatisticsService } from '../../../services/report-statistics.service';
import { ReportViewService } from '../../../services/report-view.service';
import { IAuthorAlertCard } from '../../containers/report-alerts-container/components/author-alert-card/models/author-alert-card.models';
import { IResultsActions } from '../../containers/report-results-container/components/results-actions/models/results-actions.models';
import { IResultItem } from '../../containers/report-results-item-container/components/models/report-result-item.models';
import { ECustomResultsReportView } from '../../core/cr-custom-results/models/cr-custom-results.enums';
import { ReportLayoutBaseComponent } from './report-layout-base.component';
import { ReportRealtimeResultsService } from '../../../services/report-realtime-results.service';
import { ViewMode } from '../../../models/report-config.models';
import * as helpers from '../../../utils/report-match-helpers';
import { ReportErrorsService } from '../../../services/report-errors.service';
import { RESULT_TAGS_CODES } from '../../../constants/report-result-tags.constants';

export abstract class OneToManyReportLayoutBaseComponent extends ReportLayoutBaseComponent {
	hideRightSection: boolean = false;

	reportCrawledVersion: IScanSource;
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
	aiSourceMatchResults: IResultItem[];
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
	isLoadingScanCorrections: boolean = true;
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
	customBannerSectionTemplate: TemplateRef<any> | undefined = undefined;
	writingFeedback: IWritingFeedback;
	writingFeedbackStats: IWritingFeedbackTypeStatistics[];
	correctionClicked: boolean = false;
	totalFilteredCorrections: number;
	showCorrectionsLoadingView: boolean = true;
	showReadabilityLoadingView: boolean = true;
	allWritingFeedbacksStats: IWritingFeedbackTypeStatistics[];
	allMatchResultsStats: IMatchesTypeStatistics[];
	customActionsTemplate: TemplateRef<any>;
	customAISourceMatchUpgradeTemplate: TemplateRef<any>;
	selectedCustomTabResultSectionContentTemplate: TemplateRef<any>;
	showOmittedWords: boolean;
	isPartitalScan: boolean;
	explainableAI: ExplainableAIResults = { explain: null, slicedMatch: [], sourceText: '' };
	loadingExplainableAI: boolean = true;
	isAiHtmlViewAvailable: boolean = false;
	showAIPhrases: boolean = false;

	// Subject for destroying all the subscriptions in base component
	private unsubscribe$ = new Subject();

	get combined() {
		if (!this.reportStatistics) return 0;
		return (
			this.reportStatistics?.identical + this.reportStatistics?.relatedMeaning + this.reportStatistics?.minorChanges
		);
	}

	get filteredCorrections(): IWritingFeedbackCorrectionViewModel[] {
		if (!this.reportDataSvc.writingFeedback?.corrections || !this.reportCrawledVersion) return [];
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
		realTimeResultsSvc: ReportRealtimeResultsService,
		reportErrorsSvc: ReportErrorsService
	) {
		super(
			reportDataSvc,
			reportViewSvc,
			matchSvc,
			renderer,
			highlightSvc,
			statisticsSvc,
			templatesSvc,
			realTimeResultsSvc,
			reportErrorsSvc
		);
	}

	initOneToManyViewData(): void {
		// Init the subscriptions for the one-to-many view
		this.unsubscribe$ = new Subject();

		this.reportViewSvc.reportViewMode$.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
			if (!data) return;
			this.isHtmlView = data.isHtmlView;
			this.currentPageSource = data.sourcePageIndex;
			this.viewMode = data.viewMode;

			if (data.viewMode === 'writing-feedback') {
				this.selectedTap = EReportViewType.WritingFeedbackTabView;
			} else
				this.selectedTap = data.selectedCustomTabId
					? EReportViewType.CustomTabView
					: data.alertCode === ALERTS.SUSPECTED_AI_TEXT_DETECTED
					? EReportViewType.AIView
					: EReportViewType.PlagiarismView;

			if (this.selectedTap != EReportViewType.AIView) {
				this.highlightSvc.aiInsightsSelectedResults$.next([]);
				this.highlightSvc.aiInsightsSelect$.next(null);
				this.highlightSvc.aiInsightsShowResult$.next(null);
				this.highlightSvc.setOriginalHtmlMatch(null);
				this.highlightSvc.setOriginalTextMatch(null);
			}

			this.showDisabledProducts = data.showDisabledProducts ?? false;

			combineLatest([
				this.reportDataSvc.scanResultsPreviews$.pipe(distinctUntilChanged()),
				this.reportDataSvc.scanResultsDetails$.pipe(distinctUntilChanged()),
			])
				.pipe(takeUntil(this.unsubscribe$))
				.subscribe(([previews, details]) => {
					if (this.reportDataSvc.filterOptions?.showAlerts === false) this.alerts = [];
					else
						this.alerts =
							previews?.notifications?.alerts?.filter(
								a => a.code != ALERTS.SUSPECTED_AI_TEXT_DETECTED && a.code != ALERTS.AI_INSIGHTS_LANG_UNSUPPORTED
							) ?? [];
					this.scanResultsPreviews = previews;
					this.scanResultsDetails = details;

					this.isLoadingScanResults = this.scanResultsPreviews === undefined || this.scanResultsDetails === undefined;

					this.hideAiTap = !this.reportDataSvc.isAiDetectionEnabled();
					this.hidePlagarismTap = !this.reportDataSvc.isPlagiarismEnabled();
					this.hideWritingFeedbackTap = !this.reportDataSvc.isWritingFeedbackEnabled();

					if (previews && this.hideWritingFeedbackTap) this.isLoadingScanCorrections = false;

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
							.filter(result => result != undefined)
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

						// Filter "AI Source Match" results by checking their alert code

						this.aiSourceMatchResults = this.scanResultsView?.filter(
							result => !!result?.resultPreview?.tags?.find(t => t.code === RESULT_TAGS_CODES.SUSPECTED_AI_GENERATED)
						);
					}

					if (this.scanResultsPreviews && this.selectedTap === EReportViewType.AIView) {
						const validSelectedAlert = previews?.notifications?.alerts?.find(
							a => a.code === ALERTS.SUSPECTED_AI_TEXT_DETECTED
						);
						if (validSelectedAlert) {
							var aiScanResult = JSON.parse(validSelectedAlert.additionalData) as AIScanResult;

							this.isAiHtmlViewAvailable = false;
							aiScanResult.results.forEach(result => {
								result.matches?.forEach(match => {
									if (match.html != null && match.html != undefined) this.isAiHtmlViewAvailable = true;
								});
							});
						} else {
							this.isAiHtmlViewAvailable = false;
						}
						if (!this.isAiHtmlViewAvailable) {
							this.isHtmlView = false;
						}
					}
				});
		});

		this.reportDataSvc.scanResultsPreviews$
			.pipe(distinctUntilChanged())
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe(scanResults => {
				if (scanResults) {
					const validSelectedAlert = scanResults?.notifications?.alerts?.find(
						a => a.code === ALERTS.SUSPECTED_AI_TEXT_DETECTED
					);
					if (validSelectedAlert) {
						var scanResult = JSON.parse(validSelectedAlert.additionalData) as AIScanResult;

						this.explainableAI.explain = scanResult?.explain;
					}
					// Check if the AI insights are unsupported
					const aiInsightsUnsup = scanResults?.notifications?.alerts?.find(
						a => a.code === ALERTS.AI_INSIGHTS_LANG_UNSUPPORTED
					);
					// Set the alert for unsupported AI insights
					if (aiInsightsUnsup) {
						this.explainableAI.aiScanAlert = {
							title: $localize`Language Not Yet Supported for AI Insights`,
							message: $localize`Unsupported language for AI insights, no specific AI phrase found, but other criteria indicate AI generation.`,
						};
					}
					setTimeout(() => {
						this.loadingExplainableAI = false;
					}, 100);
				}
			});

		this.reportDataSvc.writingFeedback$.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
			if (data) this.writingFeedback = data;
			this.showReadabilityLoadingView = !data;
		});

		this.reportViewSvc.progress$.pipe(takeUntil(this.unsubscribe$)).subscribe(progress => {
			this.loadingProgressPct = progress;
		});

		this.reportDataSvc.newResults$.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
			if (data) this.newScanResultsView = data;
		});

		this.reportDataSvc.crawledVersion$.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
			if (data) {
				this.reportCrawledVersion = data;
				this.explainableAI.sourceText = data?.text?.value ?? '';
				this.numberOfPages = data.text?.pages?.startPosition?.length ?? 1;
				if (
					(this.reportCrawledVersion?.html?.exclude?.reasons?.filter(r => r === EExcludeReason.PartialScan).length >
						0 ||
						this.reportCrawledVersion?.text?.exclude?.reasons?.filter(r => r === EExcludeReason.PartialScan).length >
							0) &&
					(!this.isPartitalScan || !this.showOmittedWords)
				) {
					this.matchSvc.showOmittedWords$.next(true);
					this.isPartitalScan = true;
					this.showOmittedWords = true;
				}
			}
		});

		this.reportViewSvc.selectedCustomTabResultSectionContent$.pipe(takeUntil(this.unsubscribe$)).subscribe(content => {
			this.selectedCustomTabResultSectionContentTemplate = content;
		});

		this.matchSvc.showOmittedWords$.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
			this.showOmittedWords = data;
		});

		this.reportErrorsSvc.reportHttpRequestError$.pipe(takeUntil(this.unsubscribe$)).subscribe(error => {
			if (!error) return;

			if (error.method === 'initSync - crawledVersion') {
				this.isLoadingScanContent = false;
				this.reportMatches = this.contentTextMatches = [];

				this.oneToManyRerendered = true;
				this.isHtmlView = false;
			}
		});

		combineLatest([
			this.reportDataSvc.crawledVersion$.pipe(distinctUntilChanged()),
			this.reportDataSvc.writingFeedback$.pipe(distinctUntilChanged()),
		])
			.pipe(
				takeUntil(this.unsubscribe$),
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
				this.allWritingFeedbacksStats = this.statisticsSvc.initCorrectionsStatistics();

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
								index: correctionIndex,
							} as IWritingFeedbackCorrectionViewModel);
							this.statisticsSvc.increaseCorrectionsCategoryTotal(
								this.allWritingFeedbacksStats,
								correction.match.writingFeedbackType
							);
							correctionIndex++;
						}
					}
				}

				this.totalFilteredCorrections =
					(this.allScanCorrectionsView?.length ?? 0) -
					(this.displayedScanCorrectionsView?.length ?? 0) -
					(this.reportDataSvc.excludedCorrections?.length ?? 0);

				this.displayedScanCorrectionsView?.forEach(c => {
					c.index = this.allScanCorrectionsView.find(
						correction => correction.start === c.start && correction.end === c.end
					)?.index;
				});

				this.isLoadingScanCorrections = false;
			});

		this.reportDataSvc.filterOptions$.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
			if (!data) return;
			if (data.showAlerts === false) {
				this.alerts = [];
				return;
			}
			this.filterOptions = data;
			this.alerts =
				this.scanResultsPreviews?.notifications?.alerts?.filter(
					a => a.code != ALERTS.SUSPECTED_AI_TEXT_DETECTED && a.code != ALERTS.AI_INSIGHTS_LANG_UNSUPPORTED
				) ?? [];
		});

		this.matchSvc.originalHtmlMatches$.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
			this.isLoadingScanContent = data === null;
			if (data != this.reportMatches) {
				this.oneToManyRerendered = false;
			}
			if (this.reportViewSvc.reportViewMode?.viewMode === 'writing-feedback')
				data?.forEach(match => {
					if (
						!match ||
						match.type !== MatchType.writingFeedback ||
						!this.allScanCorrectionsView ||
						this.allScanCorrectionsView?.length <= 0
					)
						return;
					const correction = this.allScanCorrectionsView[match.gid];
					if (!correction) return;
					match.wrongText = correction.wrongText;
					match.correctionText = correction.correctionText;
				});
			this.reportMatches = data ?? [];
		});

		this.matchSvc.originalTextMatches$.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
			if (data) {
				this.isLoadingScanContent = false;
				this.contentTextMatches = data;
				let slicedMatch: SlicedMatch[] = [];
				this.contentTextMatches.forEach(result => {
					const explainText = result.filter(re => re.match.type === MatchType.aiExplain);
					if (explainText.length > 0) {
						slicedMatch.push(...explainText);
					}
				});

				if (this.reportViewSvc.reportViewMode?.viewMode === 'writing-feedback') {
					if (
						this.writingFeedback &&
						this.isHtmlView &&
						!(
							this.writingFeedback?.corrections?.html?.chars &&
							this.writingFeedback?.corrections?.html?.chars.types &&
							this.writingFeedback?.corrections?.html?.chars.groupIds &&
							this.writingFeedback?.corrections?.html?.chars.lengths &&
							this.writingFeedback?.corrections?.html?.chars.starts
						)
					) {
						this.isHtmlView = false;
					}

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

					// iterrate over contentTextMatches and update the wrong and correct text for each correction that is a writing-feedback type
					this.contentTextMatches.forEach(row => {
						row.forEach(correction => {
							if (correction.match.type === MatchType.writingFeedback) {
								correction.match.wrongText = this.displayedScanCorrectionsView.find(
									c => c.start === correction.match.start && c.end === correction.match.end
								)?.wrongText;
								correction.match.correctionText = this.displayedScanCorrectionsView.find(
									c => c.start === correction.match.start && c.end === correction.match.end
								)?.correctionText;
							}
						});
					});
				}
			}
		});

		this.matchSvc.showAIPhrases$.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
			this.showAIPhrases = data;
		});

		this.statisticsSvc.statistics$.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
			if (data) this.reportStatistics = data;
			const res = Math.min(
				1,
				this.combined / ((this.reportStatistics?.total ?? 0) - (this.reportStatistics?.omittedWords ?? 0))
			);
			this.plagiarismScore = isNaN(res) ? 0 : res;
		});

		const { originalText$, originalHtml$, multiOriginalText$ } = this.highlightSvc;
		combineLatest([
			originalText$.pipe(distinctUntilChanged()),
			originalHtml$.pipe(distinctUntilChanged()),
			multiOriginalText$.pipe(distinctUntilChanged()),
			this.reportViewSvc.reportViewMode$.pipe(distinctUntilChanged()),
			this.reportDataSvc.crawledVersion$.pipe(distinctUntilChanged()),
		])
			.pipe(
				takeUntil(this.unsubscribe$),
				filter(
					([originalText, originalHtml, , reportViewMode, crawledVersion]) =>
						!!crawledVersion &&
						reportViewMode?.alertCode !== ALERTS.SUSPECTED_AI_TEXT_DETECTED &&
						originalHtml?.type != MatchType.aiExplain &&
						originalHtml?.type != MatchType.aiText &&
						originalText?.match?.type != MatchType.aiExplain &&
						originalText?.match?.type != MatchType.aiText
				)
			)
			.subscribe(([text, html, multiText, content]) => {
				if (multiText && multiText.length > 0) {
					const selectedMatches = multiText.map(c => c.match);
					if (this.viewMode === 'one-to-many' || this.viewMode === 'only-ai') {
						this._showResultsForMatchingMultiSelection(selectedMatches);
					} else if (this.viewMode === 'writing-feedback') {
						if (selectedMatches.length === 0) this.displayedScanCorrectionsView = this.filteredCorrections;
						else
							this.displayedScanCorrectionsView = this.allScanCorrectionsView.filter(sc =>
								selectedMatches.find(sm => sm.start === sc.start && sm.end === sc.end)
							);
						this.correctionClicked = selectedMatches?.length > 0;
					}
				} else {
					this.focusedMatch = !content.isHtmlView ? text && text.match : html;
					if (this.viewMode === 'one-to-many' || this.viewMode === 'only-ai') {
						this._showResultsForSelectedMatch(this.focusedMatch);
					} else if (this.viewMode === 'writing-feedback') {
						if (this.focusedMatch)
							this.displayedScanCorrectionsView = this.allScanCorrectionsView.filter(
								sc => this.focusedMatch.start === sc.start && this.focusedMatch.end === sc.end
							);
						else this.displayedScanCorrectionsView = this.filteredCorrections;
						this.correctionClicked = !!this.focusedMatch;
					}
				}
			});

		this.templatesSvc.reportTemplatesSubject$.pipe(takeUntil(this.unsubscribe$)).subscribe(refs => {
			if (refs?.customResultsTemplate !== undefined && this.customResultsTemplate === undefined) {
				setTimeout(() => {
					this.customResultsTemplate = refs?.customResultsTemplate;
				});
			}

			if (refs?.customBannerSectionTemplate !== undefined && this.customBannerSectionTemplate === undefined) {
				setTimeout(() => {
					this.customBannerSectionTemplate = refs?.customBannerSectionTemplate;
				});
			}

			if (
				refs?.customAISourceMatchUpgradeTemplate !== undefined &&
				this.customAISourceMatchUpgradeTemplate === undefined
			) {
				setTimeout(() => {
					this.customAISourceMatchUpgradeTemplate = refs?.customAISourceMatchUpgradeTemplate;
				});
			}
		});

		this.templatesSvc.reportTemplatesMode$.pipe(takeUntil(this.unsubscribe$)).subscribe(mode => {
			if (mode === undefined) return;
			this.reportTemplateMode = mode;
		});

		this.matchSvc.aiPhrases$.pipe(takeUntil(this.unsubscribe$)).subscribe(phrases => {
			if (!phrases) return;
			let slicedMatch: SlicedMatch[] = [];
			phrases?.forEach(result => {
				const explainText = result.filter(re => re.match.type === MatchType.aiExplain);
				if (explainText.length > 0) {
					slicedMatch.push(...explainText);
				}
			});
			if (this.explainableAI.slicedMatch.length === 0) {
				this.explainableAI.slicedMatch = slicedMatch;
			}
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
					if (!selectedMatches.find(s => s && s.gid === this.reportMatches[i]?.gid))
						selectedMatches.push(this.reportMatches[i]);
				});
				if (
					(this.viewMode === 'one-to-many' && this.selectedTap === EReportViewType.AIView) ||
					this.viewMode === 'only-ai'
				) {
					this._showResultsForAIInsightsMultiSelection(selectedMatches);
				} else if (this.viewMode === 'one-to-many') {
					this._showResultsForMatchingMultiSelection(selectedMatches);
				} else if (this.viewMode === 'writing-feedback') {
					if (selectedMatches.length === 0) this.displayedScanCorrectionsView = this.filteredCorrections;
					else this.displayedScanCorrectionsView = [];
					selectedMatches.forEach(sc => {
						if (sc && sc.gid >= 0 && sc.gid < this.allScanCorrectionsView.length)
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

	private _showResultsForAIInsightsMultiSelection(selectedMatches: Match[]): void {
		const selectedAIInsights: SlicedMatch[] = [];
		const prevSelectedAIInsights = this.highlightSvc.aiInsightsSelectedResults ?? [];
		const validSelectedAlert = this.reportDataSvc.scanResultsPreviews?.notifications?.alerts?.find(
			a => a.code === ALERTS.SUSPECTED_AI_TEXT_DETECTED
		);
		const scanResult: AIScanResult = validSelectedAlert
			? (JSON.parse(validSelectedAlert.additionalData) as AIScanResult)
			: null;

		// Process selected matches
		selectedMatches.forEach(selectedMatch => {
			const selectedAIInsight = this.explainableAI.slicedMatch[selectedMatch?.gid];
			if (!selectedAIInsight) return;

			selectedAIInsights.push(selectedAIInsight);

			const isAlreadySelected = prevSelectedAIInsights.some(
				ai =>
					ai.resultRange.start === selectedAIInsight.match.start && ai.resultRange.end === selectedAIInsight.match.end
			);

			// Add to highlights if not already selected
			if (!isAlreadySelected) {
				this.highlightSvc.setOriginalHtmlMatch(selectedMatch);
			}
		});

		// Filter out unselected AI insights
		const unselectedAIInsights = prevSelectedAIInsights.filter(
			ai =>
				!selectedAIInsights.some(
					selected => selected.match.start === ai.resultRange.start && selected.match.end === ai.resultRange.end
				)
		);

		// Process unselected matches
		unselectedAIInsights.forEach(unselectedMatch => {
			if (!scanResult) return;

			const index = scanResult.explain.patterns.text.chars.starts.findIndex(
				start => start === unselectedMatch.resultRange.start
			);

			const matchToUnhighlight = this.reportMatches.find(match => match.gid === index);
			if (matchToUnhighlight) {
				this.highlightSvc.setOriginalHtmlMatch(matchToUnhighlight);
			}
		});
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

	private _showResultsForMatchingMultiSelection(selctions: Match[]) {
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

		this.writingFeedbackStats = this.statisticsSvc.initCorrectionsStatistics();

		const viewedCorrections = [];
		let correctionIndex: number = 0;
		for (let correctionsRow of this.contentTextMatches) {
			for (let correction of correctionsRow) {
				if (correction.match.type === MatchType.writingFeedback && filteredCorrections?.text?.chars?.operationTexts) {
					viewedCorrections.push({
						correctionText: filteredCorrections.text.chars.operationTexts[correctionIndex],
						type: correction.match.writingFeedbackType,
						wrongText: this.reportCrawledVersion?.text?.value?.substring(correction.match.start, correction.match.end),
						start: correction.match.start,
						end: correction.match.end,
						index: this.allScanCorrectionsView?.find(
							c => correction.match.start === c.start && correction.match.end === c.end
						)?.index,
					} as IWritingFeedbackCorrectionViewModel);
					this.statisticsSvc.increaseCorrectionsCategoryTotal(
						this.writingFeedbackStats,
						correction.match.writingFeedbackType
					);
					correctionIndex++;
				}
			}
		}
		return viewedCorrections;
	}

	protected onComponentDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
