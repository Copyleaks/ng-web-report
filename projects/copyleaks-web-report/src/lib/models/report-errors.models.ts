export interface ReportHttpRequestErrorModel {
	statusCode: number;
	message: string;
	endpoint: string;
	method: string;
	timestamp: Date;
	headers?: Record<string, string>;
	requestData?: any;
	responseData?: any;
	errorType?: string;
	additionalInfo?: any;
}
