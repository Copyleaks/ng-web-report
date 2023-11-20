import { EResultPreviewType } from '../../../../../enums/copyleaks-web-report.enums';
import { IRepositoryResultPreview } from '../../../../../models/report-data.models';

export interface ITotalSourceType {
	totalInternet: number;
	totalInternalDatabase: number;
	totalbatch: number;
	repository?: IRepositoryResultPreview[];
}

export const REPOSITORIES: IRepositoryResultPreview[] = [
	{
		repositoryId: '1',
		id: '1',
		title: 'rep1',
		introduction: 'no-introduction',
		matchedWords: 2,
		type: EResultPreviewType.Repositroy,
	},
	{
		repositoryId: '2',
		id: '2',
		title: 'rep2',
		introduction: 'no-introduction',
		matchedWords: 2,
		type: EResultPreviewType.Repositroy,
	},
	{
		repositoryId: '3',
		id: '3',
		title: 'rep3',
		introduction: 'no-introduction',
		matchedWords: 2,
		type: EResultPreviewType.Repositroy,
	},
	{
		repositoryId: '4',
		id: '4',
		title: 'rep4',
		introduction: 'no-introduction',
		matchedWords: 2,
		type: EResultPreviewType.Repositroy,
	},
];
