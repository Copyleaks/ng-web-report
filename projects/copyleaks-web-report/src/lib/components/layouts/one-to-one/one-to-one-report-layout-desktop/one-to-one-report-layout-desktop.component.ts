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

@Component({
	selector: 'copyleaks-one-to-one-report-layout-desktop',
	templateUrl: './one-to-one-report-layout-desktop.component.html',
	styleUrls: ['./one-to-one-report-layout-desktop.component.scss'],
})
export class OneToOneReportLayoutDesktopComponent implements OnInit, OnDestroy {
	isHtmlView: boolean = true;
	hideRightSection = false;

	numberOfPagesSuspect: number;
	numberOfPagesSource: number;
	rerenderedSource: boolean;
	rerenderedSuspect: boolean;

	suspectCrawledVersion: IScanSource;
	sourceCrawledVersion: IScanSource;

	iframeStyle = COPYLEAKS_REPORT_IFRAME_STYLES;
	iframeJsScript = iframeJsScript;

	suspectIframeHtml: string;
	sourceIframeHtml: string;

	sourceTextMatches: SlicedMatch[][];
	suspectTextMatches: SlicedMatch[][];

	sourceHtmlMatches: Match[];
	suspectHtmlMatches: Match[];

	currentPageSuspect: number;
	currentPageSource: number;

	get numberOfWords(): number | undefined {
		return this._reportDataSvc.scanResultsPreviews?.scannedDocument?.totalWords;
	}

	constructor(
		private _reportDataSvc: ReportDataService,
		private _reportViewSvc: ReportViewService,
		private _matchSvc: ReportMatchesService,
		private _renderer: Renderer2,
		private _highlightSvc: ReportMatchHighlightService
	) {}

	ngOnInit(): void {
		//! TODO REMOVE
		this._reportDataSvc.scanResultsDetails$.subscribe(data => {
			if (data) this._reportViewSvc.selectedResult$.next(data[1]);
		});

		this._reportDataSvc.crawledVersion$.subscribe(data => {
			if (data) {
				this.sourceCrawledVersion = data;
				this.numberOfPagesSource = data.text?.pages?.startPosition?.length ?? 1;
			}
		});

		this._matchSvc.suspectTextMatches$.subscribe(data => {
			if (data) this.suspectTextMatches = data;
		});

		this._matchSvc.sourceHtmlMatches$.subscribe(data => {
			const rerenderedMatches = this._getRenderedMatches(data, this.sourceCrawledVersion?.html?.value);
			if (rerenderedMatches && data) {
				this.sourceIframeHtml = rerenderedMatches;
				this.rerenderedSource = true;
				this.sourceHtmlMatches = data;
			}
		});

		this._matchSvc.sourceTextMatches$.subscribe(data => {
			if (data) this.sourceTextMatches = data;
		});

		this._reportViewSvc.selectedResult$.subscribe(resultData => {
			this._matchSvc.suspectHtmlMatches$.subscribe(data => {
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

		this._reportViewSvc.reportViewMode$.subscribe(data => {
			if (!data) return;
			this.isHtmlView = data.isHtmlView;
			this.currentPageSource = data.sourcePageIndex;
			if (data.suspectPageIndex) this.currentPageSuspect = data.suspectPageIndex;
		});
	}

	/**
	 * Render list of matches in the iframe's HTML
	 * @param matches the matches to render
	 */
	private _getRenderedMatches(matches: Match[] | null, sourceHtml: string) {
		if ((this.rerenderedSource && this.rerenderedSuspect) || !matches) return null;

		const html = matches.reduceRight((prev: string, curr: Match, i: number) => {
			let slice = sourceHtml?.substring(curr.start, curr.end);
			switch (curr.type) {
				case MatchType.excluded:
					if (curr.reason === EExcludeReason.PartialScan) {
						slice = `<span exclude-partial-scan data-type="${curr.type}" data-index="${i}">${slice}</span>`;
					} else {
						slice = `<span exclude>${slice}</span>`;
					}
					break;
				case MatchType.none:
					break;
				default:
					slice = `<span match data-type="${curr.type}" data-index="${i}" data-gid="${curr.gid}">${slice}</span>`;
					break;
			}
			return slice ? slice?.concat(prev) : '';
		}, '');

		const css = this._renderer.createElement('style') as HTMLStyleElement;
		css.textContent = this.iframeStyle;
		const iframeStyle = css.outerHTML;

		const js = this._renderer.createElement('script') as HTMLScriptElement;
		js.textContent = this.iframeJsScript;
		const iframeJsScript = js.outerHTML;

		return html + iframeStyle + iframeJsScript;
	}

	onSourceIFrameMessage(message: PostMessageEvent) {
		switch (message.type) {
			case 'match-select':
				this._highlightSvc.setSourceHtmlMatch(message.index !== -1 ? this.sourceHtmlMatches[message.index] : null);

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
				this._highlightSvc.setSuspectHtmlMatch(message.index !== -1 ? this.suspectHtmlMatches[message.index] : null);
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

	onReportViewChange(event: IReportViewEvent) {
		this.isHtmlView = event.isHtmlView;
		this._reportViewSvc.reportViewMode$.next(event);
	}

	ngOnDestroy(): void {}
}
