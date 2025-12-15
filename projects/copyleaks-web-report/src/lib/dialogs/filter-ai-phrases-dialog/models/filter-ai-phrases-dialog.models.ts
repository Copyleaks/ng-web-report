import { ReportDataService } from '../../../services/report-data.service';
import { ReportViewService } from '../../../services/report-view.service';

export interface IFilterAiPhrasesDialogData {
	reportDataSvc: ReportDataService;
	reportViewSvc: ReportViewService;
	minProportion?: number;
	maxProportion?: number;
	totalCount?: number;
}
