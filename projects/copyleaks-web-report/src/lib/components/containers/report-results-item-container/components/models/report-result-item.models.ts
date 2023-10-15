import {
	IResultPreviewBase,
	ISourceMetadataSection,
	IStatistics,
} from 'projects/copyleaks-web-report/src/lib/models/report-data.models';

export interface IResultItem {
	previewResult: IResultPreviewBase;
	iStatisticsResult: IStatistics;
	metadataSource: ISourceMetadataSection;
}
