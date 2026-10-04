/**
 * Type for the allowed view modes.
 *
 * @type
 * - 'one-to-many': Source is displayed alongside multiple results.
 * - 'one-to-one': Source is displayed alongside a single result.
 */
export type ViewMode = 'one-to-many' | 'one-to-one' | 'only-ai' | 'writing-feedback';
/** possible content modes of the report */
export type ContentMode = 'text' | 'html';
/** possible text direction modes of the report */
export type DirectionMode = 'rtl' | 'ltr';

/**
 * Defines the structure for the nested object containing the URL and headers.
 */
export interface IEndpointDetails {
	/**
	 * @property {string} url - The URL for the API endpoint.
	 */
	url: string;

	/**
	 * @property {Object} headers - The headers dictionary for API calls.
	 */
	headers: { [key: string]: string }; // A dictionary with string keys and string values
}

/**
 * Defines the structure for API endpoints related to Copyleaks reports data.
 */
export interface IClsReportEndpointConfigModel {
	/**
	 * @property {IEndpointDetails} crawledVersion - Object containing endpoint details for fetching the crawled version of scanned content.
	 */
	crawledVersion: IEndpointDetails;

	/**
	 * @property {IEndpointDetails} completeResults - Object containing endpoint details for fetching complete scanning results.
	 */
	completeResults: IEndpointDetails;

	/**
	 * @property {IEndpointDetails} result - Object containing endpoint details for fetching individual scan results.
	 */
	result: IEndpointDetails;

	/**
	 * @property {IEndpointDetails} resultsChunk - Object containing endpoint details for fetching a chunk of scan results
	 * at once. The url must contain a `{CHUNK_INDEX}` placeholder (mirroring `{RESULT_ID}` of `result`).
	 * Optional: when it is not configured - or when the complete results response carries no `resultsExport` section -
	 * the report keeps fetching the results one by one through `result`.
	 */
	resultsChunk?: IEndpointDetails;

	/**
	 * @property {IEndpointDetails} writingFeedback - Object containing endpoint details for fetching writing feedback details.
	 */
	writingFeedback?: IEndpointDetails;

	/**
	 * @property {IEndpointDetails} progress - Object containing endpoint details for fetching scan progress.
	 */
	progress?: IEndpointDetails;

	/**
	 * @property {IEndpointDetails} progress - Object containing endpoint details for deleting individual scan result.
	 */
	deleteResult?: IEndpointDetails;
}
