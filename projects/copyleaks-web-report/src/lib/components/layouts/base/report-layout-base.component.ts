import { Renderer2 } from '@angular/core';
import { ReportDataService } from '../../../services/report-data.service';
import { ReportMatchesService } from '../../../services/report-matches.service';
import { IReportViewEvent } from '../../../models/report-view.models';
import { ReportViewService } from '../../../services/report-view.service';
import { ReportMatchHighlightService } from '../../../services/report-match-highlight.service';
import { ReportStatisticsService } from '../../../services/report-statistics.service';
import { ReportNgTemplatesService } from '../../../services/report-ng-templates.service';
import { ReportRealtimeResultsService } from '../../../services/report-realtime-results.service';

export abstract class ReportLayoutBaseComponent {
	isHtmlView: boolean;

	get isAlertsMode(): boolean {
		return !!this.reportViewSvc.selectedAlert;
	}

	constructor(
		protected reportDataSvc: ReportDataService,
		protected reportViewSvc: ReportViewService,
		protected matchSvc: ReportMatchesService,
		protected renderer: Renderer2,
		protected highlightSvc: ReportMatchHighlightService,
		protected statisticsSvc: ReportStatisticsService,
		protected templatesSvc: ReportNgTemplatesService,
		protected realTimeResultsSvc: ReportRealtimeResultsService
	) {}

	onReportViewChange(event: IReportViewEvent) {
		this.isHtmlView = event.isHtmlView;
		this.reportViewSvc.reportViewMode$.next(event);
	}

	onShowOmittedWords(showOmittedWords: boolean) {
		this.matchSvc.showOmittedWords$.next(showOmittedWords);
	}
}
