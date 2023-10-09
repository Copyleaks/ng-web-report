/** possible view modes of the report */
export type ViewMode = 'one-to-many' | 'one-to-one';
/** possible content modes of the report */
export type ContentMode = 'text' | 'html';
/** possible text direction modes of the report */
export type DirectionMode = 'rtl' | 'ltr';

/**
 * Defines the structure for API endpoints related to Copyleaks reports data.
 */
export interface IClsReportEndpointConfigModel {
	/**
	 * @property {string} authToken - The authorization token needed for API calls.
	 */
	authToken: string;

	/**
	 * @property {string} crawledVersion - Endpoint for fetching the crawled version of scanned content.
	 */
	crawledVersion: string;

	/**
	 * @property {string} completeResults - Endpoint for fetching complete scanning results.
	 */
	completeResults: string;

	/**
	 * @property {string} result - Endpoint for fetching individual scan results.
	 */
	result: string;

	/**
	 * @property {object} filter - Contains endpoints related to filtering options.
	 * @property {string} filter.get - Endpoint for getting the current filter settings.
	 * @property {string} filter.update - Endpoint for updating the filter settings.
	 */
	filter: {
		get: string;
		update: string;
	};
}
