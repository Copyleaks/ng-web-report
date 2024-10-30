import { CrTextMatchComponent } from '../components/core/cr-text-match/cr-text-match.component';
import { EMatchClassification, EWritingFeedbackCategories } from '../enums/copyleaks-web-report.enums';

import { EExcludeReason } from '../enums/copyleaks-web-report.enums';
import { IResultDetailResponse } from './report-data.models';

/**
 * Represents a `ScanResult` and its `id`
 */
export interface ResultDetailItem {
	id: string;
	result?: IResultDetailResponse;
}

/** Simple range type */
export interface Range {
	/** The start of the range */
	start: number;
	/** The end of the range */
	end: number;
}

/**
 * Represents a suspected part of a scanned document content either **text** or **html**
 * @extends Range
 */
export interface Match extends Range {
	/** The suspicion type associated with this suspected match */
	type: MatchType;
	/** The scan ids that are associated with this suspected match */
	ids?: string[];
	/** associated group id - relevant to **html** content */
	gid?: number;
	/** associated exclude reason - relevant to **excluded** match type */
	reason?: EExcludeReason;
	/** associated writing feedback type - relevant to **WritingFeedback** match type */
	writingFeedbackType?: EWritingFeedbackCategories;
	/** The original text that was scanned */
	wrongText?: string;
	/** The corrected text */
	correctionText?: string;
	/** The proportion type of explain ai */
	proportionType?: EProportionType;
}

/**
 * Enum of possible kinds of suspicion a match could have
 */
export enum MatchType {
	excluded = -1,
	identical = 0,
	minorChanges = 1,
	relatedMeaning = 2,
	writingFeedback = 3,
	aiText = 4,
	aiExplain = 6,
	none = 5,

	// custom
	suspectedCharacterReplacement = 100,
}

/**
 * Enum of possible kinds of an endpoint could have
 */
export enum EndpointKind {
	start,
	end,
}

/**
 * Represents a the actual string `content` that a `match` is representing
 */
export interface SlicedMatch {
	content: string;
	match: Match;
}

/**
 * Represents a numeric endpoint with an `index` and a `kind`.
 */
export interface Endpoint {
	index: number;
	kind: EndpointKind;
}
/**
 * Represents an endpoint in a `ScannedDocument` content, either **text** or **html**.
 */
export interface MatchEndpoint extends Endpoint {
	type: MatchType;
	ids?: string[];
	gid?: number;
	reason?: EExcludeReason;
}
/** possible key options for results origin */
export type SubjectResultKey = 'source' | 'suspected';
/** possible key options for results match type */
export type ComparisonKey = 'identical' | 'minorChanges' | 'relatedMeaning';
/** possible key options for results content */
export type ContentKey = 'text' | 'html';
/** possible key options for results ranges */
export type MatchUnit = 'chars' | 'words';

export interface AIExplainResult {
	start: number[];
	end: number[];
	length: number[];
}

export interface AIExplainResultItem {
	content: string;
	proportionType: EProportionType;
	aiCount: number;
	humanCount: number;
	proportion: number;
	isInfinity?: boolean;
	start: number;
	end: number;
}

export interface ExplainableAIResults {
	explain?: AIExplainPattern;
	slicedMatch?: SlicedMatch[];
	sourceText: string;
}

export interface ExplainableAIWordTotal {
	totalExplainableAIWords: number;
	lowProportionWord: number;
	midProportionWord: number;
	highProportionWord: number;
}

export interface AIScanResult {
	results: AIScanResultItem[];
	summary: AIScanResultSummary;
	scannedDocument: AIScannedDocument;
	explain: AIExplainPattern;
}

export interface AIExplainPattern {
	patterns: {
		statistics: AIPatternStatistics;
		text: {
			chars: AIScanResultMatchChar;
			words: AIScanResultMatchChar;
		};
		html: {
			chars: AIScanResultMatchHtml;
			words: AIScanResultMatchHtml;
		};
	};
}

export interface AIPatternStatistics {
	aiCount: number[];
	humanCount: number[];
	proportion: number[];
}

export enum EProportionType {
	Low = 'low',
	Medium = 'medium',
	High = 'high',
}

export interface AIScannedDocument {
	scanId: string;
	creationTime: string;
}

export interface AIScanResultSummary {
	human: number;
	ai: number;
	unknown: number;
	another_writer_score: number;
}

export interface WritingFeedbackScanResultSummary {
	overallTotalIssues: number;
	overallScore: number;
}

export interface AIScanResultItem {
	classification: EMatchClassification;
	probability: number;
	matches: AIScanResultMatch[];
}

export interface AIScanResultMatch {
	text: {
		chars: AIScanResultMatchChar;
		words: AIScanResultMatchChar;
	};
}

export interface AIScanResultMatchChar {
	starts: number[];
	lengths: number[];
}

export interface AIScanResultMatchHtml {
	starts: number[];
	lengths: number[];
	groupIds: number[];
}

export interface AIMatch extends Match {
	totalWords: number;
	classification: EMatchClassification;
	probability: number;
}

/**
 * Type definition for allowed report origins.
 *
 * @type
 * - 'original': Scan source in "one-to-many" view.
 * - 'source': Scan source in "one-to-one" view.
 * - 'suspect': Result view in scan report.
 */
export type ReportOrigin = 'original' | 'source' | 'suspect';

export interface TextMatchHighlightEvent {
	elem: CrTextMatchComponent | null;
	origin: ReportOrigin;
	broadcast: boolean;
	multiSelect?: boolean;
	showResults?: boolean;
}

export interface HtmlMatchClickEvent {
	match: Match | null;
	isSource: boolean;
	broadcast: boolean;
}
