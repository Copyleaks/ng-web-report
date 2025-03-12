import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ResultDetailItem } from '../models/report-matches.models';
import { IReportResponsiveMode, IReportViewEvent } from '../models/report-view.models';

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
	private observer: MutationObserver;

	constructor() {
		this._observeDocumentDirection();
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
	 * Get the document direction (ltr/rtl).
	 * @returns The document direction (ltr/rtl).
	 */
	private _getDocumentDirection(): 'ltr' | 'rtl' {
		return document?.documentElement?.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
	}

	ngOnDestroy(): void {
		this.observer.disconnect();
	}
}
