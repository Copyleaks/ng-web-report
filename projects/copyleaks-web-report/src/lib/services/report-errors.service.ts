import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ReportHttpRequestErrorModel } from '../models/report-errors.models';

@Injectable()
export class ReportErrorsService {
	private _reportHttpRequestError$ = new Subject<ReportHttpRequestErrorModel>();
	/**
	 * Subject for sharing the report data endpoints.
	 */
	public get reportHttpRequestError$() {
		return this._reportHttpRequestError$;
	}

	constructor() {}
}
