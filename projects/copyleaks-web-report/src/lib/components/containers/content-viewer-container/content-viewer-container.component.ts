import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	HostBinding,
	HostListener,
	Input,
	OnChanges,
	OnInit,
	Output,
	Renderer2,
	SimpleChanges,
	ViewChild,
} from '@angular/core';
import { PostMessageEvent } from '../../../models/report-iframe-events.models';
import { IReportViewEvent } from '../../../models/report-view.models';
import { Match, MatchType, ReportOrigin, SlicedMatch } from '../../../models/report-matches.models';
import { DirectionMode as ReportContentDirectionMode, ViewMode } from '../../../models/report-config.models';
import { TEXT_FONT_SIZE_UNIT, MIN_TEXT_ZOOM, MAX_TEXT_ZOOM } from '../../../constants/report-content.constants';
import { PageEvent } from '../../core/cls-paginator/models/cls-paginator.models';
import { ReportMatchHighlightService } from '../../../services/report-match-highlight.service';
import { IScanSource } from '../../../models/report-data.models';

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
	@Input() isHtmlView: boolean;

	/**
	 * @Input {string} The content viewer HTML value
	 */
	@Input() scanSource: IScanSource;

	/**
	 * @Input {string} The content viewer HTML value
	 */
	@Input() contentHtml: string;

	/**
	 * @Input {string} The content viewer HTML value
	 */
	@Input() contentTextMatches: SlicedMatch[][];

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

	/**
	 * @Input {number} Flex grow property - flex-grow
	 */
	@Input() contentDirection: ReportContentDirectionMode = 'ltr';

	/**
	 * @Input {number} Flex grow property - flex-grow
	 */
	@Input() contentZoom: number = 1;

	/**
	 * @Input {number} The current page in text view report
	 */
	@Input() currentPage: number;

	/**
	 * @Input {number} The current page in text view report
	 */
	@Input() numberOfPages: number = 1;

	/**
	 * @Input {number} The current page in text view report
	 */
	@Input() numberOfWords: number | undefined = undefined;

	@Input() viewMode: ViewMode = 'one-to-many';

	@Input() reportOrigin: ReportOrigin = 'original';

	@Output() iFrameMessageEvent = new EventEmitter<PostMessageEvent>();

	@Output() viewChangeEvent = new EventEmitter<IReportViewEvent>();

	iFrameWindow: Window | null;

	MatchType = MatchType;
	canViewMorePages: boolean = true;

	public get pages(): number[] {
		return this.scanSource && this.scanSource.text.pages.startPosition;
	}

	/**
	 * `true` if the source document has an `html` section
	 */
	get hasHtml(): boolean {
		return this.scanSource && this.scanSource.html && !!this.scanSource.html.value;
	}

	constructor(
		private _renderer: Renderer2,
		private _cdr: ChangeDetectorRef,
		private _highlightService: ReportMatchHighlightService
	) {}

	ngOnInit(): void {
		if (this.flexGrow !== undefined && this.flexGrow !== null) this.flexGrowProp = this.flexGrow;
		if (this.currentPage > this.numberOfPages) this.currentPage = 1;
		if (this.currentPage >= this.numberOfPages) this.canViewMorePages = false;
	}

	ngAfterViewInit() {
		if (this.contentHtml) this._renderer.setAttribute(this.contentIFrame.nativeElement, 'srcdoc', this.contentHtml);
		this.iFrameWindow = this.contentIFrame?.nativeElement?.contentWindow;
		this._cdr.detectChanges();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['contentHtml'] && changes['contentHtml'].currentValue && this.contentIFrame?.nativeElement)
			this._renderer.setAttribute(this.contentIFrame.nativeElement, 'srcdoc', changes['contentHtml'].currentValue);

		if (changes['currentPage']) {
		}
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

		const iframeEvent = data as PostMessageEvent;
		this.iFrameMessageEvent.emit(iframeEvent);
	}

	onViewChange() {
		this.viewChangeEvent.emit({
			isHtmlView: !this.isHtmlView,
			viewMode: this.viewMode,
			sourcePageIndex: this.currentPage,
		});
		this._cdr.detectChanges();
	}

	changeContentDirection(direction: ReportContentDirectionMode) {
		this.contentDirection = direction;
	}

	/**
	 * updates the font size of the suspect text.
	 * @param amount a decimal number between 0.5 and 4
	 */
	decreaseFontSize(amount: number = TEXT_FONT_SIZE_UNIT) {
		this.contentZoom = Math.max(this.contentZoom - amount, MIN_TEXT_ZOOM);
	}

	/**
	 * updates the font size of the suspect text.
	 * @param amount a decimal number between 0.5 and 4
	 */
	increaseFontSize(amount: number = TEXT_FONT_SIZE_UNIT) {
		this.contentZoom = Math.min(this.contentZoom + amount, MAX_TEXT_ZOOM);
	}

	onPaginationEvent(event: PageEvent) {
		if (!event) return;

		this.currentPage = event.pageIndex;
		this.canViewMorePages = this.currentPage < this.numberOfPages;
	}

	/**
	 * Jump to next match click handler.
	 * @param next if `true` jump to next match, otherwise jumpt to previous match
	 */
	onJumpToNextMatchClick(next: boolean = true) {
		this._highlightService.jump(next);
	}
}
