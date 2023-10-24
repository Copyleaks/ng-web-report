import { ReportMatchHighlightService } from 'projects/copyleaks-web-report/src/lib/services/report-match-highlight.service';
import {
	EReportViewType,
	EResponsiveLayoutType,
} from 'projects/copyleaks-web-report/src/lib/enums/copyleaks-web-report.enums';
import { untilDestroy } from 'projects/copyleaks-web-report/src/lib/utils/until-destroy';
import { ReportStatisticsService } from 'projects/copyleaks-web-report/src/lib/services/report-statistics.service';
import { ReportStatistics } from 'projects/copyleaks-web-report/src/lib/models/report-statistics.models';
import { ALERTS } from 'projects/copyleaks-web-report/src/lib/constants/report-alerts.constants';
import { Renderer2 } from '@angular/core';
import {
	IScanSource,
	ICompleteResultNotificationAlert,
	ResultPreview,
	ICompleteResults,
} from '../../../models/report-data.models';
import { PostMessageEvent } from '../../../models/report-iframe-events.models';
import { Match, ResultDetailItem, SlicedMatch } from '../../../models/report-matches.models';
import { ReportDataService } from '../../../services/report-data.service';
import { ReportMatchesService } from '../../../services/report-matches.service';
import { ReportViewService } from '../../../services/report-view.service';
import { ReportLayoutBaseComponent } from './report-layout-base.component';
import { combineLatest } from 'rxjs';
import { IResultItem } from '../../containers/report-results-item-container/components/models/report-result-item.models';
import { IResultsActions } from '../../containers/report-results-container/components/results-actions/models/results-actions.models';
import { filter } from 'rxjs/internal/operators/filter';

export abstract class OneToManyReportLayoutBaseComponent extends ReportLayoutBaseComponent {
	hideRightSection: boolean = false;

	reportCrawledVersion: IScanSource;
	iframeHtml: string;
	reportMatches: Match[];

	contentTextMatches: SlicedMatch[][];
	numberOfPages: number;
	currentPageSource: number;

	oneToOneRerendered: boolean = false;
	EResponsiveLayoutType = EResponsiveLayoutType;
	alerts: ICompleteResultNotificationAlert[];
	reportStatistics: ReportStatistics | undefined;
	selectedTap: EReportViewType = EReportViewType.PlagiarismView;

	scanResultsPreviews: ICompleteResults | undefined;
	scanResultsDetails: ResultDetailItem[] | undefined;
	scanResultsView: IResultItem[];
	scanResultsActions: IResultsActions = {
		totalResults: 0,
		totalExcluded: 0,
		totalFiltered: 0,
	};

	focusedMatch: Match | null;

	override get rerendered(): boolean {
		return this.oneToOneRerendered;
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
		statisticsSvc: ReportStatisticsService
	) {
		super(reportDataSvc, reportViewSvc, matchSvc, renderer, highlightSvc, statisticsSvc);
	}

	initOneToManyViewData(): void {
		this.reportDataSvc.crawledVersion$.pipe(untilDestroy(this)).subscribe(data => {
			if (data) {
				this.reportCrawledVersion = data;
				this.numberOfPages = data.text?.pages?.startPosition?.length ?? 1;
			}
		});

		this.matchSvc.originalHtmlMatches$.pipe(untilDestroy(this)).subscribe(data => {
			if (data != this.reportMatches) {
				this.oneToOneRerendered = false;
			}
			this.reportMatches = data ?? [];
			const updatedHtml = this._getRenderedMatches(data, this.reportCrawledVersion?.html.value);
			if (updatedHtml && data) {
				this.iframeHtml = updatedHtml;
				this.oneToOneRerendered = true;
			}
		});

		this.matchSvc.originalTextMatches$.pipe(untilDestroy(this)).subscribe(data => {
			if (data) {
				this.contentTextMatches = data;
			}
		});

		this.reportViewSvc.reportViewMode$.pipe(untilDestroy(this)).subscribe(data => {
			if (!data) return;
			this.isHtmlView = data.isHtmlView;
			this.currentPageSource = data.sourcePageIndex;
			this.selectedTap =
				data.alertCode === ALERTS.SUSPECTED_AI_TEXT_DETECTED ? EReportViewType.AIView : EReportViewType.PlagiarismView;

			combineLatest([this.reportDataSvc.scanResultsPreviews$, this.reportDataSvc.scanResultsDetails$])
				.pipe(untilDestroy(this))
				.subscribe(([previews, details]) => {
					if (data?.alertCode) this.isHtmlView = false;
					this.alerts = previews?.notifications?.alerts ?? [];
					this.scanResultsPreviews = previews;
					this.scanResultsDetails = details;

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
	}
}
