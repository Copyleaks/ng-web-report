import { IResultItem } from '../../../components/containers/report-results-item-container/components/models/report-result-item.models';
import { IEndpointDetails } from '../../../models/report-config.models';
import { ReportDataService } from '../../../services/report-data.service';

export interface IRemoveResultConfirmationDialogData {
	resultInfo: IResultItem;
	deleteEndpoint: IEndpointDetails;
	isMobile: boolean;
	reportDataSvc: ReportDataService;
}
