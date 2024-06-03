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
	/** Subject for sharing the report data endpoints. */
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
	public get reportResponsiveMode() {
		return this._reportResponsiveMode$.value;
	}

	private _selectedResult$ = new BehaviorSubject<ResultDetailItem | null>(null);
	/** Emits matches that are relevant to source html one-to-many mode */
	public get selectedResult$() {
		return this._selectedResult$;
	}
	/** Getter for the report selected result. */
	public get selectedResult() {
		return this._selectedResult$.value;
	}

	private _selectedAlert$ = new BehaviorSubject<string | null>(null);
	/** Emits matches that are relevant to source html one-to-many mode */
	public get selectedAlert$() {
		return this._selectedAlert$;
	}
	/** Getter for the report selected result. */
	public get selectedAlert() {
		return this._selectedAlert$.value;
	}

	private _selectedCustomTabContent$ = new BehaviorSubject<TemplateRef<any> | null>(null);
	/** Emits matches that are relevant to source html one-to-many mode */
	public get selectedCustomTabContent$() {
		return this._selectedCustomTabContent$;
	}
	/** Getter for the report selected result. */
	public get selectedCustomTabContent() {
		return this._selectedCustomTabContent$.value;
	}

	private _selectedCustomTabResultSectionContent$ = new BehaviorSubject<TemplateRef<any> | null>(null);
	/** Emits matches that are relevant to source html one-to-many mode */
	public get selectedCustomTabResultSectionContent$() {
		return this._selectedCustomTabResultSectionContent$;
	}
	/** Getter for the report selected result. */
	public get selectedCustomTabResultSectionContent() {
		return this._selectedCustomTabResultSectionContent$.value;
	}

	private _progress$ = new BehaviorSubject<number>(0);
	public get progress$() {
		return this._progress$;
	}
	constructor() {}

	ngOnDestroy(): void {}
}
