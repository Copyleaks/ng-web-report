import { Component, OnInit, Renderer2 } from '@angular/core';
import { IScanSource } from 'projects/copyleaks-web-report/src/lib/models/report-data.models';
import { PostMessageEvent } from 'projects/copyleaks-web-report/src/lib/models/report-iframe-events.models';
import {
	SlicedMatch,
	Match,
	ResultDetailItem,
} from 'projects/copyleaks-web-report/src/lib/models/report-matches.models';
import { IReportViewEvent } from 'projects/copyleaks-web-report/src/lib/models/report-view.models';
import { ReportDataService } from 'projects/copyleaks-web-report/src/lib/services/report-data.service';
import { ReportMatchHighlightService } from 'projects/copyleaks-web-report/src/lib/services/report-match-highlight.service';
import { ReportMatchesService } from 'projects/copyleaks-web-report/src/lib/services/report-matches.service';
import { ReportViewService } from 'projects/copyleaks-web-report/src/lib/services/report-view.service';
import iframeJsScript from '../../../../utils/one-to-one-iframe-logic';
import * as helpers from '../../../../utils/report-match-helpers';
import { ReportLayoutBaseComponent } from '../../base/report-layout-base.component';
import { EResponsiveLayoutType } from 'projects/copyleaks-web-report/src/lib/enums/copyleaks-web-report.enums';
import { filter } from 'rxjs/operators';
import { untilDestroy } from 'projects/copyleaks-web-report/src/lib/utils/until-destroy';
import { ReportStatisticsService } from 'projects/copyleaks-web-report/src/lib/services/report-statistics.service';

@Component({
	selector: 'copyleaks-one-to-one-report-layout-mobile',
	templateUrl: './one-to-one-report-layout-mobile.component.html',
	styleUrls: ['./one-to-one-report-layout-mobile.component.scss'],
})
export class OneToOneReportLayoutMobileComponent extends ReportLayoutBaseComponent implements OnInit {
	numberOfPagesSuspect: number;
	numberOfPagesSource: number;
	rerenderedSource: boolean = false;
	rerenderedSuspect: boolean = false;

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
	resultData: ResultDetailItem;

	EResponsiveLayoutType = EResponsiveLayoutType;

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
		highlightSvc: ReportMatchHighlightService,
		statisticsSvc: ReportStatisticsService
	) {
		super(reportDataSvc, reportViewSvc, matchSvc, renderer, highlightSvc, statisticsSvc);
		this.iframeJsScript = iframeJsScript;
	}

	ngOnInit(): void {
		this.reportDataSvc.crawledVersion$.pipe(untilDestroy(this)).subscribe(data => {
			if (data) {
				this.sourceCrawledVersion = data;
				this.numberOfPagesSource = data.text?.pages?.startPosition?.length ?? 1;
			}
		});

		this.matchSvc.suspectTextMatches$.pipe(untilDestroy(this)).subscribe(data => {
			if (data) this.suspectTextMatches = data;
		});

		this.matchSvc.sourceHtmlMatches$.pipe(untilDestroy(this)).subscribe(data => {
			const rerenderedMatches = this._getRenderedMatches(data, this.sourceCrawledVersion?.html?.value);
			if (rerenderedMatches && data) {
				this.sourceIframeHtml = rerenderedMatches;
				this.rerenderedSource = true;
				this.sourceHtmlMatches = data;
			}
		});

		this.matchSvc.sourceTextMatches$.pipe(untilDestroy(this)).subscribe(data => {
			if (data) this.sourceTextMatches = data;
		});

		this.reportViewSvc.selectedResult$.pipe(untilDestroy(this)).subscribe(resultData => {
			if (resultData) {
				this.numberOfPagesSuspect = resultData.result?.text?.pages?.startPosition?.length ?? 1;
				this.resultData = resultData;
			}
			this.matchSvc.suspectHtmlMatches$.pipe(untilDestroy(this)).subscribe(data => {
				if (!resultData?.result?.html.value) return;
				const rerenderedMatches = this._getRenderedMatches(data, resultData?.result?.html?.value);
				if (rerenderedMatches && data) {
					this.suspectIframeHtml = rerenderedMatches;
					this.rerenderedSuspect = true;
					this.suspectHtmlMatches = data;
				}
			});
		});

		this.reportViewSvc.reportViewMode$
			.pipe(
				filter(data => data.viewMode === 'one-to-one'),
				untilDestroy(this)
			)
			.subscribe(data => {
				if (!data) return;
				this.isHtmlView = data.isHtmlView;
				this.currentPageSource = data.sourcePageIndex;
				if (data.suspectPageIndex) this.currentPageSuspect = data.suspectPageIndex;
				this.reportDataSvc.scanResultsDetails$.pipe(untilDestroy(this)).subscribe(results => {
					if (!results) return;
					const foundSuspect = results?.find(result => result.id === data.suspectId);
					if (foundSuspect) this.reportViewSvc.selectedResult$.next(foundSuspect);
					else {
						// if the result is not found, then change the view to one-to-many
						this.reportViewSvc.reportViewMode$.next({
							isHtmlView: data.isHtmlView,
							viewMode: 'one-to-many',
							sourcePageIndex: data.sourcePageIndex,
							suspectPageIndex: data.suspectPageIndex,
							suspectId: undefined,
						});
					}
				});
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
