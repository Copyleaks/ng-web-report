import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { IReportResponsiveMode, IReportViewEvent } from '../models/report-view.models';
import { ResultDetailItem } from '../models/report-matches.models';
import { ICompleteResultNotificationAlert } from '../models/report-data.models';

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

	private _reportResponsiveMode$ = new Subject<IReportResponsiveMode>();
	/** Subject for sharing the report reposive view mode. */
	public get reportResponsiveMode$() {
		return this._reportResponsiveMode$;
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

	private _selectedAlert$ = new BehaviorSubject<ICompleteResultNotificationAlert | null>(null);
	/** Emits matches that are relevant to source html one-to-many mode */
	public get selectedAlert$() {
		return this._selectedAlert$;
	}
	/** Getter for the report selected result. */
	public get selectedAlert() {
		return this._selectedAlert$.value;
	}

	constructor() {}
}
