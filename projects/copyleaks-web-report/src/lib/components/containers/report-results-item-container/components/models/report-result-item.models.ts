import {
	IResultPreviewBase,
	ISourceMetadataSection,
	IStatistics,
} from 'projects/copyleaks-web-report/src/lib/models/report-data.models';
import { ResultDetailItem } from 'projects/copyleaks-web-report/src/lib/models/report-matches.models';

export interface IResultItem {
	resultPreview: IResultPreviewBase;
	resultDetails?: ResultDetailItem;
	iStatisticsResult: IStatistics;
	metadataSource: ISourceMetadataSection;
}
