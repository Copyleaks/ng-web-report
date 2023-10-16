import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ReportDataService } from '../../../../services/report-data.service';
import { Match, SlicedMatch } from '../../../../models/report-matches.models';
import { ReportMatchesService } from '../../../../services/report-matches.service';
import { PostMessageEvent } from '../../../../models/report-iframe-events.models';
import { ICompleteResultNotificationAlert, IScanSource, ResultPreview } from '../../../../models/report-data.models';
import { ReportViewService } from '../../../../services/report-view.service';
import { ReportLayoutBaseComponent } from '../../base/report-layout-base.component';
import { ReportMatchHighlightService } from 'projects/copyleaks-web-report/src/lib/services/report-match-highlight.service';
import { EResponsiveLayoutType } from 'projects/copyleaks-web-report/src/lib/enums/copyleaks-web-report.enums';
import { untilDestroy } from 'projects/copyleaks-web-report/src/lib/utils/until-destroy';

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

	override get rerendered(): boolean {
		return this.oneToOneRerendered;
	}

	get numberOfWords(): number | undefined {
		return this.reportDataSvc.scanResultsPreviews?.scannedDocument?.totalWords;
	}

	constructor(
		reportDataSvc: ReportDataService,
		reportViewSvc: ReportViewService,
		matchSvc: ReportMatchesService,
		renderer: Renderer2,
		highlightSvc: ReportMatchHighlightService
	) {
		super(reportDataSvc, reportViewSvc, matchSvc, renderer, highlightSvc);
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
			this.reportDataSvc.scanResultsPreviews$.pipe(untilDestroy(this)).subscribe(previews => {
				if (previews && previews.notifications) {
					const selectedAlert = previews.notifications.alerts.find(a => a.code === data.alertCode);
					if (selectedAlert) {
						this.reportViewSvc.selectedAlert$.next(selectedAlert);
						this.isHtmlView = false;
					}
					this.alerts = previews.notifications?.alerts ?? [];
				}
			});
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
