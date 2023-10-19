import { IResultItem } from '../../models/report-result-item.models';

export interface IPercentageResult {
	resultItem: IResultItem;
	title?: string;
	showArrowButton?: boolean;
	showTooltip?: boolean;
	stackedBarHeight?: string;
	stackedBarBackgroundColor?: string;
}
