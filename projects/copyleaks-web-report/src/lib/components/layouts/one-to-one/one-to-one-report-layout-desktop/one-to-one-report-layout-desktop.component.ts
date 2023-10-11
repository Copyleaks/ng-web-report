import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { COPYLEAKS_REPORT_IFRAME_STYLES } from 'projects/copyleaks-web-report/src/lib/constants/iframe-styles.constants';
import { EExcludeReason } from 'projects/copyleaks-web-report/src/lib/enums/copyleaks-web-report.enums';
import { IScanSource } from 'projects/copyleaks-web-report/src/lib/models/report-data.models';
import { Match, MatchType, SlicedMatch } from 'projects/copyleaks-web-report/src/lib/models/report-matches.models';
import { ReportDataService } from 'projects/copyleaks-web-report/src/lib/services/report-data.service';
import { ReportMatchesService } from 'projects/copyleaks-web-report/src/lib/services/report-matches.service';
import { ReportViewService } from 'projects/copyleaks-web-report/src/lib/services/report-view.service';
import iframeJsScript from '../../../../utils/one-to-one-iframe-logic';
import { PostMessageEvent } from 'projects/copyleaks-web-report/src/lib/models/report-iframe-events.models';
import { IReportViewEvent } from 'projects/copyleaks-web-report/src/lib/models/report-view.models';
import { ReportMatchHighlightService } from 'projects/copyleaks-web-report/src/lib/services/report-match-highlight.service';
import * as helpers from '../../../../utils/report-match-helpers';
import { ReportLayoutBaseComponent } from '../../base/report-layout-base.component';

@Component({
	selector: 'copyleaks-one-to-one-report-layout-desktop',
	templateUrl: './one-to-one-report-layout-desktop.component.html',
	styleUrls: ['./one-to-one-report-layout-desktop.component.scss'],
})
export class OneToOneReportLayoutDesktopComponent extends ReportLayoutBaseComponent implements OnInit, OnDestroy {
	hideRightSection = false;

	numberOfPagesSuspect: number;
	numberOfPagesSource: number;
	rerenderedSource: boolean;
	rerenderedSuspect: boolean;

	suspectCrawledVersion: IScanSource;
	sourceCrawledVersion: IScanSource;

	suspectIframeHtml: string;
	sourceIframeHtml: string;

	sourceTextMatches: SlicedMatch[][];
	suspectTextMatches: SlicedMatch[][];

	sourceHtmlMatches: Match[];
	suspectHtmlMatches: Match[];

	currentPageSuspect: number;
	currentPageSource: number;

	get numberOfWords(): number | undefined {
		return this.reportDataSvc.scanResultsPreviews?.scannedDocument?.totalWords;
	}

	override get rerendered(): boolean {
		return this.rerenderedSource && this.rerenderedSuspect;
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
		//! TODO REMOVE
		this.reportDataSvc.scanResultsDetails$.subscribe(data => {
			if (data) this.reportViewSvc.selectedResult$.next(data[1]);
		});

		this.reportDataSvc.crawledVersion$.subscribe(data => {
			if (data) {
				this.sourceCrawledVersion = data;
				this.numberOfPagesSource = data.text?.pages?.startPosition?.length ?? 1;
			}
		});

		this.matchSvc.suspectTextMatches$.subscribe(data => {
			if (data) this.suspectTextMatches = data;
		});

		this.matchSvc.sourceHtmlMatches$.subscribe(data => {
			const rerenderedMatches = this._getRenderedMatches(data, this.sourceCrawledVersion?.html?.value);
			if (rerenderedMatches && data) {
				this.sourceIframeHtml = rerenderedMatches;
				this.rerenderedSource = true;
				this.sourceHtmlMatches = data;
			}
		});

		this.matchSvc.sourceTextMatches$.subscribe(data => {
			if (data) this.sourceTextMatches = data;
		});

		this.reportViewSvc.selectedResult$.subscribe(resultData => {
			this.matchSvc.suspectHtmlMatches$.subscribe(data => {
				if (!resultData?.result?.html.value) return;
				const rerenderedMatches = this._getRenderedMatches(data, resultData?.result?.html?.value);
				if (rerenderedMatches && data) {
					this.suspectIframeHtml = rerenderedMatches;
					this.rerenderedSuspect = true;
					this.suspectHtmlMatches = data;
					this.numberOfPagesSuspect = resultData.result?.text?.pages?.startPosition?.length ?? 1;
				}
			});
		});

		this.reportViewSvc.reportViewMode$.subscribe(data => {
			if (!data) return;
			this.isHtmlView = data.isHtmlView;
			this.currentPageSource = data.sourcePageIndex;
			if (data.suspectPageIndex) this.currentPageSuspect = data.suspectPageIndex;
		});
	}

	onSourceIFrameMessage(message: PostMessageEvent) {
		switch (message.type) {
			case 'match-select':
				this.highlightSvc.setSourceHtmlMatch(message.index !== -1 ? this.sourceHtmlMatches[message.index] : null);
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

	onSuspectIFrameMessage(message: PostMessageEvent) {
		switch (message.type) {
			case 'match-select':
				this.highlightSvc.setSuspectHtmlMatch(message.index !== -1 ? this.suspectHtmlMatches[message.index] : null);
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
