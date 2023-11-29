import { Renderer2, TemplateRef } from '@angular/core';
import { combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ALERTS } from '../../../constants/report-alerts.constants';
import { EReportViewType, EResponsiveLayoutType } from '../../../enums/copyleaks-web-report.enums';
import {
	ICompleteResultNotificationAlert,
	ICompleteResults,
	IScanSource,
	ResultPreview,
} from '../../../models/report-data.models';
import { PostMessageEvent } from '../../../models/report-iframe-events.models';
import { Match, ResultDetailItem, SlicedMatch } from '../../../models/report-matches.models';
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

	focusedMatch: Match | null;

	isLoadingScanContent: boolean = true;
	isLoadingScanResults: boolean = true;
	loadingProgressPct: number = 0;

	hidePlagarismTap: boolean = false;
	hideAiTap: boolean = false;
	showDisabledProducts: boolean = false;
	reportViewMode: ECustomResultsReportView;

	EReportViewType = EReportViewType;
	ECustomResultsReportView = ECustomResultsReportView;

	authorAlert: IAuthorAlertCard | null = null;

	customResultsTemplate: TemplateRef<any> | undefined = undefined;

	override get rerendered(): boolean {
		return this.oneToManyRerendered;
	}

	get numberOfWords(): number | undefined {
		return this.reportDataSvc.scanResultsPreviews?.scannedDocument?.totalWords;
	}

	get combined() {
		if (!this.reportStatistics) return 0;
		return (
			this.reportStatistics?.identical + this.reportStatistics?.relatedMeaning + this.reportStatistics?.minorChanges
		);
	}

	get plagiarismScore() {
		const res = Math.min(
			1,
			this.combined / ((this.reportStatistics?.total ?? 0) - (this.reportStatistics?.omittedWords ?? 0))
		);
		return isNaN(res) ? 0 : res;
	}

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
		this.reportViewSvc.progress$.pipe(untilDestroy(this)).subscribe(progress => {
			this.loadingProgressPct = progress;
		});

		this.realTimeResultsSvc.newResults$.pipe(untilDestroy(this)).subscribe(data => {
			if (data) this.newScanResultsView = data;
		});

		this.reportDataSvc.crawledVersion$.pipe(untilDestroy(this)).subscribe(data => {
			if (data) {
				this.reportCrawledVersion = data;
				this.numberOfPages = data.text?.pages?.startPosition?.length ?? 1;
			}
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
			const updatedHtml = this._getRenderedMatches(data, this.reportCrawledVersion?.html.value);
			if (updatedHtml && data) {
				this.iframeHtml = updatedHtml;
				this.oneToManyRerendered = true;
			}
		});

		this.matchSvc.originalTextMatches$.pipe(untilDestroy(this)).subscribe(data => {
			if (data) {
				this.isLoadingScanContent = false;
				this.contentTextMatches = data;
			}
		});

		this.reportViewSvc.reportViewMode$.pipe(untilDestroy(this)).subscribe(data => {
			if (!data) return;
			this.isHtmlView = data.isHtmlView;
			this.currentPageSource = data.sourcePageIndex;
			this.selectedTap =
				data.alertCode === ALERTS.SUSPECTED_AI_TEXT_DETECTED ? EReportViewType.AIView : EReportViewType.PlagiarismView;

			this.showDisabledProducts = data.showDisabledProducts ?? false;

			combineLatest([this.reportDataSvc.scanResultsPreviews$, this.reportDataSvc.scanResultsDetails$])
				.pipe(untilDestroy(this))
				.subscribe(([previews, details]) => {
					if (data?.alertCode) this.isHtmlView = false;
					if (this.reportDataSvc.filterOptions?.showAlerts === false) this.alerts = [];
					else
						this.alerts =
							previews?.notifications?.alerts?.filter(a => a.code != ALERTS.SUSPECTED_AI_TEXT_DETECTED) ?? [];
					this.scanResultsPreviews = previews;
					this.scanResultsDetails = details;

					this.isLoadingScanResults = this.scanResultsPreviews === undefined || this.scanResultsDetails === undefined;

					this.hideAiTap = !this.reportDataSvc.isAiDetectionEnabled();
					this.hidePlagarismTap = !this.reportDataSvc.isPlagiarismEnabled();

					if (this.scanResultsPreviews && this.scanResultsDetails) {
						this.scanResultsActions.totalResults = this.scanResultsDetails.length;
						const allResults = [
							...(this.scanResultsPreviews.results?.internet ?? []),
							...(this.scanResultsPreviews.results?.database ?? []),
							...(this.scanResultsPreviews.results?.batch ?? []),
							...(this.scanResultsPreviews.results?.repositories ?? []),
						];

						this.scanResultsView = allResults
							.sort((a, b) => b.matchedWords - a.matchedWords)
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

		this.statisticsSvc.statistics$.pipe(untilDestroy(this)).subscribe(data => {
			if (data) this.reportStatistics = data;
		});

		const { originalText$, originalHtml$ } = this.highlightSvc;
		combineLatest([originalText$, originalHtml$, this.reportViewSvc.reportViewMode$])
			.pipe(
				untilDestroy(this),
				filter(([, , content]) => !content.alertCode)
			)
			.subscribe(([text, html, content]) => {
				this.focusedMatch = !content.isHtmlView ? text && text.match : html;
				this.showResultsForSelectedMatch(this.focusedMatch);
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
			this.reportViewMode = mode;
		});
	}

	onIFrameMessage(message: PostMessageEvent) {
		switch (message.type) {
			case 'match-select':
				const selectedMatch = message.index !== -1 ? this.reportMatches[message.index] : null;
				this.showResultsForSelectedMatch(selectedMatch);
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

	private showResultsForSelectedMatch(selectedMatch: Match | null) {
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
				this.scanResultsDetails,
				this.reportDataSvc.filterOptions,
				this.reportDataSvc.excludedResultsIds
			);
			viewedResults = viewedResults.filter(r => filteredResults.find(fr => fr.id === r.id));
		}

		this.scanResultsView = viewedResults
			.sort((a, b) => b.matchedWords - a.matchedWords)
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
}
