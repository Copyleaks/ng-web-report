import {
	ECompleteResultNotificationAlertSeverity as ECompleteResultNotificationAlertSeverity,
	EExcludeReason,
	EResultPreviewType,
	EScanStatus,
	EWritingFeedbackCategories,
} from '../enums/copyleaks-web-report.enums';

//#region Crawled version related models
/**
 *
 */
export interface IScanSource {
	metadata: ISourceMetadataSection;
	text: ISourceTextSection;
	html: ISourceHtmlSection;
	version?: number;
}

/**
 * Type representing the metadata of a source document
 */
export interface ISourceMetadataSection {
	words: number;
	excluded: number;
}

/**
 * Type representing `html` data of a source document
 */
export interface ISourceHtmlSection {
	exclude: IHtmlExclude;
	value: string;
}

/**
 * Type representing `text` data of a source document
 */
export interface ISourceTextSection {
	exclude: ITextExclude;
	pages: {
		startPosition: number[];
	};
	value: string;
}

/**
 * Base type for representing an excluded part of source document's content
 */
export interface IBaseExclude {
	starts: number[];
	lengths: number[];
	reasons: EExcludeReason[];
}

/**
 * Type representing excluded `html` of a source document
 */
export interface IHtmlExclude extends IBaseExclude {
	groupIds: number[];
}

/**
 * Type representing excluded `text` of a source document
 */
export interface ITextExclude extends IBaseExclude {
	groupIds: void;
}

//#endregion

//#region Complete results related models

/** Progress endpoint response from Copyleaks api */
export interface IAPIProgress {
	percents: number;
}

/** A basic response from Copyleaks api */
export interface IBasicResponse {
	status: EScanStatus;
	error?: IScanError;
	developerPayload?: string;
}

/** An error response from Copyleaks api */
export interface IScanError {
	message?: string;
	code: number;
}

/** A scan complete response from Copyleaks api */
export interface ICompleteResults extends IBasicResponse {
	scannedDocument: IScannedDocument;
	results: IResultPreviews;
	filters?: ICompleteResultsFilters;
	notifications?: ICompleteResultNotification;
	writingFeedback?: ICompleteResultWritingFeedback;
}

/**
 * A notification of a complete response from Copyleaks api
 */
export interface ICompleteResultNotification {
	alerts: ICompleteResultNotificationAlert[];
}
/**
 * A notification alert of a complete response from Copyleaks api
 */
export interface ICompleteResultNotificationAlert {
	additionalData: string;
	code: string;
	helpLink: string;
	message: string;
	severity: ECompleteResultNotificationAlertSeverity;
	title: string;
}

/**
 * A result preview of a complete response from Copyleaks api
 */
export interface IResultPreviews {
	internet: IInternetResultPreview[];
	database: IDatabaseResultPreview[];
	batch: IBatchResultPreview[];
	repositories?: IRepositoryResultPreview[];
	score: IScore;
}

/*
 * A results filters for report view
 */
export interface ICompleteResultsFilters {
	execludedResultIds?: string[];
	filteredResultIds?: string[];
	general?: IGeneralFilters;
	sourceType?: ISourceTypeFilters;
	matchType?: IMatchTypeFilters;
	resultsMetaData?: IResultsMetaDataFilters;
	includedTags?: string[];
	writingFeedback?: IWritingFeedbackFilter;
	excludedDomains?: string[];
	isFilterEnabled?: boolean;
}

export interface IGeneralFilters {
	topResult: boolean;
	alerts: boolean;
	authorSubmissions: boolean;
}

export interface IMatchTypeFilters {
	identicalText: boolean;
	minorChanges: boolean;
	paraphrased: boolean;
}

export interface ISourceTypeFilters {
	internet: boolean;
	internalDatabase: boolean;
	batch: boolean;
	repositories: string[];
	yourResults?: boolean;
	othersResults?: boolean;
}

export interface IResultsMetaDataFilters {
	wordLimit: IWordLimitFilter;
	publicationDate: IPublicationDateFilter;
}

export interface IWordLimitFilter {
	wordLimitEnabled: boolean;
	totalWordLimit?: number;
}

export interface IPublicationDateFilter {
	publicationEnabled: boolean;
	startDate?: Date;
	resultsWithNoDates: boolean;
}

export interface IWritingFeedbackFilter {
	hiddenCategories?: EWritingFeedbackCategories[];
	excludedCorrections?: IExcludedCorrection[];
}

export interface IExcludedCorrection {
	wrongText: string;
	correctionText: string;
	type: EWritingFeedbackCategories;
	start: number;
	end: number;
	index: number;
}

/** Type representing a summary of the scanned document from Copyleaks api */
export interface IScannedDocument {
	scanId: string;
	totalWords: number;
	totalExcluded: number;
	credits: number;
	expectedCredits?: number;
	creationTime: string;
	metadata?: IResultMetaData;
	enabled?: IScanEnabledSettings;
}

export interface IScanEnabledSettings {
	aiDetection: boolean;
	plagiarismDetection: boolean;
	writingFeedback: boolean;
	pdfReport: boolean;
	cheatDetection: boolean;
}

/** Type representing a summary of the reuslts of a scanned document */
export interface IScore {
	identicalWords: number;
	minorChangedWords: number;
	relatedMeaningWords: number;
	aggregatedScore: number;
	writingFeedbackOverallIssues?: number;
	writingFeedbackOverallScore?: number;
}

/** Base type for a result preview  */
export interface IResultPreviewBase {
	isLocked?: boolean;
	id: string;
	title: string;
	introduction: string;
	type: EResultPreviewType;
	matchedWords: number;
	identicalWords?: number;
	similarWords?: number;
	paraphrasedWords?: number;
	scanId?: string | void;
	url?: string | void;
	metadata?: IResultMetaData;
	tags?: IResultTag[];
}

/** Type of tag for result preview tags */
export interface IResultTag {
	code: string;
	title: string;
	description: string;
}

/** Type for complete result meta data for scanned docuemnts and result preview */
export interface IResultMetaData {
	finalUrl?: string;
	canonicalUrl?: string;
	author?: string;
	organization?: string;
	filename?: string;
	publishDate?: string;
	creationDate?: string;
	lastModificationDate?: string;
	submissionDate?: string;
	submittedBy?: string;
	customMetadata?: ICustomMetaData[];
}
/** custom meta data */
export interface ICustomMetaData {
	key?: string;
	value?: string;
}

/** Type containing a preview of a result from the internet */
export interface IInternetResultPreview extends IResultPreviewBase {
	url: string;
	scanId: void;
}
/** Type containing a preview of a result from the copyleaks database */
export interface IDatabaseResultPreview extends IResultPreviewBase {
	url: void;
	scanId?: string;
}
/** Type containing a preview of a result from a batch scan */
export interface IBatchResultPreview extends IResultPreviewBase {
	scanId: string;
	url: void;
}
/** Type containing a preview of a result from a repository scan */
export interface IRepositoryResultPreview extends IResultPreviewBase {
	repositoryId: string;
}

/** Type containing some preview of a result from copyleaks api */
export type ResultPreview =
	| IInternetResultPreview
	| IDatabaseResultPreview
	| IBatchResultPreview
	| IRepositoryResultPreview;
//#endregion

//#region Scan result related models
/** Type representing a scan result from copyleaks api */
export interface IResultDetailResponse {
	statistics: IStatistics;
	text: IResultTextSection;
	html: IResultHtmlSection;
	version: number;
}

/** Type representing the statistics section of a scan result */
export interface IStatistics {
	identical: number;
	minorChanges: number;
	relatedMeaning: number;
}

/** Base type of a result of some content */
interface IResultBase {
	comparison: IComparisonCollection;
	value?: string;
}

/** Type representing a result of `html` content */
export interface IResultHtmlSection extends IResultBase {
	value?: string;
}
/** Type representing a result of `text` content */
export interface IResultTextSection extends IResultBase {
	value: string;
	pages: {
		startPosition: number[];
	};
}

/** Request model for deleting a specific result */
export interface IDeleteScanResultModel {
	resultId: string;
	totalWords: number;
	totalExcluded: number;
	identicalWords: number;
	minorChangedWords: number;
	relatedMeaningWords: number;
	aggregatedScore: number;
}

/** Base type of a comparison */
interface IComparisonBase {
	source: IComparisonData;
	suspected: IComparisonData;
}
/** Type representing a `text` comparison of a scan result */
export interface ITextComparison extends IComparisonBase {
	groupId: void;
}
/** Type representing an `html` comparison of a scan result */
export interface IHtmlComparison extends IComparisonBase {
	groupId: number[];
}

/** Type representing a comparison of some content */
export type Comparison = ITextComparison | IHtmlComparison;

/** Type representing a bunch of comparisons of a scan result */
export interface IComparisonCollection {
	identical: Comparison;
	minorChanges: Comparison;
	relatedMeaning: Comparison;
}

/** Type representing the data of a comparison */
export interface IComparisonData {
	chars: IComparisonRange;
	words: IComparisonRange;
}
/** Type representing the matches of a comparison of some kind */
export interface IComparisonRange {
	starts: number[];
	lengths: number[];
}
//#endregion

//#region Grammar Feedback related models
export interface IWritingFeedback {
	score: IWritingFeedbackScore;
	corrections: IWritingFeedbackScanScource;
	scannedDocument: IScannedDocument;
	scanType: string;
}

export interface IWritingFeedbackRange {
	starts: number[];
	lengths: number[];
	types: EWritingFeedbackCategories[];
	operationTexts: string[];
}

export interface IHtmlWritingFeedbackRange extends IWritingFeedbackRange {
	groupIds: number[];
}

export interface IWritingFeedbackScore {
	readability: IReadabilityScore;
	statistics: IWritingFeedbackStatistics;
	corrections: IWritingFeedbackCorrections;
}

export interface IReadabilityScore {
	score: number;
	readabilityLevel: number;
	readabilityLevelText: string;
	readabilityLevelDescription: string;
}

export interface IWritingFeedbackStatistics {
	sentenceCount: number;
	averageSentenceLength: number;
	averageWordLength: number;
	readingTimeSeconds: number;
	speakingTimeSeconds: number;
}

export interface IWritingFeedbackCorrections {
	grammarCorrectionsCount: number;
	grammarCorrectionsScore: number;
	grammarScoreWeight: number;
	mechanicsCorrectionsCount: number;
	mechanicsCorrectionsScore: number;
	mechanicsScoreWeight: number;
	sentenceStructureCorrectionsCount: number;
	sentenceStructureCorrectionsScore: number;
	sentenceStructureScoreWeight: number;
	wordChoiceCorrectionsCount: number;
	wordChoiceCorrectionsScore: number;
	wordChoiceScoreWeight: number;
	overallScore: number;
}

export interface IWritingFeedbackScanScource {
	text: IWritingFeedbackTextSection;
	html: IWritingFeedbackHtmlSection;
}

export interface IWritingFeedbackTextSection {
	chars: IWritingFeedbackRange;
}

export interface IWritingFeedbackHtmlSection {
	chars: IHtmlWritingFeedbackRange;
}

export interface ICompleteResultWritingFeedback {
	score: IWritingFeedbackCorrections;
	textStatistics: IWritingFeedbackStatistics;
	readability: IReadabilityScore;
}

export interface IWritingFeedbackCorrectionViewModel {
	wrongText: string;
	correctionText: string;
	type: EWritingFeedbackCategories;
	start: number;
	end: number;
	index: number;
}
//#region
