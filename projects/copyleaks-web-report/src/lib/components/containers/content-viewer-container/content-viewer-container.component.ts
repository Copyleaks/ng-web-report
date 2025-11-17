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
import { PostMessageEvent, ScrollPositionEvent, ZoomEvent } from '../../../models/report-iframe-events.models';
import { EReportViewTab, IReportViewEvent, IScrollPositionState } from '../../../models/report-view.models';
import {
	Match,
	MatchType,
	ReportOrigin,
	ResultDetailItem,
	SlicedMatch,
	TextMatchHighlightEvent,
} from '../../../models/report-matches.models';
import { DirectionMode as ReportContentDirectionMode, ViewMode } from '../../../models/report-config.models';
import { TEXT_FONT_SIZE_UNIT, MIN_TEXT_ZOOM, MAX_TEXT_ZOOM } from '../../../constants/report-content.constants';
import { PageEvent } from '../../core/cr-paginator/models/cr-paginator.models';
import { ReportMatchHighlightService } from '../../../services/report-match-highlight.service';
import { IScanSource } from '../../../models/report-data.models';
import { EResponsiveLayoutType, EPlatformType } from '../../../enums/copyleaks-web-report.enums';
import { ReportViewService } from '../../../services/report-view.service';
import { untilDestroy } from '../../../utils/until-destroy';
import { EXCLUDE_MESSAGE } from '../../../constants/report-exclude.constants';
import { IAuthorAlertCard } from '../report-alerts-container/components/author-alert-card/models/author-alert-card.models';
import { animate, state, style, transition, trigger } from '@angular/animations';
import * as helpers from '../../../utils/report-match-helpers';
import { COPYLEAKS_REPORT_IFRAME_STYLES } from '../../../constants/report-iframe-styles.constants';

import oneToManyIframeJsScript from '../../../utils/one-to-many-iframe-logic';
import oneToOneIframeJsScript from '../../../utils/one-to-one-iframe-logic';
import { filter, take } from 'rxjs/operators';
import * as rangy from 'rangy';
import * as rangyclassapplier from 'rangy/lib/rangy-classapplier';

import { ALERTS } from '../../../constants/report-alerts.constants';

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
	standalone: false,
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

		if (data.type === 'iframeReady') {
			console.log('Iframe ready event received:', data);
			if (this._iframeReadyResolver) {
				clearTimeout(this._iframeReadyTimeout);
				this._iframeReadyResolver();
				this._iframeReadyResolver = null;
			}
			return;
		}

		// Handle scroll position updates from iframe
		if (data.type === 'scrollPosition') {
			if (this._ignoreScrollUpdates || this._isRestoringScroll) {
				return;
			}

			const scrollEvent = data as ScrollPositionEvent;
			this.viewSvc.setIframeScrollPosition(scrollEvent.scrollTop, scrollEvent.scrollLeft);
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
	 * @Input Determines if the view should be rendered as HTML.
	 *
	 * @description
	 * When set to `true`, the component will view the source/result conent as HTML `only` if the source/result has such content.
	 * When set to `false`, the text view will be showed.
	 *
	 * @default `false`
	 */
	@Input() isExportedComponent: boolean = false;

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
	 * @Input Determines if the view is for AI view or not.
	 *
	 * @default `false`
	 */
	@Input() isAIView: boolean;

	/**
	 * @Input Determines whether the button to switch between text and html view should be hidden or not.
	 *
	 * @description
	 * When set to `true`, the button to switch between text and html view will be hidden.
	 * When set to `false`, the button to switch between text and html view will be shown.
	 *
	 * @default `false`
	 */
	@Input() hideTextModeSwitch: boolean;

	/**
	 * @Input The scan source (the original scanned document) data
	 *
	 * @description
	 * Includes data about the text & Html views.
	 */
	@Input() scanSource: IScanSource;

	/**
	 * @Input The scan result data
	 *
	 * @description
	 * Includes data about the text & Html views of the result.
	 */
	@Input() resultData: ResultDetailItem;

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
	@Input() reportResponsive: EResponsiveLayoutType = EResponsiveLayoutType.Desktop;

	/**
	 * @Input {boolean} Flag indicating whether to show the loading view or not.
	 */
	@Input() showLoadingView = true;

	/**
	 * @Input {boolean} Flag indicating whether to show the omitted words or not.
	 */
	@Input() showOmittedWords = false;

	/**
	 * @Input {boolean} Flag indicating whether the scan is a partital scan or not.
	 */
	@Input() isPartitalScan: boolean = false;

	/**
	 * @Input {boolean} Flag indicating whether the match selection is multiple or not.
	 */
	@Input() isMultiSelection = false;

	/**
	 * @Input {string} Submitted document name.
	 */
	@Input() submittedDocumentName = null;

	@Input() authorAlert: IAuthorAlertCard | null;

	/**
	 * `true` if the source document has an `html` section
	 */
	@Input() hasHtml: boolean;

	/**
	 * @Input {string} The custom script to be injected into the iframe.
	 */
	@Input() customIframeScript: string;

	/**
	 * @Input {string} The current user email.
	 */
	@Input() currentUserEmail: string;

	/**
	 * @Input The custom view matches data.
	 */
	@Input() customViewMatchesData: {
		id: string;
		parentId: string;
		start: number;
		end: number;
		text: string;
		pageNumber: number;
		submitterEmail: string;
		isRead: boolean;
	}[][];

	/**
	 * @Input {string} The class name to be used for the custom view matches.
	 */
	@Input() customViewMatcheClassName: string = 'copyleaks-highlight';

	/**
	 * @Input {boolean} Flag indicating whether to show the add custom match icon or not.
	 */
	@Input() allowCustomViewAddBtn: boolean = false;

	/**
	 * @Input {boolean} Flag indicating whether to show the match navigation buttons or not.
	 */
	@Input() hideMatchNavigationButtons = false;

	/**
	 * @Input {boolean} Flag indicating whether to show the omitted words button or not.
	 */
	@Input() hideOmittedWordsButton = false;

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
	 * Emits events when a match is selected.
	 */
	@Output() onTextMatchSelectionEvent = new EventEmitter<TextMatchHighlightEvent | any>();

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

	/**
	 * Event emitter for Opening the disclaimer.
	 *
	 * @event onShowOmittedWords
	 * @type {EventEmitter<boolean>}
	 */
	@Output() onShowOmittedWords: EventEmitter<boolean> = new EventEmitter<boolean>();

	rerendered: boolean = false;
	textStartIndex: number | null = null;
	textEndIndex: number | null = null;

	contentTextChangesObserver: MutationObserver;
	docDirObserver: MutationObserver;

	isShiftClicked: boolean;
	iframeLoaded: boolean;

	numberOfPages: number = 1;
	numberOfWords: number | undefined = undefined;

	contentHtml: string;

	ALERTS = ALERTS;
	EXCLUDE_MESSAGE = EXCLUDE_MESSAGE;
	VIEW_OMITTED_WORDS_TOOLTIP_MESSAGE = $localize`Show omitted words`;
	HIDE_OMITTED_WORDS_TOOLTIP_MESSAGE = $localize`Hide omitted words`;
	ZOOM_IN_TOOLTIP_MESSAGE = $localize`Zoom in`;
	ZOOM_OUT_TOOLTIP_MESSAGE = $localize`Zoom out`;

	iframeStyle: string = COPYLEAKS_REPORT_IFRAME_STYLES;
	iframeJsScript: string;

	get pages(): number[] {
		if (this.scanSource) return this.scanSource && this.scanSource.text.pages.startPosition;
		if (this.resultData.result) return this.resultData.result?.text.pages.startPosition;

		return [];
	}

	iFrameWindow: Window | null; // IFrame nativeElement reference

	MatchType = MatchType; // Match type enum
	EResponsiveLayoutType = EResponsiveLayoutType;
	EPlatformType = EPlatformType;

	customTabContent: TemplateRef<any> | null;

	customMatchTobeAddedData = null;

	ONLY_TEXT_VIEW_IS_AVAILABLE = $localize`Only text view is available`;
	MULTISELECT_IS_ON = $localize`Can't navigate between matches when multiple matches are selected`;
	MULTISELECT_IS_OF_NEXT = $localize`Go to next match`;
	MULTISELECT_IS_OF_PREV = $localize`Go to previous match`;

	iconPosition = { top: 0, left: 0 };
	iconVisible = false;

	customMatchesWithEventListenersIds: string[] = [];

	docDirection: 'ltr' | 'rtl';

	private _zoomIn: boolean;

	private _ignoreScrollUpdates = false;
	private _isRestoringScroll = false;
	private _pendingScrollRestore: { scrollTop: number; scrollLeft: number } | null = null;
	private _iframeReadyTimeout: any;
	private _iframeReadyResolver: ((value: void) => void) | null = null;

	constructor(
		private _renderer: Renderer2,
		private _cdr: ChangeDetectorRef,
		private _highlightService: ReportMatchHighlightService,
		public viewSvc: ReportViewService,
		private _el: ElementRef
	) {}

	ngOnInit(): void {
		if (this.flexGrow !== undefined && this.flexGrow !== null) this.flexGrowProp = this.flexGrow;

		if (!this.isExportedComponent) {
			this.viewSvc.selectedCustomTabContent$.pipe(untilDestroy(this)).subscribe(content => {
				if (this.viewMode !== 'one-to-one') this.customTabContent = content;
			});
			this.viewSvc.documentDirection$.pipe(untilDestroy(this)).subscribe(dir => {
				this.docDirection = dir;
			});
		} else {
			this._observeDocumentDirection();
		}

		this._highlightService.textMatchClick$
			.pipe(
				filter(event => event.origin === this.reportOrigin),
				untilDestroy(this)
			)
			.subscribe(event => {
				this.onTextMatchSelectionEvent.emit(event);
			});
	}

	ngAfterViewInit() {
		if (this.contentHtml) {
			// This is important in the one-to-one view where the iframe is not rendered right away, so we need to wait for it to be rendered
			this._renderer.setAttribute(this.contentIFrame?.nativeElement, 'srcdoc', this.contentHtml);
		}

		this.contentIFrame?.nativeElement?.addEventListener(
			'load',
			() => {
				if (this.contentHtml) {
					this.iFrameWindow = this.contentIFrame?.nativeElement?.contentWindow;
					this.iframeLoaded = true;
					this.showLoadingView = false;
					console.log('iFrame loaded');
					// // Restore scroll position if we have a pending restoration
					if (this._isRestoringScroll && this._pendingScrollRestore) {
						this._waitForIframeReady().then(() => {
							console.log('Iframe is ready, restoring scroll position');
							this._restoreScrollPosition();
						});
					}
				}
			},
			false
		);

		this.contentText?.nativeElement?.addEventListener('wheel', this._handleScroll, { passive: false });
		if (this.allowCustomViewAddBtn) {
			document.addEventListener('selectionchange', () => {
				const selection = window.getSelection();
				if (selection && selection.rangeCount > 0) {
					const range = selection.getRangeAt(0);
					if (this._el.nativeElement.contains(range.commonAncestorContainer) && !document.getSelection().toString()) {
						this.hideAddCustomMatchIcon();
					} else if (
						this._el.nativeElement.contains(range.commonAncestorContainer) &&
						this.reportResponsive === EResponsiveLayoutType.Mobile
					) {
						this.showAddCustomMatchIcon(null);
					}
				} else this.hideAddCustomMatchIcon();
			});

			window.addEventListener('mouseup', event => {
				setTimeout(() => {
					this.showAddCustomMatchIcon(event);
				}, 100);
			});

			// Mutation observer to handle DOM changes
			this.contentTextChangesObserver = new MutationObserver(() => {
				// Temporarily disconnect the observer to prevent infinite loop
				this.contentTextChangesObserver?.disconnect();

				// Reconnect the observer
				this.contentTextChangesObserver.observe(this.contentText?.nativeElement, {
					childList: true,
					subtree: true,
					characterData: true,
				});
			});

			this.contentTextChangesObserver.observe(this.contentText?.nativeElement, {
				childList: true,
				subtree: true,
				characterData: true,
			});

			// Apply existing customMatches on page load
			if (this.customViewMatchesData)
				setTimeout(() => {
					this.customViewMatchesData[this.currentPage - 1].forEach(customMatch => {
						if (customMatch.parentId) return;
						this.highlightCustomMatchText(customMatch);
					});
				}, 1000);
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		// debugger;
		// Detect tab changes and save/restore scroll position
		if ('isAIView' in changes || 'viewMode' in changes || 'contentHtmlMatches' in changes) {
			const previousTab = this.viewSvc.currentViewTab;
			const newTab = this._getCurrentTab();
			console.log('Previous Tab:', previousTab, 'New Tab:', newTab);
			console.log(
				'previous custom tab id:',
				this.viewSvc.previousCustomTabId,
				'current custom tab id:',
				this.viewSvc.currentCustomTabId
			);

			let previousIsHtmlView = null;
			let previousPage = this.currentPage;

			if (previousTab !== newTab) {
				let previousIsHtmlView = null;
				let previousPage = this.currentPage;

				// Save with the PREVIOUS isHtmlView value
				if ('isHtmlView' in changes) {
					previousIsHtmlView = changes['isHtmlView'].previousValue;
				} else {
					previousIsHtmlView = this.isHtmlView;
				}
				// Check if currentPage changed along with tab change
				if ('currentPage' in changes) {
					previousPage = changes['currentPage'].previousValue;
				}
				if (this.viewSvc.previousCustomTabId !== 'ai-overview') {
					this._saveScrollPosition(previousTab, previousIsHtmlView, previousPage);
				}
				this.viewSvc.setCurrentViewTab(newTab);
				if (this.viewSvc.currentCustomTabId !== 'ai-overview') {
					console.log('Restoring scroll for tab:', newTab);
					this._prepareForReload();
					this._queueScrollRestore();
				}
			} else if (previousTab === EReportViewTab.Custom && newTab === EReportViewTab.Custom) {
				if ('isHtmlView' in changes) {
					console.log('isHtmlView changed within Custom tab');
				}
				// Save with the PREVIOUS isHtmlView value
				if ('isHtmlView' in changes) {
					previousIsHtmlView = changes['isHtmlView']?.previousValue;
					if (previousIsHtmlView === undefined || previousIsHtmlView === null) {
						previousIsHtmlView = changes['isHtmlView']?.currentValue ? false : true;
					}
				} else {
					previousIsHtmlView = this.isHtmlView;
				}
				// Check if currentPage changed along with tab change
				if ('currentPage' in changes) {
					previousPage = changes['currentPage'].previousValue;
				}
				this.viewSvc.counter$.pipe(take(1)).subscribe(counterValue => {
					if (counterValue === 0) {
						if (this.viewSvc.previousCustomTabId === 'grading-feedback') {
							this._saveScrollPosition(previousTab, previousIsHtmlView, previousPage);
						}
						this.viewSvc.setCurrentViewTab(newTab);
						if (this.viewSvc.currentCustomTabId === 'grading-feedback') {
							console.log('Restoring scroll for tab:', newTab);
							this._prepareForReload();
							this._queueScrollRestore();
						}
						if (
							this.viewSvc.previousCustomTabId == 'grading-feedback' &&
							this.viewSvc.currentCustomTabId == 'ai-overview'
						) {
							this.viewSvc.incrementCounter();
						}
					} else {
						this.viewSvc.resetCounter();
					}
				});
			}
		}

		// Detect view mode changes (HTML vs Text) - handle separately from tab changes
		if ('isHtmlView' in changes && !changes['isHtmlView']?.firstChange) {
			// Prepare for restoration with NEW isHtmlView value
			this._prepareForReload();
			this._queueScrollRestore();
		}

		// Detect page changes (when page finishes loading after restoration request)
		if ('currentPage' in changes && !changes['currentPage']?.firstChange) {
			// If we have a pending scroll restore and the page just changed, restore scroll now
			if (this._pendingScrollRestore && this._isRestoringScroll) {
				const savedPage = this._pendingScrollRestore['page'];
				if (savedPage && savedPage === this.currentPage) {
					this._restoreScrollPosition();
				}
			}
		}

		if (
			(('contentTextMatches' in changes && changes['contentTextMatches'].currentValue != undefined) ||
				('customViewMatchesData' in changes && changes['customViewMatchesData'].currentValue != undefined)) &&
			(!this.isHtmlView || !this.hasHtml)
		) {
			this.showLoadingView = false;
			if (!this.isHtmlView && this.viewSvc.reportViewMode.isHtmlView && this.reportOrigin === 'original')
				this.viewSvc.reportViewMode$.next({ ...this.viewSvc.reportViewMode, isHtmlView: false });
		}

		if ('isAlertsView' in changes && !changes['isAlertsView'].currentValue && !changes['isAlertsView'].firstChange)
			this.iframeLoaded = false;

		if (this.allowCustomViewAddBtn && 'customViewMatchesData' in changes) {
			// Apply existing customMatches on page load
			if (this.customViewMatchesData)
				setTimeout(() => {
					this.customViewMatchesData[this.currentPage - 1].forEach(customMatch => {
						if (customMatch.parentId) return;
						this.highlightCustomMatchText(customMatch);
					});
				}, 1000);
		}
		if (
			'scanSource' in changes ||
			'reportOrigin' in changes ||
			'resultData' in changes ||
			'contentHtmlMatches' in changes ||
			'isHtmlView' in changes
		) {
			this.iframeJsScript = this.reportOrigin === 'original' ? oneToManyIframeJsScript : oneToOneIframeJsScript;

			if ((this.reportOrigin === 'source' || this.reportOrigin === 'original') && !!this.scanSource) {
				this.numberOfWords = this.scanSource?.metadata?.words ?? 0;
				this.numberOfPages = this.scanSource?.text?.pages?.startPosition?.length ?? 1;
				if (
					this.allowCustomViewAddBtn &&
					(!this.customViewMatchesData || this.customViewMatchesData.length != this.numberOfPages)
				)
					this.customViewMatchesData = Array.from({ length: this.numberOfPages }, () => []);
			}

			if (this.reportOrigin === 'suspect' && !!this.resultData) {
				this.numberOfPages = this.resultData.result?.text?.pages?.startPosition?.length ?? 1;
			}

			if (!!this.contentHtmlMatches && this.isHtmlView) {
				if (
					this.contentHtmlMatches &&
					changes['contentHtmlMatches']?.previousValue != changes['contentHtmlMatches']?.currentValue
				) {
					this.showLoadingView = true;
					this.rerendered = false;
				}

				if (this.reportOrigin === 'original' || this.reportOrigin === 'source') {
					const updatedHtml = this._getRenderedMatches(this.contentHtmlMatches, this.scanSource?.html?.value);
					if (updatedHtml && this.contentHtmlMatches) {
						this.contentHtml = updatedHtml;
						this.rerendered = true;
					}
				}

				if (this.reportOrigin === 'suspect') {
					const updatedHtml = this._getRenderedMatches(this.contentHtmlMatches, this.resultData?.result?.html?.value);
					if (updatedHtml && this.contentHtmlMatches) {
						this.contentHtml = updatedHtml;
						this.rerendered = true;
					}
				}
			}
		}

		if (
			((changes['contentHtmlMatches'] && changes['contentHtmlMatches'].currentValue) || this.contentHtmlMatches) &&
			this.contentIFrame?.nativeElement &&
			this.isHtmlView &&
			!changes['isMultiSelection']
		) {
			setTimeout(() => {
				this._renderer.setAttribute(this.contentIFrame?.nativeElement, 'srcdoc', this.contentHtml);
				this._cdr.detectChanges();
				this.showLoadingView = true;
			}, 500);
		} else if (
			((changes['contentHtmlMatches'] && changes['contentHtmlMatches'].currentValue) || this.contentHtmlMatches) &&
			this.contentIFrame?.nativeElement &&
			this.isHtmlView &&
			changes['isMultiSelection'] &&
			this.isAIView
		) {
			setTimeout(() => {
				this._renderer.setAttribute(this.contentIFrame?.nativeElement, 'srcdoc', this.contentHtml);
				this._cdr.detectChanges();
				this.showLoadingView = true;
			}, 500);
		}

		if ('submittedDocumentName' in changes && this.submittedDocumentName) {
			this.submittedDocumentName = decodeURIComponent(this.submittedDocumentName);
		}
	}

	onViewChange() {
		// debugger;
		const currentIsHtmlView = this.isHtmlView;
		this._saveScrollPosition(this.viewSvc.currentViewTab, currentIsHtmlView);

		if (!this.iframeLoaded) this.showLoadingView = true;
		if (this.viewSvc.reportViewMode.alertCode === ALERTS.SUSPECTED_AI_TEXT_DETECTED) {
			this._highlightService.aiInsightsSelectedResults?.forEach(result => {
				this._highlightService.aiInsightsShowResult$.next({
					resultRange: {
						start: result.resultRange.start,
						end: result.resultRange.end,
					},
					isSelected: false,
				});
			});
			this._highlightService.aiInsightsSelectedResults$.next([]);
			this._highlightService.aiInsightsShowResult$.next(null);
			this._highlightService.clear$.next(null);
		}

		if (this.reportOrigin === 'original' || this.reportOrigin === 'source')
			this.viewChangeEvent.emit({
				...this.viewSvc.reportViewMode,
				isHtmlView: !this.isHtmlView,
				viewMode: this.viewMode,
				sourcePageIndex: this.currentPage,
			});
		else
			this.viewChangeEvent.emit({
				...this.viewSvc.reportViewMode,
				isHtmlView: !this.isHtmlView,
				viewMode: this.viewMode,
				suspectPageIndex: this.currentPage,
			});
		this._highlightService.clear();
		this._highlightService.clearAllMatchs();
		this._cdr.detectChanges();
	}

	private _waitForIframeReady(): Promise<void> {
		return new Promise(resolve => {
			// Store the resolver so we can call it when we receive the message
			this._iframeReadyResolver = resolve;

			// Set a timeout in case the message never arrives (fallback)
			this._iframeReadyTimeout = setTimeout(() => {
				console.log('Iframe ready timeout - proceeding anyway');
				this._iframeReadyResolver = null;
				resolve();
			}, 2000); // 2 second timeout
		});
	}

	changeContentDirection(direction: ReportContentDirectionMode) {
		this.contentDirection = direction;

		this._cdr.detectChanges();
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

		this._cdr.detectChanges();
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

		this._cdr.detectChanges();
	}

	onPaginationEvent(event: PageEvent) {
		if (!event) return;

		this.currentPage = event.pageIndex;

		if (this.reportOrigin === 'original' || this.reportOrigin === 'source')
			this.viewChangeEvent.emit({
				...this.viewSvc.reportViewMode,
				sourcePageIndex: this.currentPage,
			});
		else
			this.viewChangeEvent.emit({
				...this.viewSvc.reportViewMode,
				suspectPageIndex: this.currentPage,
			});

		// Apply existing customMatches on page load
		if (this.allowCustomViewAddBtn && this.customViewMatchesData)
			setTimeout(() => {
				this.customMatchesWithEventListenersIds = [];
				this.hideAddCustomMatchIcon();
				this.customViewMatchesData[this.currentPage - 1].forEach(customMatch => {
					if (customMatch.parentId) return;
					this.highlightCustomMatchText(customMatch);
				});
			});
	}

	private _getCurrentTab(): EReportViewTab {
		const selectedCustomTabId = this.viewSvc.reportViewMode$.value.selectedCustomTabId;
		if (selectedCustomTabId) return EReportViewTab.Custom;
		return this.isAIView
			? EReportViewTab.AIContent
			: this.viewMode == 'writing-feedback'
			? EReportViewTab.WritingAssistant
			: EReportViewTab.MatchedText;
	}

	/**
	 * Prepare for content reload (view change, page change, tab change)
	 */
	private _prepareForReload(): void {
		this._ignoreScrollUpdates = true;
		this._isRestoringScroll = true;
	}

	/**
	 * Queue scroll restoration - will be executed when iframe loads
	 */
	private _queueScrollRestore(): void {
		const savedState = this.viewSvc.getScrollPosition(this.viewSvc.currentViewTab, this.isHtmlView);

		if (savedState) {
			this._pendingScrollRestore = {
				scrollTop: savedState.scrollTop,
				scrollLeft: savedState.scrollLeft,
			};

			// Store the saved page for text view restoration
			if (!this.isHtmlView) {
				this._pendingScrollRestore['page'] = savedState.page;
			}

			// For wrapper scroll, restore immediately
			if (this._isWrapperScroll()) {
				setTimeout(() => {
					this._restoreScrollPosition();
				}, 0);
			}
			// For iframe view, restoration will happen when iframeLoaded becomes true
		} else {
			this._clearRestorationFlags();
		}
	}

	/**
	 * Save current scroll position to sessionStorage
	 */
	private _saveScrollPosition(tab?: EReportViewTab, isHtmlView?: boolean, page?: number): void {
		let scrollTop = 0;
		let scrollLeft = 0;
		const currentTab = tab || this.viewSvc.currentViewTab;
		const currentIsHtmlView = isHtmlView !== undefined ? isHtmlView : this.isHtmlView;
		const currentPage = page !== undefined ? page : this.currentPage;

		// Check if we should use wrapper scroll or iframe scroll
		if (this._isWrapperScroll(currentIsHtmlView)) {
			// Wrapper container scroll (writing-feedback, ai-content, or text view)
			let wrapperContainer = document
				.querySelector('.content-container')
				?.querySelector('.content-container') as HTMLElement;
			if (!wrapperContainer) {
				wrapperContainer = document.querySelector('.content-container') as HTMLElement;
			}
			if (wrapperContainer) {
				scrollTop = wrapperContainer.scrollTop;
				scrollLeft = wrapperContainer.scrollLeft;
				console.log('Saving scroll position from wrapper container', scrollTop, scrollLeft);
			}
		} else {
			// HTML/PDF iframe view - use tracked position from service
			const iframeScroll = this.viewSvc.iframeScrollPosition;
			scrollTop = iframeScroll.top;
			scrollLeft = iframeScroll.left;
			console.log('Saving scroll position from iframe', scrollTop, scrollLeft);
		}
		// Save to service using the interface
		const state: IScrollPositionState = {
			tab: currentTab,
			origin: this.reportOrigin,
			page: currentPage,
			isHtmlView: currentIsHtmlView,
			scrollTop,
			scrollLeft,
		};

		this.viewSvc.saveScrollPosition(state);
	}

	/**
	 * Restore scroll position from pending data
	 */
	private _restoreScrollPosition(): void {
		if (!this._pendingScrollRestore) {
			this._clearRestorationFlags();
			return;
		}

		const { scrollTop, scrollLeft } = this._pendingScrollRestore;

		// Check if we should use wrapper scroll or iframe scroll
		if (this._isWrapperScroll()) {
			// Text view - check if we need to change page first
			const savedPage = this._pendingScrollRestore['page'];

			if (savedPage && savedPage !== this.currentPage) {
				// Emit event to change to the saved page
				if (this.reportOrigin === 'original' || this.reportOrigin === 'source') {
					this.viewChangeEvent.emit({
						...this.viewSvc.reportViewMode,
						sourcePageIndex: savedPage,
					});
				} else {
					this.viewChangeEvent.emit({
						...this.viewSvc.reportViewMode,
						suspectPageIndex: savedPage,
					});
				}
				return;
			}

			// Wrapper container scroll (writing-feedback, ai-content, or text view)
			let wrapperContainer = document
				.querySelector('.content-container')
				?.querySelector('.content-container') as HTMLElement;

			if (!wrapperContainer) {
				wrapperContainer = document.querySelector('.content-container') as HTMLElement;
			}

			if (wrapperContainer) {
				wrapperContainer.scrollTop = scrollTop;
				wrapperContainer.scrollLeft = scrollLeft;
				console.log('Restoring scroll position in wrapper container', scrollTop, scrollLeft);
			}
			this._pendingScrollRestore = null;
			this._clearRestorationFlags();
		} else if (this.isHtmlView && this.iframeLoaded) {
			// HTML/PDF iframe view - send postMessage
			const iframe = this.contentIFrame?.nativeElement;
			if (iframe?.contentWindow) {
				console.log('Restoring scroll position in iframeeee', scrollTop, scrollLeft);
				// Update service with the position we're restoring to
				this.viewSvc.setIframeScrollPosition(scrollTop, scrollLeft);

				iframe.contentWindow.postMessage(
					{
						type: 'setScroll',
						scrollTop: scrollTop,
						scrollLeft: scrollLeft,
					},
					'*'
				);

				// Clear restoration flags (to handle any scroll events from setting position)
				setTimeout(() => {
					this._pendingScrollRestore = null;
					this._clearRestorationFlags();
				}, 100);
			} else {
				this._clearRestorationFlags();
			}
		}
	}

	/**
	 * Clear restoration flags
	 */
	private _clearRestorationFlags(): void {
		this._ignoreScrollUpdates = false;
		this._isRestoringScroll = false;
	}

	/**
	 * Check if scroll should be on wrapper container (not iframe)
	 */
	private _isWrapperScroll(isHtmlView?: boolean): boolean {
		const htmlView = isHtmlView !== undefined ? isHtmlView : this.isHtmlView;

		// If it's HTML view, scroll is in the iframe (for all tabs)
		if (htmlView && this.hasHtml) {
			return false;
		}

		// Otherwise, scroll is on the wrapper container (text view for all tabs)
		return true;
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
		this.onShowOmittedWords.emit(!this.showOmittedWords);
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

	/**
	 * Render list of matches in the iframe's HTML
	 * @param matches the matches to render
	 */
	protected _getRenderedMatches(matches: Match[] | null, originalHtml?: string) {
		if (this.rerendered == true || !matches || !originalHtml) return null;

		const html = helpers.getRenderedMatches(matches, originalHtml);
		if (!html) return null;

		const css = this._renderer.createElement('style') as HTMLStyleElement;
		css.textContent = this.iframeStyle;
		const iframeStyle = css.outerHTML;

		const js = this._renderer.createElement('script') as HTMLScriptElement;
		js.textContent = this.iframeJsScript;
		let iframeJsScript = js.outerHTML;

		if (this.customIframeScript) {
			const customScript = this._renderer.createElement('script') as HTMLScriptElement;
			customScript.textContent = this.customIframeScript;
			iframeJsScript +=
				customScript.outerHTML +
				`<script await src="https://cdnjs.cloudflare.com/ajax/libs/rangy/1.3.0/rangy-core.min.js"></script>
        <script await src="https://cdnjs.cloudflare.com/ajax/libs/rangy/1.3.0/rangy-classapplier.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script> `;
		}

		return html + iframeStyle + iframeJsScript;
	}

	addCustomMatchBtnClick(event) {
		if (!this.allowCustomViewAddBtn) return;
		event.preventDefault();
		event.stopPropagation();

		// get the current selection top offset
		const contentContainer = document.querySelector('.content-container')?.querySelector('.content-container');
		if (!contentContainer) return;
		const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();

		const scrollY = contentContainer.scrollTop;
		const top = rect.top + scrollY;
		const selectTextEvent = {
			type: 'annotation-select',
			id: this.customMatchTobeAddedData.id,
			start: this.customMatchTobeAddedData.start,
			end: this.customMatchTobeAddedData.end,
			text: this.customMatchTobeAddedData.selectedText,
			offsetTop: top + 'px',
			scrollViewOffsetTop: rect.top + 'px',
		};
		this.onTextMatchSelectionEvent.emit(selectTextEvent);
	}

	// Generate a unique ID for each customMatch
	generateCustomMatchId() {
		return 'annotation-' + Math.random().toString(36).substr(2, 9);
	}

	// Function to get the text content and compute start and end indices
	getCustomMatchData(range) {
		var preSelectionRange = range.cloneRange();
		preSelectionRange.selectNodeContents(this.contentText?.nativeElement);
		preSelectionRange.setEnd(range.startContainer, range.startOffset);
		var start = preSelectionRange.toString().length;

		var selectedText = range.toString();
		if (!selectedText) return;
		var end = start + selectedText.length;

		return {
			id: this.generateCustomMatchId(),
			start: start,
			end: end,
			text: selectedText,
			pageNumber: this.currentPage,
			submitterEmail: this.currentUserEmail,
		};
	}

	// Function to create and display customMatch
	createCustomMatch() {
		if (this.customMatchTobeAddedData) {
			this.customViewMatchesData[this.currentPage - 1].push(this.customMatchTobeAddedData);
			// Display customMatch

			// Highlight the selected text
			this.highlightCustomMatchText(this.customMatchTobeAddedData);
			window.getSelection()?.removeAllRanges();
		}
	}

	// Function to highlight or remove highlight of the selected text
	highlightCustomMatchText(customMatch, remove = false) {
		if (!this.allowCustomViewAddBtn) return;
		var range = rangy.createRange();
		var container = this.contentText?.nativeElement;
		var startContainer, endContainer;
		var startOffset = customMatch.start;
		var endOffset = customMatch.end;
		var offset = 0;

		function findNodeAndOffset(node, targetOffset) {
			if (node.nodeType === Node.TEXT_NODE) {
				if (offset + node.length >= targetOffset) {
					return { node: node, offset: targetOffset - offset };
				}
				offset += node.length;
			} else if (node.nodeType === Node.ELEMENT_NODE) {
				for (var i = 0; i < node.childNodes.length; i++) {
					var result = findNodeAndOffset(node.childNodes[i], targetOffset);
					if (result) {
						return result;
					}
				}
			}
			return null;
		}

		var startNodeInfo = findNodeAndOffset(container, startOffset);
		startContainer = startNodeInfo.node;
		startOffset = startNodeInfo.offset;

		offset = 0; // Reset offset for end node search
		var endNodeInfo = findNodeAndOffset(container, endOffset);
		endContainer = endNodeInfo.node;
		endOffset = endNodeInfo.offset;

		// Set the range
		if (startContainer && endContainer) {
			range.setStart(startContainer, startOffset);
			range.setEnd(endContainer, endOffset);

			// Apply or remove highlight

			var highlight = rangyclassapplier.createClassApplier(this.customViewMatcheClassName, {
				elementTagName: 'span',
				elementProperties: {
					className: this.customViewMatcheClassName,
				},
				normalize: true, // This ensures that overlapping highlights are merged
			});
			if (remove) {
				highlight.undoToRange(range);
			} else {
				highlight.applyToRange(range);
				setTimeout(() => {
					this.attachHighlightClickEvent(customMatch.id);
				});
			}

			// Ensure the data-id attribute is set after applying the highlight
			document.querySelectorAll('.' + this.customViewMatcheClassName).forEach(element => {
				if (!element.getAttribute('data-id')) {
					element.setAttribute('data-id', customMatch.id);
				}
			});
		}
	}

	// Function to attach click event to highlight
	attachHighlightClickEvent(customMatchId) {
		if (this.customMatchesWithEventListenersIds.includes(customMatchId)) return;
		const elements = document.querySelectorAll(
			'.' + this.customViewMatcheClassName + '[data-id="' + customMatchId + '"]'
		);
		elements.forEach(element => {
			element.addEventListener('click', event => {
				event.stopPropagation(); // Prevent event bubbling
				const flattenedArray = this.customViewMatchesData.reduce((acc, curr) => acc.concat(curr), []);
				const selectedCustomMatch = flattenedArray.find(customMatch => customMatch.id === customMatchId);
				if (!selectedCustomMatch) return;

				// check if element has attribute 'on'
				const isOn = element.classList.contains('selected');
				if (isOn) {
					const customMatchEvent = {
						type: 'annotation-click',
						id: null,
						start: null,
						end: null,
						text: null,
						offsetTop: null,
					};
					element.classList.remove('selected');
					this.onTextMatchSelectionEvent.emit(customMatchEvent);
					return;
				}

				// add attribute 'on' to the element
				element.classList.add('selected');

				const contentContainer = document.querySelector('.content-container')?.querySelector('.content-container');
				if (!contentContainer) return;

				const rect = element.getBoundingClientRect();
				let scrollY = contentContainer.scrollTop;

				const top = rect.top + scrollY;

				const customMatchEvent = {
					type: 'annotation-click',
					id: selectedCustomMatch.id,
					start: selectedCustomMatch.start,
					end: selectedCustomMatch.end,
					text: selectedCustomMatch.text,
					offsetTop: top + 'px',
					scrollViewOffsetTop: rect.top + 'px',
				};
				this.onTextMatchSelectionEvent.emit(customMatchEvent);
				selectedCustomMatch.isRead = true;
			});
			this.customMatchesWithEventListenersIds.push(customMatchId);
		});
	}

	showAddCustomMatchIcon(event: MouseEvent): void {
		if (!this.allowCustomViewAddBtn) return;
		const selection = window.getSelection();

		const container = this.contentText.nativeElement;
		const containerRange = container.ownerDocument.createRange();
		containerRange.selectNodeContents(container);

		if (selection && selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);

			// Restrict the selection to the container
			if (
				range.compareBoundaryPoints(Range.START_TO_START, containerRange) < 0 ||
				range.compareBoundaryPoints(Range.END_TO_END, containerRange) > 0
			) {
				const newRange = container.ownerDocument.createRange();

				// Adjust the start of the range if it is outside the container
				if (range.compareBoundaryPoints(Range.START_TO_START, containerRange) < 0) {
					newRange.setStart(containerRange.startContainer, containerRange.startOffset);
				} else {
					newRange.setStart(range.startContainer, range.startOffset);
				}

				// Adjust the end of the range if it is outside the container
				if (range.compareBoundaryPoints(Range.END_TO_END, containerRange) > 0) {
					newRange.setEnd(containerRange.endContainer, containerRange.endOffset);
				} else {
					newRange.setEnd(range.endContainer, range.endOffset);
				}

				// check if the new range is empty
				if (newRange.toString().trim() === '') {
					this.hideAddCustomMatchIcon(false);
					return;
				}

				selection.removeAllRanges();
				selection.addRange(newRange);
			}

			// Remove the specified element (e.g., highlight-icon which is the icon that ) from the selection
			const highlightIcon = document.getElementById('highlight-icon');
			if (highlightIcon) {
				const highlightRange = document.createRange();
				highlightRange.selectNodeContents(highlightIcon);

				if (range.intersectsNode(highlightIcon)) {
					// If the selection includes the highlight-icon, split the range
					if (range.compareBoundaryPoints(Range.START_TO_START, highlightRange) < 0) {
						range.setEndBefore(highlightIcon);
					} else if (range.compareBoundaryPoints(Range.END_TO_END, highlightRange) > 0) {
						range.setStartAfter(highlightIcon);
					}

					// Apply the adjusted range back to the selection
					selection.removeAllRanges();
					selection.addRange(range);
				}
			}
		}
		if (selection && selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);
			if (!range.collapsed) {
				if (!document.getSelection().toString()) {
					this.hideAddCustomMatchIcon(false);
					return;
				}

				// const rect = range.getBoundingClientRect();
				this.iconPosition.top = event.y - this.contentText.nativeElement.getBoundingClientRect().top;
				this.iconPosition.left = event.x - this.contentText.nativeElement.getBoundingClientRect().left;
				this.iconVisible = true;

				const contentTextRect = this.contentText?.nativeElement.getBoundingClientRect();

				// Adjust left position if overflowing on the right
				if (this.iconPosition.left + 40 > contentTextRect.width) {
					this.iconPosition.left = contentTextRect.width - 40;
				}

				if (this.iconPosition.left < 0) {
					this.iconPosition.left = 0;
				}

				if (this.iconPosition.top < 0) {
					this.iconPosition.top = 0;
				}

				this._saveRangySelectionData();
			} else {
				this.hideAddCustomMatchIcon();
			}
		} else {
			this.hideAddCustomMatchIcon();
		}
	}

	hideAddCustomMatchIcon(emitEvent = true): void {
		if (!this.allowCustomViewAddBtn) return;
		this.iconVisible = false;
		const selectTextEvent = {
			type: 'annotation-select',
			id: null,
			start: null,
			end: null,
			text: null,
			offsetTop: null,
			scrollViewOffsetTop: null,
		};
		if (emitEvent) this.onTextMatchSelectionEvent.emit(selectTextEvent);
	}

	private _saveRangySelectionData() {
		var rangySelection = rangy.getSelection();
		if (rangySelection.rangeCount > 0) {
			var range = rangySelection.getRangeAt(0);
			this.customMatchTobeAddedData = this.getCustomMatchData(range);
		}
	}

	/**
	 * Observe the document direction changes.
	 */
	private _observeDocumentDirection(): void {
		this.docDirObserver = new MutationObserver(() => {
			this.docDirection = this._getDocumentDirection();
		});

		this.docDirObserver.observe(document.documentElement, {
			attributeFilter: ['dir'],
		});
	}

	/**
	 * Get the document direction (ltr/rtl).
	 * @returns The document direction (ltr/rtl).
	 */
	private _getDocumentDirection(): 'ltr' | 'rtl' {
		return document?.documentElement?.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
	}

	ngOnDestroy(): void {
		this.docDirObserver?.disconnect();
		this.contentTextChangesObserver?.disconnect();
	}
}
