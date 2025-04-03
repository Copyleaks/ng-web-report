import { ReportDataService } from '../../../services/report-data.service';
import { ReportMatchHighlightService } from '../../../services/report-match-highlight.service';
import { ReportViewService } from '../../../services/report-view.service';

export enum EFilterResultForm {
	//Source Type
	fgSourceType = 'sourceType',
	fcInternet = 'internet',
	fcInternalDatabase = 'internalDatabase',
	fcYourResults = 'yourResults',
	fcOthersResults = 'othersResults',
	fcBatch = 'batch',
	fgRepositories = 'repositories',
	fgAISourceMatch = 'aiSourceMatch',

	//Results Meta
	fgResultsMeta = 'resultsMeta',
	fgWordLimit = 'wordLimit',
	fcWordLimitEnabled = 'wordLimitEnabled',
	fcWordLimitTotalWordlimt = 'totalWordlimt',
	fgPublicationDate = 'publicationDate',
	fcPublicationEnabled = 'publicationEnabled',
	fcPublicationStartDate = 'startDate',
	fcResultsWithNoDates = 'resultsWithNoDates',

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

	fcExcludedDomains = 'excludedDomains',
}

export enum EFilterResultSection {
	SourceTypes = 0,
	MatchTypes,
	GeneralFilters,
	AdvancedFilterSettings,
	ExcludeDomains,
	IncludedTags,
}

export interface IFilterResultDailogData {
	reportDataSvc: ReportDataService;
	reportViewSvc: ReportViewService;
	highlightService: ReportMatchHighlightService;
	showExcludedDailog: boolean;
	isMobile: boolean;
}
