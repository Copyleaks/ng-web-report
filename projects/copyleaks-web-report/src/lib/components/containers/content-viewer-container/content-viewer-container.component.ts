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
	TemplateRef,
	ViewChild,
} from '@angular/core';
import { PostMessageEvent, ZoomEvent } from '../../../models/report-iframe-events.models';
import { IReportViewEvent } from '../../../models/report-view.models';
import { Match, MatchType, ReportOrigin, ResultDetailItem, SlicedMatch } from '../../../models/report-matches.models';
import { DirectionMode as ReportContentDirectionMode, ViewMode } from '../../../models/report-config.models';
import { TEXT_FONT_SIZE_UNIT, MIN_TEXT_ZOOM, MAX_TEXT_ZOOM } from '../../../constants/report-content.constants';
import { PageEvent } from '../../core/cr-paginator/models/cr-paginator.models';
import { ReportMatchHighlightService } from '../../../services/report-match-highlight.service';
import { IScanSource, IWritingFeedback } from '../../../models/report-data.models';
import { EExcludeReason, EResponsiveLayoutType } from '../../../enums/copyleaks-web-report.enums';
import { ReportViewService } from '../../../services/report-view.service';
import { untilDestroy } from '../../../utils/until-destroy';
import { EXCLUDE_MESSAGE } from '../../../constants/report-exclude.constants';
import { IAuthorAlertCard } from '../report-alerts-container/components/author-alert-card/models/author-alert-card.models';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ReportMatchesService } from '../../../services/report-matches.service';

@Component({
	selector: 'copyleaks-content-viewer-container',
	templateUrl: './content-viewer-container.component.html',
	styleUrls: ['./content-viewer-container.component.scss'],
	animations: [
		trigger('fadeIn', [
			state('void', style({ opacity: 0 })),
			transition(':enter', [animate('0.5s ease-in', style({ opacity: 1 }))]),
		]),
	],
})
export class ContentViewerContainerComponent implements OnInit, AfterViewInit, OnChanges {
	@HostBinding('style.flex-grow')
	flexGrowProp: number;

	@HostListener('click', ['$event'])
	handleClick(event: MouseEvent): void {
		if (event.shiftKey) this.isShiftClicked = true;
		else this.isShiftClicked = false;
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
		this.iFrameMessageEvent.emit(data as PostMessageEvent);
	}

	@ViewChild('contentIFrame', { static: false }) contentIFrame: ElementRef<HTMLIFrameElement>;

	@ViewChild('contentText', { static: false }) contentText: ElementRef;

	/**
	 * @Input Determines if the view should be rendered as HTML.
	 *
	 * @description
	 * When set to `true`, the component will view the source/result conent as HTML `only` if the source/result has such content.
	 * When set to `false`, the text view will be showed.
	 *
	 * @default `false`
	 */
	@Input() isHtmlView: boolean;

	/**
	 * @Input Determines if the view is for alerts or not.
	 *
	 * @description
	 * When set to `true`, the component will view the source/result conent as TEXT and highlights the alert matches.
	 * When set to `false`, the text view will be showed.
	 *
	 * @default `false`
	 */
	@Input() isAlertsView: boolean;

	/**
	 * @Input The scan source (the original scanned document) data
	 *
	 * @description
	 * Includes data about the text & Html views.
	 */
	@Input() scanSource: IScanSource;

	/**
	 * @Input The writing feedback data
	 *
	 * @description
	 * Includes data about the text & Html views.
	 */
	@Input() writingFeedback: IWritingFeedback;

	/**
	 * @Input The scan result data
	 *
	 * @description
	 * Includes data about the text & Html views of the result.
	 */
	@Input() resultData: ResultDetailItem;

	/**
	 * @Input The rerendered content HTML which includes the scan matches
	 */
	@Input() contentHtml: string;

	/**
	 * @Input The source/result text view matches.
	 */
	@Input() contentTextMatches: SlicedMatch[][];

	/**
	 * @Input The source/result text view matches.
	 */
	@Input() contentHtmlMatches: Match[];

	/**
	 * @Input Flag indicating whether to show the content title or not.
	 */
	@Input() hideTitleContainer = false;

	/**
	 * @Input Flag indicating whether to show the content paginator or not.
	 */
	@Input() hidePoweredBy = false;

	/**
	 * @Input Flex grow property - flex-grow
	 */
	@Input() flexGrow: number;

	/**
	 * @Input The content direction of the source/result text conent.
	 */
	@Input() contentDirection: ReportContentDirectionMode = 'ltr';

	/**
	 * @Input Flag indicating whether the content has masked text or not.
	 */
	@Input() hasMaskedContent: boolean;

	/**
	 * @Input Sets the zoom level for the content of the source/result text document.
	 *
	 * @description
	 * Controls the zoom level of the text in the document.
	 * The value represents a multiplier where `1` is 100% (normal size),
	 * `2` would be 100% (zoomed in), and so on.
	 *
	 * @default `1`
	 *
	 * @constraints
	 * - Minimum value: 0.5 (50% zoom out)
	 * - Maximum value: 4 (400% zoom in)
	 */
	@Input() contentZoom: number = 1;

	/**
	 * @Input The current page index in text view document.
	 */
	@Input() currentPage: number = 1;

	/**
	 * @Input The total number of pages in the text view document.
	 */
	@Input() numberOfPages: number = 1;

	/**
	 * @Input The total number of words in the source/result document content.
	 */
	@Input() numberOfWords: number | undefined = undefined;

	/**
	 * Sets the report view mode.
	 *
	 * @description
	 * Determines how the report should be displayed in relation to the source document.
	 *
	 * - 'one-to-many': Displays the source document side-by-side with multiple result documents.
	 * - 'one-to-one': Displays the source document compared to a single result document.
	 *
	 * @default 'one-to-many'
	 *
	 * @see ViewMode
	 */
	@Input() viewMode: ViewMode = 'one-to-many';

	/**
	 * Specifies the origin of the report content.
	 *
	 * @description
	 * Defines the source context for the content displayed in the report.
	 *
	 * - 'original': The scan source in the "one-to-many" view.
	 * - 'source': The scan source in the "one-to-one" view.
	 * - 'suspect': The result view in the scan report.
	 *
	 * @default 'original'
	 *
	 * @see ReportOrigin
	 */
	@Input() reportOrigin: ReportOrigin = 'original';

	/**
	 * Specifies the responsive layout type for the report.
	 *
	 * @description
	 * This input controls the layout view of the report based on the device type.
	 *
	 * Acceptable values are from the `EResponsiveLayoutType` enum:
	 * - 'Desktop': Layout optimized for desktop view.
	 * - 'Tablet': Layout optimized for tablet view.
	 * - 'Mobile': Layout optimized for mobile view.
	 *
	 * @see EResponsiveLayoutType
	 */
	@Input() reportResponsive: EResponsiveLayoutType;

	/**
	 * @Input {boolean} Flag indicating whether to show the loading view or not.
	 */
	@Input() showLoadingView = true;

	/**
	 * @Input {boolean} Flag indicating whether the match selection is multiple or not.
	 */
	@Input() isMultiSelection = false;

	@Input() authorAlert: IAuthorAlertCard | null;

	/**
	 * Emits iFrame messages to the parent layout component.
	 *
	 * @example
	 * <app-child-component (iFrameMessageEvent)="handleIFrameMessageEvent($event)"></app-child-component>
	 *
	 * @description
	 * This output emits messages that originate from an iFrame embedded within this component.
	 * The emitted event is of type `PostMessageEvent`, which contains the message data.
	 * Parent components can subscribe to this output event to handle iFrame messages accordingly.
	 *
	 * @see PostMessageEvent
	 */
	@Output() iFrameMessageEvent = new EventEmitter<PostMessageEvent>();

	/**
	 * Emits events when there are changes to the component's view.
	 *
	 * @example
	 * <app-report-component (viewChangeEvent)="handleViewChange($event)"></app-report-component>
	 *
	 * @description
	 * This output emitter is triggered whenever there's a change in the view within this component.
	 * The emitted event is of type `IReportViewEvent`, which encapsulates the details of the view change.
	 * Parent components can subscribe to this output event to respond to view changes appropriately.
	 *
	 * @see IReportViewEvent
	 */
	@Output() viewChangeEvent = new EventEmitter<IReportViewEvent>();

	/**
	 * Event emitter for Opening the disclaimer.
	 *
	 * @event onOpenDisclaimer
	 * @type {EventEmitter<any>}
	 */
	@Output() onOpenDisclaimer: EventEmitter<any> = new EventEmitter<any>();

	isShiftClicked: boolean;
	iframeLoaded: boolean;
	showOmittedWords: boolean;
	isPartitalScan: boolean;

	EXCLUDE_MESSAGE = EXCLUDE_MESSAGE;
	VIEW_OMITTED_WORDS_TOOLTIP_MESSAGE = $localize`Show omitted words`;
	HIDE_OMITTED_WORDS_TOOLTIP_MESSAGE = $localize`Hide omitted words`;

	get pages(): number[] {
		if (this.scanSource) return this.scanSource && this.scanSource.text.pages.startPosition;
		if (this.resultData.result) return this.resultData.result?.text.pages.startPosition;

		return [];
	}

	/**
	 * `true` if the source document has an `html` section
	 */
	get hasHtml(): boolean {
		if (this.viewMode === 'writing-feedback')
			return (
				!!this.writingFeedback?.corrections?.html &&
				!!this.writingFeedback.corrections.html.chars &&
				!!this.writingFeedback.corrections.html.chars.groupIds &&
				!!this.writingFeedback.corrections.html.chars.lengths &&
				!!this.writingFeedback.corrections.html.chars.starts &&
				!!this.writingFeedback.corrections.html.chars.operationTexts &&
				!!this.writingFeedback.corrections.html.chars.types
			);
		if (this.reportOrigin === 'original' || this.reportOrigin === 'source') return !!this.scanSource?.html?.value;
		return !!this.contentHtml;
	}

	iFrameWindow: Window | null; // IFrame nativeElement reference

	MatchType = MatchType; // Match type enum
	EResponsiveLayoutType = EResponsiveLayoutType;

	customTabContent: TemplateRef<any> | null;

	ONLY_TEXT_VIEW_IS_AVAILABLE = $localize`Only text view is available`;
	MULTISELECT_IS_ON = $localize`Can't navigate between matches when multiple matches are selected`;

	private _zoomIn: boolean;

	constructor(
		private _renderer: Renderer2,
		private _cdr: ChangeDetectorRef,
		private _highlightService: ReportMatchHighlightService,
		private _matchesService: ReportMatchesService,
		private _viewSvc: ReportViewService
	) {}

	ngOnInit(): void {
		if (this.flexGrow !== undefined && this.flexGrow !== null) this.flexGrowProp = this.flexGrow;
		if (this.currentPage > this.numberOfPages) this.currentPage = 1;

		this._viewSvc.selectedCustomTabContent$.pipe(untilDestroy(this)).subscribe(content => {
			if (this.viewMode !== 'one-to-one') this.customTabContent = content;
		});

		this._matchesService.showOmittedWords$.pipe(untilDestroy(this)).subscribe(value => {
			this.showOmittedWords = value;
		});
	}

	ngAfterViewInit() {
		if (this.contentHtml) this._renderer.setAttribute(this.contentIFrame.nativeElement, 'srcdoc', this.contentHtml);

		this.contentIFrame.nativeElement.addEventListener(
			'load',
			() => {
				if (this.contentHtml) {
					this.iFrameWindow = this.contentIFrame?.nativeElement?.contentWindow;
					this.iframeLoaded = true;
					this.showLoadingView = false;
				}
			},
			false
		);

		this.contentText.nativeElement.addEventListener('wheel', this._handleScroll, { passive: false });
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['contentHtml'] && changes['contentHtml'].currentValue && this.contentIFrame?.nativeElement) {
			this._renderer.setAttribute(this.contentIFrame.nativeElement, 'srcdoc', changes['contentHtml'].currentValue);
			this._cdr.detectChanges();
			this.showLoadingView = true;
		}

		if ('currentPage' in changes || ('numberOfPages' in changes && this.currentPage && this.numberOfPages)) {
			this.currentPage = this.currentPage > this.numberOfPages || this.currentPage <= 0 ? 1 : this.currentPage;
		}

		if (
			'contentTextMatches' in changes &&
			changes['contentTextMatches'].currentValue != undefined &&
			(!this.isHtmlView || !this.hasHtml)
		)
			this.showLoadingView = false;

		if ('isAlertsView' in changes && !changes['isAlertsView'].currentValue && !changes['isAlertsView'].firstChange)
			this.iframeLoaded = false;

		if ('scanSource' in changes) {
			if (
				this.scanSource?.html?.exclude?.reasons?.filter(r => r === EExcludeReason.PartialScan).length > 0 ||
				this.scanSource?.text?.exclude?.reasons?.filter(r => r === EExcludeReason.PartialScan).length > 0
			) {
				this._matchesService.showOmittedWords$.next(true);
				this.isPartitalScan = true;
			}
		}
	}

	onViewChange() {
		if (!this.iframeLoaded) this.showLoadingView = true;
		this.viewChangeEvent.emit({
			...this._viewSvc.reportViewMode,
			isHtmlView: !this.isHtmlView,
			viewMode: this.viewMode,
			sourcePageIndex: this.currentPage,
		});
		this._highlightService.clear();
		this._highlightService.clearAllMatchs();
		this._cdr.detectChanges();
	}

	changeContentDirection(direction: ReportContentDirectionMode) {
		this.contentDirection = direction;
	}

	/**
	 * updates the font size of the suspect text.
	 * @param amount a decimal number between 0.5 and 4
	 */
	zoomOut(amount: number = TEXT_FONT_SIZE_UNIT) {
		if (this.isHtmlView && this.hasHtml) {
			this._zoomIn = false;
			this._adjustZoom();
		} else this.contentZoom = Math.max(this.contentZoom - amount, MIN_TEXT_ZOOM);
	}

	/**
	 * updates the font size of the suspect text.
	 * @param amount a decimal number between 0.5 and 4
	 */
	zoomIn(amount: number = TEXT_FONT_SIZE_UNIT) {
		if (this.isHtmlView && this.hasHtml) {
			this._zoomIn = true;
			this._adjustZoom();
		} else this.contentZoom = Math.min(this.contentZoom + amount, MAX_TEXT_ZOOM);
	}

	onPaginationEvent(event: PageEvent) {
		if (!event) return;

		this.currentPage = event.pageIndex;

		if (this.reportOrigin === 'original' || this.reportOrigin === 'source')
			this.viewChangeEvent.emit({
				...this._viewSvc.reportViewMode,
				sourcePageIndex: this.currentPage,
			});
		else
			this.viewChangeEvent.emit({
				...this._viewSvc.reportViewMode,
				suspectPageIndex: this.currentPage,
			});
	}

	/**
	 * Jump to next match click handler.
	 * @param next if `true` jump to next match, otherwise jumpt to previous match
	 */
	onJumpToNextMatchClick(next: boolean = true) {
		this._highlightService.jump(next);
	}

	openDisclaimer() {
		this.onOpenDisclaimer.emit(null);
	}

	toggleOmittedWordsView() {
		this._matchesService.showOmittedWords$.next(!this._matchesService.showOmittedWords);
	}

	private _adjustZoom() {
		this.contentIFrame.nativeElement.contentWindow.postMessage(
			{ type: 'zoom', zoomIn: this._zoomIn } as ZoomEvent,
			'*'
		);
	}

	/**
	 * Handels the Ctrl key and scroll events, by updating the content zoom view accordingly only for text view
	 * @param event The wheel event
	 */
	private _handleScroll = (event: WheelEvent): void => {
		if (event && event.ctrlKey && (!this.isHtmlView || !this.hasHtml)) {
			event.preventDefault();
			// Check if the scroll is up or down & update the zoom property accordingly
			if (event.deltaY < 0) this.zoomIn();
			else if (event.deltaY > 0) this.zoomOut();
		}
	};

	ngOnDestroy(): void {}
}
