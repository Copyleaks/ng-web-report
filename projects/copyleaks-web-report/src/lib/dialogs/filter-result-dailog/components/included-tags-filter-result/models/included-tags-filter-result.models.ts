import { IResultTag } from 'projects/copyleaks-web-report/src/lib/models/report-data.models';

export interface ITagItem extends IResultTag {
	selected?: boolean;
}
