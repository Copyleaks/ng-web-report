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
