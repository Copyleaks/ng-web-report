/**
 * Type for the allowed view modes.
 *
 * @type
 * - 'one-to-many': Source is displayed alongside multiple results.
 * - 'one-to-one': Source is displayed alongside a single result.
 */
export type ViewMode = 'one-to-many' | 'one-to-one' | 'only-ai';
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
	 * @property {string} progress - Endpoint for check the scan progress.
	 */
	progress?: string;
}
