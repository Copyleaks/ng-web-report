import { EWritingFeedbackCategories } from '../enums/copyleaks-web-report.enums';
import { ResultPreview } from './report-data.models';

/**
 * Type that holds the options for a report
 */
export interface ICopyleaksReportOptions {
	/** Display identical highlights */
	showIdentical?: boolean;
	/** Display minor changes highlights */
	showMinorChanges?: boolean;
	/** Display related meaning highlights */
	showRelated?: boolean;
	/** Set the current options as default using local storage */
	setAsDefault?: boolean;
	/** */
	showInternetResults?: boolean;
	/** */
	showInternalDatabaseResults?: boolean;
	/** */
	showBatchResults?: boolean;
	/** */
	hiddenRepositories?: string[];
	/** */
	wordLimit?: number;
	/** */
	publicationDate?: Date;
	/** */
	showTop100Results?: boolean;
	/** */
	showAlerts?: boolean;
	/** */
	showSameAuthorSubmissions?: boolean;
	/** */
	includeResultsWithoutDate?: boolean;
	/** */
	includedTags?: string[];
	/** */
	writingFeedback?: ICopyleaksReportWritingFeedbackOptions;
	/** */
	excludedDomains?: string[];
}

export interface ICopyleaksReportWritingFeedbackOptions {
	hiddenCategories?: EWritingFeedbackCategories[];
}

export interface CopyleaksResultCardAction {
	name: string;
	action: (result: ResultPreview) => void;
}
