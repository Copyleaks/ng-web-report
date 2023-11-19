import { ReportDataService } from '../../../services/report-data.service';
import { ReportViewService } from '../../../services/report-view.service';

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
}

export interface IFilterResultDailogData {
	reportDataSvc: ReportDataService;
	reportViewSvc: ReportViewService;
	showExcludedDailog: boolean;
	isMobile: boolean;
}
