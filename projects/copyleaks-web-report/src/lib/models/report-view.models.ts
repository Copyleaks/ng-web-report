import { EPlatformType, EResponsiveLayoutType } from '../enums/copyleaks-web-report.enums';
import { ViewMode } from './report-config.models';

export interface IReportViewEvent {
	isHtmlView: boolean;
	viewMode: ViewMode;
	sourcePageIndex: number;
	suspectPageIndex?: number;
	suspectId?: string;
	alertCode?: string;
	showDisabledProducts?: boolean;
	platformType?: EPlatformType;
	selectedCustomTabId?: string;
	selectedResultsCategory?: string;
	navigateBackToAIView?: boolean;
	showAIPhrases?: boolean;
}

export interface IReportViewQueryParams {
	viewMode: string;
	contentMode: string;
	sourcePage: string;
	suspectPage?: string;
	suspectId?: string;
	alertCode?: string;
	selectedCustomTabId?: string;
	selectedResultsCategory?: string;
	showAIPhrases?: string;
}

export interface IReportResponsiveMode {
	mode: EResponsiveLayoutType;
}

/**
 * Represents the tooltip model for report scores.
 */
export interface IReportScoreTooltipModel {
	/** Plagiarism score for identical text. */
	identicalPct?: IPercentageModel;

	/** Plagiarism score for text with minor changes. */
	minorChangesPct?: IPercentageModel;

	/** Plagiarism score for paraphrased text. */
	paraphrasedPct?: IPercentageModel;

	/** Plagiarism score for omitted text. */
	omittedPct?: IPercentageModel;

	/** AI-assessed plagiarism score. */
	aiPct?: IPercentageModel;

	/** Human-assessed plagiarism score. */
	humanPct?: IPercentageModel;

	/** Total scan words */
	totalWords?: number;

	isResult?: boolean;
}

/**
 * Represents a model for percentage values with an enabled/disabled state.
 */
export interface IPercentageModel {
	/** The percentage value. */
	percentage?: number;

	/** The percentage value. */
	totalWords?: number;

	/** Indicates whether this percentage is enabled or disabled. */
	disabled: boolean;
}
