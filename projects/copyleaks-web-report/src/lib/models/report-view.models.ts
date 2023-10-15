import { EResponsiveLayoutType } from '../enums/copyleaks-web-report.enums';
import { ViewMode } from './report-config.models';

export interface IReportViewEvent {
	isHtmlView: boolean;
	viewMode: ViewMode;
	sourcePageIndex: number;
	suspectPageIndex?: number;
	suspectId?: string;
}

export interface IReportViewQueryParams {
	viewMode: string;
	contentMode: string;
	sourcePage: string;
	suspectPage?: string;
	suspectId?: string;
}

export interface IReportResponsiveMode {
	mode: EResponsiveLayoutType;
}
