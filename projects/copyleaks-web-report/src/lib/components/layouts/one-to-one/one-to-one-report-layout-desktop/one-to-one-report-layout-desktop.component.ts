import { Component, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ReportDataService } from '../../../../services/report-data.service';
import { ReportMatchesService } from '../../../../services/report-matches.service';
import { ReportViewService } from '../../../../services/report-view.service';
import { ReportMatchHighlightService } from '../../../../services/report-match-highlight.service';
import { ReportStatisticsService } from '../../../../services/report-statistics.service';
import { OneToOneReportLayoutBaseComponent } from '../../base/report-layout-one-to-one-base.component';
import { ReportNgTemplatesService } from '../../../../services/report-ng-templates.service';
import { ReportRealtimeResultsService } from '../../../../services/report-realtime-results.service';
import { EReportMode } from '../../../../enums/copyleaks-web-report.enums';
import { ReportErrorsService } from '../../../../services/report-errors.service';

@Component({
	selector: 'copyleaks-one-to-one-report-layout-desktop',
	templateUrl: './one-to-one-report-layout-desktop.component.html',
	styleUrls: ['./one-to-one-report-layout-desktop.component.scss'],
})
export class OneToOneReportLayoutDesktopComponent
	extends OneToOneReportLayoutBaseComponent
	implements OnInit, OnDestroy
{
	@Input() reportMode: EReportMode;
	EReportMode = EReportMode;

	constructor(
		reportDataSvc: ReportDataService,
		reportViewSvc: ReportViewService,
		matchSvc: ReportMatchesService,
		renderer: Renderer2,
		highlightSvc: ReportMatchHighlightService,
		statisticsSvc: ReportStatisticsService,
		templatesSvc: ReportNgTemplatesService,
		realTimeResultsSvc: ReportRealtimeResultsService,
		reportErrorsSvc: ReportErrorsService
	) {
		super(
			reportDataSvc,
			reportViewSvc,
			matchSvc,
			renderer,
			highlightSvc,
			statisticsSvc,
			templatesSvc,
			realTimeResultsSvc,
			reportErrorsSvc
		);
	}

	ngOnInit(): void {
		this.initOneToOneViewData();
	}

	ngOnDestroy(): void {
		this.onComponentDestroy();
	}
}
