import { Injectable } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { ReportHttpRequestErrorModel } from '../models/report-errors.models';
import { HttpErrorResponse } from '@angular/common/http';

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

	public handleHttpError(error: HttpErrorResponse, methodName: string) {
		if (!error) throwError(error);

		const httpError: ReportHttpRequestErrorModel = {
			statusCode: error.status,
			message: error.message,
			endpoint: error.url || '',
			method: methodName,
			timestamp: new Date(),
			headers: error.headers,
			responseData: error.error,
		};

		// Send the error model, so that we can emit it to outside components
		this.reportHttpRequestError$.next(httpError);
	}
}
