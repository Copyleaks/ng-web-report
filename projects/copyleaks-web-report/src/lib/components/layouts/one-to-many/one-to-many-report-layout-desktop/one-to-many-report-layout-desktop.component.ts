import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ReportDataService } from '../../../../services/report-data.service';
import { Match, SlicedMatch } from '../../../../models/report-matches.models';
import { ReportMatchesService } from '../../../../services/report-matches.service';
import { PostMessageEvent } from '../../../../models/report-iframe-events.models';
import { ICompleteResultNotificationAlert, IScanSource, ResultPreview } from '../../../../models/report-data.models';
import { ReportViewService } from '../../../../services/report-view.service';
import { ReportLayoutBaseComponent } from '../../base/report-layout-base.component';
import { ReportMatchHighlightService } from 'projects/copyleaks-web-report/src/lib/services/report-match-highlight.service';
import {
	EReportViewType,
	EResponsiveLayoutType,
} from 'projects/copyleaks-web-report/src/lib/enums/copyleaks-web-report.enums';
import { untilDestroy } from 'projects/copyleaks-web-report/src/lib/utils/until-destroy';
import { ReportStatisticsService } from 'projects/copyleaks-web-report/src/lib/services/report-statistics.service';
import { ReportStatistics } from 'projects/copyleaks-web-report/src/lib/models/report-statistics.models';
import { ALERTS } from 'projects/copyleaks-web-report/src/lib/constants/report-alerts.constants';

@Component({
	selector: 'copyleaks-one-to-many-report-layout-desktop',
	templateUrl: './one-to-many-report-layout-desktop.component.html',
	styleUrls: ['./one-to-many-report-layout-desktop.component.scss'],
})
export class OneToManyReportLayoutDesktopComponent extends ReportLayoutBaseComponent implements OnInit, OnDestroy {
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
	reportStatistics: ReportStatistics;
	selectedTap: EReportViewType = EReportViewType.PlagiarismView;

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
			this.combined / ((this.reportStatistics?.total ?? 0) - this.reportStatistics?.omittedWords)
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

	ngOnInit(): void {
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
			this.reportDataSvc.scanResultsPreviews$.pipe(untilDestroy(this)).subscribe(previews => {
				// this.reportViewSvc.selectedAlert$.next(data?.alertCode ?? null);
				if (data?.alertCode) this.isHtmlView = false;
				this.alerts = previews?.notifications?.alerts ?? [];
			});
		});

		this.statisticsSvc.statistics$.pipe(untilDestroy(this)).subscribe(data => {
			if (data) this.reportStatistics = data;
			console.log(data);
		});
	}

	onIFrameMessage(message: PostMessageEvent) {
		switch (message.type) {
			case 'match-select':
				const selectedMatch = message.index !== -1 ? this.reportMatches[message.index] : null;
				let viewedResults: ResultPreview[] = [];
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
				console.log('Results for selected match: ', viewedResults);
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

	ngOnDestroy(): void {}
}
