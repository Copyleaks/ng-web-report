import { IEndpointDetails } from '../../../models/report-config.models';
import { ReportDataService } from '../../../services/report-data.service';

export interface IRemoveResultConfirmationDialogData {
	resultId: string;
	deleteEndpoint: IEndpointDetails;
	isMobile: boolean;
	reportDataSvc: ReportDataService;
}
