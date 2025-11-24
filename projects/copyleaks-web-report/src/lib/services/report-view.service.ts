import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ResultDetailItem } from '../models/report-matches.models';
import {
	EReportViewTab,
	IReportResponsiveMode,
	IReportViewEvent,
	IScrollPositionState,
	IScrollPositionStateMap,
} from '../models/report-view.models';
import { distinctUntilChanged, map } from 'rxjs/operators';

@Injectable()
export class ReportViewService {
	private _reportViewMode$ = new BehaviorSubject<IReportViewEvent>({
		isHtmlView: true,
		viewMode: 'one-to-one',
		sourcePageIndex: 1,
	});
	/** Subject for the report view mode. */
	public get reportViewMode$() {
		return this._reportViewMode$;
	}
	/** Getter for the report data endpoints. */
	public get reportViewMode() {
		return this._reportViewMode$.value;
	}

	private _reportResponsiveMode$ = new BehaviorSubject<IReportResponsiveMode | null>(null);
	/** Subject for sharing the report reposive view mode. */
	public get reportResponsiveMode$() {
		return this._reportResponsiveMode$;
	}
	/** Getter for the report reposive view mode. */
	public get reportResponsiveMode() {
		return this._reportResponsiveMode$.value;
	}

	private _selectedResult$ = new BehaviorSubject<ResultDetailItem | null>(null);
	/** Subject for the report selected matching result. */
	public get selectedResult$() {
		return this._selectedResult$;
	}
	/** Getter for the report selected matching result. */
	public get selectedResult() {
		return this._selectedResult$.value;
	}

	private _selectedAlert$ = new BehaviorSubject<string | null>(null);
	/** Subject for the report selected alert. */
	public get selectedAlert$() {
		return this._selectedAlert$;
	}
	/** Getter for the report selected alert. */
	public get selectedAlert() {
		return this._selectedAlert$.value;
	}

	private _selectedCustomTabContent$ = new BehaviorSubject<TemplateRef<any> | null>(null);
	/** Subject for the report selected custom tab content (the content viewer section). */
	public get selectedCustomTabContent$() {
		return this._selectedCustomTabContent$;
	}
	/** Getter for the report selected custom tab content (the content viewer section).*/
	public get selectedCustomTabContent() {
		return this._selectedCustomTabContent$.value;
	}

	private _selectedCustomTabResultSectionContent$ = new BehaviorSubject<TemplateRef<any> | null>(null);
	/** Subject for the report selected custom tab results section. */
	public get selectedCustomTabResultSectionContent$() {
		return this._selectedCustomTabResultSectionContent$;
	}
	/** Getter for the report selected custom tab results section. */
	public get selectedCustomTabResultSectionContent() {
		return this._selectedCustomTabResultSectionContent$.value;
	}

	private _progress$ = new BehaviorSubject<number>(0);
	/** Subject for the report current scanning progress (0-100%)*/
	public get progress$() {
		return this._progress$;
	}

	private _documentDirection$ = new BehaviorSubject<'ltr' | 'rtl'>(this._getDocumentDirection());
	/** Subject for the report document direction (ltr/rtl). */
	public get documentDirection$() {
		return this._documentDirection$;
	}
	/** Getter for the report document direction (ltr/rtl). */
	public get documentDirection() {
		return this._documentDirection$.value;
	}
	private _scrollPositionStates$ = new BehaviorSubject<IScrollPositionStateMap>({});
	/** Subject for maintaining scroll position states across different views. */
	public get scrollPositionStates$() {
		return this._scrollPositionStates$;
	}
	/** Getter for scroll position states. */
	public get scrollPositionStates() {
		return this._scrollPositionStates$.value;
	}

	private _currentViewTab$ = new BehaviorSubject<EReportViewTab>(EReportViewTab.MatchedText);

	private _previousCustomTabId: string | undefined = undefined;
	private _currentCustomTabId: string | undefined = undefined;

	private _iframeScrollPosition$ = new BehaviorSubject<{ top: number; left: number }>({ top: 0, left: 0 });

	private _previousIsHtmlView: boolean = false;
	private _currentIsHtmlView: boolean = false;

	private observer: MutationObserver;

	constructor() {
		this._observeDocumentDirection();
		// Track custom tab ID changes
		this._reportViewMode$
			.pipe(
				map(mode => mode.selectedCustomTabId),
				distinctUntilChanged()
			)
			.subscribe(newCustomTabId => {
				if (this._currentCustomTabId !== newCustomTabId) {
					this._previousCustomTabId = this._currentCustomTabId;
					this._currentCustomTabId = newCustomTabId;
				}
			});

		this._reportViewMode$
			.pipe(
				map(mode => mode.isHtmlView),
				distinctUntilChanged()
			)
			.subscribe(newIsHtmlView => {
				if (this._currentIsHtmlView !== newIsHtmlView) {
					this._previousIsHtmlView = this._currentIsHtmlView;
					this._currentIsHtmlView = newIsHtmlView;
				}
			});
	}

	public get currentCustomTabId(): string | undefined {
		return this._currentCustomTabId;
	}

	public get previousCustomTabId(): string | undefined {
		return this._previousCustomTabId;
	}

	/**
	 * Get the previous isHtmlView state (before the last change)
	 */
	public get previousIsHtmlView(): boolean {
		return this._previousIsHtmlView;
	}

	/**
	 * Get the current isHtmlView state
	 */
	public get currentIsHtmlView(): boolean {
		return this._currentIsHtmlView;
	}

	/**
	 * Save scroll position for a specific tab.
	 * @param state The scroll position state to save
	 */
	public saveScrollPosition(state: IScrollPositionState): void {
		const key = this._getScrollStateKey(state.tab, state.isHtmlView, state.customTabId);
		const currentStates = { ...this.scrollPositionStates };
		currentStates[key] = state;
		this._scrollPositionStates$.next(currentStates);
	}

	/**
	 * Get scroll position for a specific tab.
	 * @param tab The tab type
	 * @param isHtmlView Whether HTML view is active
	 * @param customTabId The custom tab ID (for Custom tab type only)
	 * @returns The saved scroll position state, or null if not found
	 */
	public getScrollPosition(
		tab: EReportViewTab,
		isHtmlView: boolean,
		customTabId?: string
	): IScrollPositionState | null {
		const key = this._getScrollStateKey(tab, isHtmlView, customTabId);
		return this.scrollPositionStates[key] || null;
	}

	/**
	 * Clear all saved scroll positions.
	 */
	public clearScrollPositions(): void {
		this._scrollPositionStates$.next({});
	}

	/**
	 * Generate a unique key for scroll position state.
	 * @private
	 */
	private _getScrollStateKey(tab: EReportViewTab, isHtmlView: boolean, customTabId?: string): string {
		if (tab === EReportViewTab.Custom && customTabId) {
			return `${tab}_${isHtmlView}_${customTabId}`;
		}
		return `${tab}_${isHtmlView}`;
	}

	/**
	 * Observe the document direction changes.
	 */
	private _observeDocumentDirection(): void {
		this.observer = new MutationObserver(() => {
			this.documentDirection$.next(this._getDocumentDirection());
		});

		this.observer.observe(document.documentElement, {
			attributeFilter: ['dir'],
		});
	}

	/**
	 * Observable for the current active tab
	 */
	public get currentViewTab$() {
		return this._currentViewTab$.asObservable();
	}

	/**
	 * Get the current active tab
	 */
	public get currentViewTab() {
		return this._currentViewTab$.value;
	}

	/**
	 * Set the current active tab
	 */
	public setCurrentViewTab(tab: EReportViewTab) {
		this._currentViewTab$.next(tab);
	}

	/**
	 * Observable for iframe scroll position
	 */
	public get iframeScrollPosition$() {
		return this._iframeScrollPosition$.asObservable();
	}

	/**
	 * Get the current iframe scroll position
	 */
	public get iframeScrollPosition() {
		return this._iframeScrollPosition$.value;
	}

	/**
	 * Update the iframe scroll position
	 */
	public setIframeScrollPosition(top: number, left: number) {
		this._iframeScrollPosition$.next({ top, left });
	}

	/**
	 * Clear the iframe scroll position
	 */
	public clearIframeScrollPosition() {
		this._iframeScrollPosition$.next({ top: 0, left: 0 });
	}
	/**
	 * Get the document direction (ltr/rtl).
	 * @returns The document direction (ltr/rtl).
	 */
	private _getDocumentDirection(): 'ltr' | 'rtl' {
		return document?.documentElement?.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
	}

	ngOnDestroy(): void {
		this.observer?.disconnect();
	}
}
