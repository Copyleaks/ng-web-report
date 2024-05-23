/**
 * Enum for all the copyleaks report view types.
 */
export enum EReportMode {
	/**
	 * The normal web reoprt view.
	 */
	WebReport = 'web-report',
	/**
	 * The Assessment tool view.
	 */
	AssessmentTool = 'assessment-tool',
}

/**
 * Enum for all the copyleaks report layouts types.
 */
export enum EReportLayoutType {
	/**
	 * One to one layout/view: when two documents are compared to each other.
	 */
	OneToOne = 'one-to-one',
	/**
	 * One to many layout/view: The default report layout, which shows the document along with the results section.
	 */
	OneToMany = 'one-to-many',
	/**
	 * Only AI layout/view: The layout where there is only AI view (plagiarism is disabled).
	 */
	OnlyAi = 'only-ai',
	/**
	 * Only AI layout/view: The layout where there is only AI view (plagiarism is disabled).
	 */
	WritingFeedback = 'writing-feedback',
}

/**
 * Enum for all the copyleaks report responsive views types.
 */
export enum EResponsiveLayoutType {
	/**
	 * Desktop view.
	 */
	Desktop = 'desktop',
	/**
	 * Tablet view.
	 */
	Tablet = 'tablet',
	/**
	 * Mobile view.
	 */
	Mobile = 'mobile',
}

export enum EReportViewType {
	AIView = 'AIView',
	PlagiarismView = 'PlagiarismView',
	CustomTabView = 'CustomTabView',
	WritingFeedbackTabView = 'WritingFeedbackTabView',
}

export enum EReportScoreTooltipPosition {
	ABOVE = 'above',
	BELOW = 'below',
	LEFT = 'left',
	RIGHT = 'right',
	DEFAULT = 'above',
}

/**
 * Enum representing reasons for exclusion
 */
export enum EExcludeReason {
	Quotation = 1,
	Reference = 2,
	Header = 3,
	Footer = 4,
	HtmlTemplate = 5,
	TableOfContent = 6,
	CodeComments = 7,
	PartialScan = 8,
}

/** Enum representing the status of a scan */
export enum EScanStatus {
	Success = 0,
	Error = 1,
	CreditsChecked = 2,
	Indexed = 3,
}

export enum ECompleteResultNotificationAlertSeverity {
	VeryLow = 0,
	Low = 1,
	Medium = 2,
	High = 3,
	VeryHigh = 4,
}

/** result preview types  */
export enum EResultPreviewType {
	Batch,
	Repositroy,
	Internet,
	Database,
}

/** Enum representing the access of a result */
export enum ResultAccess {
	full,
	locked,
}

export enum EMatchClassification {
	Unknown = 0,
	Human = 1,
	AI = 2,
	SameWriter = 3,
	AnotherWriter = 4,
}

export enum EWritingFeedbackTypes {
	General,
	Grammar,
	WordChoice,
	Mechanics,
	SentenceStructure,
	MismatchInGenderBetweenAdjectives,
	IncorrectNumberAgreementBetweenArticles,
	IncorrectNumberAgreementBetweenNouns,
}

export enum EWritingFeedbackCategories {
	General = 1,

	// Grammar
	SubjectVerbDisagreement,
	NounForm,
	VerbForm,
	Article,
	Preposition,
	Pronoun,
	PartOfSpeech,
	Conjunction,

	// Word Choice
	MisusedWord,
	Homophone,

	// Mechanics
	Capitalization,
	Hyphen,
	Punctuation,
	Comma,
	Apostrophe,
	Space,
	Spelling,

	// Sentence Structure
	FusedSentence,
	CommaSplice,
	SentenceFragments,
	IneffectiveConstruction,
	ExtraWords,
	MissingWords,

	// Mismatch in gender between adjectives
	AdjectiveGenderAgreement,
	AdjectiveNumberAgreement,

	// Incorrect number agreement between articles
	ArticleGenderAgreement,
	ArticleNumberAgreement,

	// Incorrect number agreement between nouns
	NounGenderAgreement,
	SubjunctiveMood,
	CompoundWordError,
	MoodInconsistency,
	AccentError,
}

export enum EReadabilityLevel {
	FifthGrader = 1,
	SixthGrader,
	SeventhGrader,
	EighthNinthGrader,
	TenthTwelfthGrader,
	CollegeStudent,
	CollegeGraduate,
	Professional,
}

/**
 * Enum representing the platform that is using the report component
 */
export enum EPlatformType {
	APP = 0,
	LMS = 1,
}
