import { IResultItem } from '../components/containers/report-results-item-container/components/models/report-result-item.models';
import {
	EResultPreviewType,
	EWritingFeedbackCategories,
	EWritingFeedbackTypes,
} from '../enums/copyleaks-web-report.enums';

/**
 * Type that holds the statistic for a scan process
 */
export interface ReportStatistics {
	/** Total percentage of similar content compared to original submission. */
	aggregatedScore?: number;
	/** Number of identical words matched in this scan */
	identical: number;
	/** Number of minor changed words matched in this scan */
	minorChanges: number;
	/** Number of related meaning words matched in this scan */
	relatedMeaning: number;
	/** Number of omitted words matched in this scan */
	omittedWords: number;
	/** Number of words in this scan */
	total?: number;
	/** AI probability */
	aiScore: number;
	/** Human probability */
	humanScore: number;
	/** Writing Feedback score */
	writingFeedbackOverallScore?: number;
	/** Writing Feedback total issues */
	writingFeedbackOverallIssues?: number;
}

export interface IWritingFeedbackTypeStatistics {
	type: EWritingFeedbackTypes;
	categories: IWritingFeedbackCategoryStatistics[];
}

export interface IWritingFeedbackCategoryStatistics {
	type: EWritingFeedbackCategories;
	totalIssues: number;
}

export interface IMatchesTypeStatistics {
	type: EResultPreviewType;
	totalResults: number;
	totalResultsPct: number;
	categories: IMatchesCategoryStatistics[];
}

export interface IMatchesCategoryStatistics {
	type: string;
	totalResults: number;
	results: IResultItem[];
}
