import { IResultPreviewBase, ISourceMetadataSection, IStatistics } from '../../../../../models/report-data.models';
import { ResultDetailItem } from '../../../../../models/report-matches.models';

export interface IResultItem {
	resultPreview: IResultPreviewBase;
	resultDetails?: ResultDetailItem;
	iStatisticsResult: IStatistics;
	metadataSource: ISourceMetadataSection;
}
