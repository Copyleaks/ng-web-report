import { Component, OnInit, Renderer2 } from '@angular/core';
import { ReportDataService } from '../../../../services/report-data.service';
import iframeJsScript from '../../../../utils/one-to-many-iframe-logic';
import { COPYLEAKS_REPORT_IFRAME_STYLES } from '../../../../constants/iframe-styles.constants';
import { Match, SlicedMatch } from '../../../../models/report-matches.models';
import { ReportMatchesService } from '../../../../services/report-matches.service';
import { PostMessageEvent } from '../../../../models/report-iframe-events.models';
import { IScanSource, ResultPreview } from '../../../../models/report-data.models';
import { IReportViewEvent } from '../../../../models/report-view.models';
import { ReportViewService } from '../../../../services/report-view.service';
import * as helpers from '../../../../utils/report-match-helpers';
import { ReportLayoutBaseComponent } from '../../base/report-layout-base.component';
import { ReportMatchHighlightService } from 'projects/copyleaks-web-report/src/lib/services/report-match-highlight.service';

@Component({
	selector: 'copyleaks-one-to-many-report-layout-desktop',
	templateUrl: './one-to-many-report-layout-desktop.component.html',
	styleUrls: ['./one-to-many-report-layout-desktop.component.scss'],
})
export class OneToManyReportLayoutDesktopComponent extends ReportLayoutBaseComponent implements OnInit {
	hideRightSection = false;

	reportCrawledVersion: IScanSource;
	iframeHtml: string;
	reportMatches: Match[];

	contentTextMatches: SlicedMatch[][];
	numberOfPages: number;
	currentPageSource: number;
	oneToOneRerendered: boolean;

	get numberOfWords(): number | undefined {
		return this.reportDataSvc.scanResultsPreviews?.scannedDocument?.totalWords;
	}

	override get rerendered(): boolean {
		return this.oneToOneRerendered;
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
		this.reportDataSvc.crawledVersion$.subscribe(data => {
			if (data) {
				this.reportCrawledVersion = data;
				this.numberOfPages = data.text?.pages?.startPosition?.length ?? 1;
			}
		});

		this.matchSvc.originalHtmlMatches$.subscribe(data => {
			const updatedHtml = this._getRenderedMatches(data, this.reportCrawledVersion?.html.value);
			if (updatedHtml && data) {
				this.iframeHtml = updatedHtml;
				this.oneToOneRerendered = true;
				this.reportMatches = data;
			}
		});

		this.matchSvc.originalTextMatches$.subscribe(data => {
			if (data) {
				this.contentTextMatches = data;
			}
		});

		this.reportViewSvc.reportViewMode$.subscribe(data => {
			if (!data) return;
			this.isHtmlView = data.isHtmlView;
			this.currentPageSource = data.sourcePageIndex;
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
}
