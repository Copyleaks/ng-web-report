import { ViewMode } from './report-config.models';

export interface IReportViewEvent {
	isHtmlView: boolean;
	viewMode: ViewMode;
	sourcePageIndex: number;
	suspectPageIndex?: number;
	suspectId?: string;
}
