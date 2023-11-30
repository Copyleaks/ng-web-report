import { HttpHeaders } from '@angular/common/http';

export interface ReportHttpRequestErrorModel {
	statusCode: number;
	message: string;
	endpoint: string;
	method: string;
	timestamp: Date;
	headers?: HttpHeaders;
	requestData?: any;
	responseData?: any;
	errorType?: string;
	additionalInfo?: any;
}
