import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IReportViewEvent } from '../models/report-view.models';

@Injectable()
export class ReportViewService {
	private _reportViewMode$ = new BehaviorSubject<IReportViewEvent>({
		isHtmlView: true,
		viewMode: 'one-to-many',
	});
	/**
	 * Subject for sharing the report data endpoints.
	 */
	public get reportViewMode$() {
		return this._reportViewMode$;
	}
	/**
	 * Getter for the report data endpoints.
	 */
	public get reportViewMode() {
		return this._reportViewMode$.value;
	}

	constructor() {}
}
