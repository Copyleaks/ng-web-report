export enum EFilterResultForm {
	//Source Type
	fgSourceType = 'sourceType',
	fcInternet = 'internet',
	fcInternalDatabase = 'internalDatabase',
	fcBatch = 'batch',
	fgRepositories = 'repositories',

	//Results Meta
	fgResultsMeta = 'resultsMeta',
	fgWordLimit = 'wordLimit',
	fcWordLimitEnabled = 'wordLimitEnabled',
	fcWordLimitTotalWordlimt = 'totalWordlimt',
	fgPublicationDate = 'publicationDate',
	fcPublicationEnabled = 'publicationEnabled',
	fcPublicationStartDate = 'startDate',

	//Match Type
	fgMatchTypes = 'matchTypes',
	fcIdenticalText = 'identicalText',
	fcMinorChanges = 'minorChanges',
	fcParaphrased = 'paraphrased',

	//General Filters
	fgGeneralFilters = 'generalFilters',
	fcTopResult = 'topResult',
	fcAlerts = 'alerts',
	fcAuthorSubmissions = 'authorSubmissions',

	fcIncludedTags = 'includedTags',
}
