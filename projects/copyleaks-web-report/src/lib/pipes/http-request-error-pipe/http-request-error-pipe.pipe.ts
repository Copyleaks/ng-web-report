import {
	HttpEvent,
	HttpInterceptor,
	HttpHandler,
	HttpRequest,
	HttpErrorResponse,
	HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ReportErrorsService } from '../../services/report-errors.service';
import { ReportHttpRequestErrorModel } from '../../models/report-errors.models';

@Injectable()
export class HttpRequestErrorInterceptor implements HttpInterceptor {
	constructor(private errorService: ReportErrorsService) {}

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(request).pipe(
			catchError((error: HttpErrorResponse) => {
				if (!error || !request) throwError(error);

				// Init the error model
				const httpError: ReportHttpRequestErrorModel = {
					statusCode: error.status,
					message: error.message,
					endpoint: request.url || '',
					method: request.method,
					timestamp: new Date(),
					headers: request.headers.keys().reduce((acc, key) => ({ ...acc, [key]: request.headers.get(key) }), {}),
					requestData: request.body,
					responseData: error.error,
				};

				// Send the error model, so that we can emit it to outside components
				this.errorService.reportHttpRequestError$.next(httpError);

				// Rethrow the error so the other service can handle the error appropriately
				return throwError(error);
			})
		);
	}
}

export const HttpRequestErrorInterceptorProvider = {
	provide: HTTP_INTERCEPTORS,
	useClass: HttpRequestErrorInterceptor,
	multi: true,
};
