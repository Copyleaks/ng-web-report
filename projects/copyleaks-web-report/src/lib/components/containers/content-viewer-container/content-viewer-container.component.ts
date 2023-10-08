import {
	AfterViewInit,
	Component,
	ElementRef,
	HostBinding,
	HostListener,
	Input,
	OnChanges,
	OnInit,
	Renderer2,
	SimpleChanges,
	ViewChild,
} from '@angular/core';
import { EExcludeReason } from '../../../enums/copyleaks-web-report.enums';
import { ReportMatchesService } from '../../../services/report-matches.service';
import { Match, MatchType } from '../../../models/report-matches.models';
import { PostMessageEvent } from '../../../models/report-iframe-events.models';
import { ReportDataService } from '../../../services/report-data.service';
import { ResultPreview } from '../../../models/report-data.models';

@Component({
	selector: 'copyleaks-content-viewer-container',
	templateUrl: './content-viewer-container.component.html',
	styleUrls: ['./content-viewer-container.component.scss'],
})
export class ContentViewerContainerComponent implements OnInit, AfterViewInit, OnChanges {
	@HostBinding('style.flex-grow')
	flexGrowProp: number;

	@ViewChild('contentIFrame', { static: false }) contentIFrame: ElementRef<HTMLIFrameElement>;

	/**
	 * @Input {string} The content viewer HTML value
	 */
	@Input() contentHtml: string;

	/**
	 * @Input {string} The content viewer HTML value
	 */
	@Input() contentStyle: string;

	/**
	 * @Input {string} The content viewer HTML value
	 */
	@Input() contentJsScript: string;

	/**
	 * @Input {boolean} Flag indicating whether to show the content title or not.
	 */
	@Input() hideTitleContainer = false;

	/**
	 * @Input {boolean} Flag indicating whether to show the content paginator or not.
	 */
	@Input() hidePaginatorContainer = false;

	/**
	 * @Input {number} Flex grow property - flex-grow
	 */
	@Input() flexGrow: number;

	rerendered: boolean;
	iFrameWindow: Window | null;
	reportMatches: Match[];

	constructor(
		private _renderer: Renderer2,
		private _matchSvc: ReportMatchesService,
		private _reportDataSvc: ReportDataService
	) {}

	ngOnInit(): void {
		if (this.flexGrow !== undefined && this.flexGrow !== null) this.flexGrowProp = this.flexGrow;
	}

	ngAfterViewInit() {
		if (this.contentHtml) this._renderer.setAttribute(this.contentIFrame.nativeElement, 'srcdoc', this.contentHtml);
		this._matchSvc.originalHtmlMatches$.subscribe(data => {
			if (data) {
				this._renderMatches(data);
			}
		});

		this.iFrameWindow = this.contentIFrame?.nativeElement?.contentWindow;
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['contentHtml'] && changes['contentHtml'].currentValue && this.contentIFrame?.nativeElement)
			this._renderer.setAttribute(this.contentIFrame.nativeElement, 'srcdoc', changes['contentHtml'].currentValue);
	}

	/**
	 * Handles PostMessage events, making sure they are from the correct iframe.
	 * @param event the default PostMessage event
	 */
	@HostListener('window:message', ['$event'])
	onFrameMessage(event: MessageEvent) {
		const { source, data } = event;
		if (source !== this.iFrameWindow) {
			return;
		}
		const pmevent = data as PostMessageEvent;
		switch (pmevent.type) {
			case 'match-select':
				const selectedMatch = pmevent.index !== -1 ? this.reportMatches[pmevent.index] : null;
				let viewedResults: ResultPreview[] = [];

				viewedResults = [
					...(this._reportDataSvc.scanResultsPreviews?.internet?.filter(item =>
						selectedMatch?.ids?.includes(item.id)
					) ?? []),
					...(this._reportDataSvc.scanResultsPreviews?.batch?.filter(item => selectedMatch?.ids?.includes(item.id)) ??
						[]),
					...(this._reportDataSvc.scanResultsPreviews?.database?.filter(item =>
						selectedMatch?.ids?.includes(item.id)
					) ?? []),
					...(this._reportDataSvc.scanResultsPreviews?.repositories?.filter(item =>
						selectedMatch?.ids?.includes(item.id)
					) ?? []),
				];
				console.log('Results for selected match: ', viewedResults);

				break;
			case 'upgrade-plan':
				console.log(pmevent);
				break;
			case 'match-warn':
				console.warn('match not found');
				break;
			default:
				console.error('unknown event', pmevent);
		}
	}

	/**
	 * Render list of matches in the iframe's HTML
	 * @param matches the matches to render
	 */
	private _renderMatches(matches: Match[]) {
		if (this.rerendered) return;

		this.reportMatches = matches;

		const html = matches.reduceRight((prev: string, curr: Match, i: number) => {
			let slice = this.contentHtml?.substring(curr.start, curr.end);
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
		css.textContent = this.contentStyle;
		this.contentStyle = css.outerHTML;

		const js = this._renderer.createElement('script') as HTMLScriptElement;
		js.textContent = this.contentJsScript;
		this.contentJsScript = js.outerHTML;

		this._renderer.setAttribute(
			this.contentIFrame.nativeElement,
			'srcdoc',
			html + this.contentStyle + this.contentJsScript
		);

		this.rerendered = true;
	}
}
