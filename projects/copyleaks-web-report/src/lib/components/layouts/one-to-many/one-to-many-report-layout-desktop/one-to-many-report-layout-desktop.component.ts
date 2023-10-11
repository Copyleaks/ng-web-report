import { Component, OnInit, Renderer2 } from '@angular/core';
import { ReportDataService } from '../../../../services/report-data.service';
import iframeJsScript from '../../../../utils/one-to-many-iframe-logic';
import { COPYLEAKS_REPORT_IFRAME_STYLES } from '../../../../constants/iframe-styles.constants';
import { Match, MatchType, SlicedMatch } from '../../../../models/report-matches.models';
import { EExcludeReason } from '../../../../enums/copyleaks-web-report.enums';
import { ReportMatchesService } from '../../../../services/report-matches.service';
import { PostMessageEvent } from '../../../../models/report-iframe-events.models';
import { IScanSource, ResultPreview } from '../../../../models/report-data.models';
import { IReportViewEvent } from '../../../../models/report-view.models';
import { ReportViewService } from '../../../../services/report-view.service';

@Component({
	selector: 'copyleaks-one-to-many-report-layout-desktop',
	templateUrl: './one-to-many-report-layout-desktop.component.html',
	styleUrls: ['./one-to-many-report-layout-desktop.component.scss'],
})
export class OneToManyReportLayoutDesktopComponent implements OnInit {
	hideRightSection = false;

	isHtmlView: boolean = true;
	reportCrawledVersion: IScanSource;
	iframeHtml: string;
	iframeStyle = COPYLEAKS_REPORT_IFRAME_STYLES;
	iframeJsScript = iframeJsScript;
	reportMatches: Match[];

	rerendered: any;
	contentTextMatches: SlicedMatch[][];
	numberOfPages: number;
	currentPageSource: number;

	get numberOfWords(): number | undefined {
		return this._reportDataSvc.scanResultsPreviews?.scannedDocument?.totalWords;
	}

	constructor(
		private _reportDataSvc: ReportDataService,
		private _reportViewSvc: ReportViewService,
		private _matchSvc: ReportMatchesService,
		private _renderer: Renderer2
	) {}

	ngOnInit(): void {
		this._reportDataSvc.crawledVersion$.subscribe(data => {
			if (data) {
				this.reportCrawledVersion = data;
				this.numberOfPages = data.text?.pages?.startPosition?.length ?? 1;
			}
		});

		this._matchSvc.originalHtmlMatches$.subscribe(data => {
			if (data) {
				this._renderMatches(data);
			}
		});

		this._matchSvc.originalTextMatches$.subscribe(data => {
			if (data) {
				this.contentTextMatches = data;
			}
		});

		this._reportViewSvc.reportViewMode$.subscribe(data => {
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
					...(this._reportDataSvc.scanResultsPreviews?.results?.internet?.filter(item =>
						selectedMatch?.ids?.includes(item.id)
					) ?? []),
					...(this._reportDataSvc.scanResultsPreviews?.results?.batch?.filter(item =>
						selectedMatch?.ids?.includes(item.id)
					) ?? []),
					...(this._reportDataSvc.scanResultsPreviews?.results?.database?.filter(item =>
						selectedMatch?.ids?.includes(item.id)
					) ?? []),
					...(this._reportDataSvc.scanResultsPreviews?.results?.repositories?.filter(item =>
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

	onReportViewChange(event: IReportViewEvent) {
		this.isHtmlView = event.isHtmlView;
		this._reportViewSvc.reportViewMode$.next(event);
	}

	/**
	 * Render list of matches in the iframe's HTML
	 * @param matches the matches to render
	 */
	private _renderMatches(matches: Match[]) {
		if (this.rerendered) return;

		this.reportMatches = matches;

		const html = matches.reduceRight((prev: string, curr: Match, i: number) => {
			let slice = this.reportCrawledVersion?.html?.value?.substring(curr.start, curr.end);
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
		this.iframeStyle = css.outerHTML;

		const js = this._renderer.createElement('script') as HTMLScriptElement;
		js.textContent = this.iframeJsScript;
		this.iframeJsScript = js.outerHTML;

		this.iframeHtml = html + this.iframeStyle + this.iframeJsScript;
		this.rerendered = true;
	}
}
