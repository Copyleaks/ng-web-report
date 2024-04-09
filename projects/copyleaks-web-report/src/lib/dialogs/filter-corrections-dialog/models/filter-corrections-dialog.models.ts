import { IWritingFeedbackTypeStatistics } from '../../../models/report-statistics.models';
import { ReportDataService } from '../../../services/report-data.service';
import { ReportViewService } from '../../../services/report-view.service';
import { EFilterCorrectionsDialogView } from '../enums/filter-corrections-dialog.enums';

export interface IFilterCorrectionsDialogData {
	reportDataSvc: ReportDataService;
	reportViewSvc: ReportViewService;
	selectedView: EFilterCorrectionsDialogView;
	totalCorrections: number;
	totalFilteredCorrections: number;
	writingFeedbackStats: IWritingFeedbackTypeStatistics[];
}
