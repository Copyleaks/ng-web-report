import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ReportDataService } from '../../../../services/report-data.service';
import { ReportMatchHighlightService } from '../../../../services/report-match-highlight.service';
import { ReportMatchesService } from '../../../../services/report-matches.service';
import { ReportViewService } from '../../../../services/report-view.service';
import { ReportStatisticsService } from '../../../../services/report-statistics.service';
import { OneToOneReportLayoutBaseComponent } from '../../base/report-layout-one-to-one-base.component';
import { ReportNgTemplatesService } from '../../../../services/report-ng-templates.service';
import { ReportRealtimeResultsService } from '../../../../services/report-realtime-results.service';

@Component({
	selector: 'copyleaks-one-to-one-report-layout-mobile',
	templateUrl: './one-to-one-report-layout-mobile.component.html',
	styleUrls: ['./one-to-one-report-layout-mobile.component.scss'],
})
export class OneToOneReportLayoutMobileComponent
	extends OneToOneReportLayoutBaseComponent
	implements OnInit, OnDestroy
{
	constructor(
		reportDataSvc: ReportDataService,
		reportViewSvc: ReportViewService,
		matchSvc: ReportMatchesService,
		renderer: Renderer2,
		highlightSvc: ReportMatchHighlightService,
		statisticsSvc: ReportStatisticsService,
		templatesSvc: ReportNgTemplatesService,
		realTimeResultsSvc: ReportRealtimeResultsService
	) {
		super(
			reportDataSvc,
			reportViewSvc,
			matchSvc,
			renderer,
			highlightSvc,
			statisticsSvc,
			templatesSvc,
			realTimeResultsSvc
		);
	}

	ngOnInit(): void {
		this.initOneToOneViewData();
	}

	ngOnDestroy(): void {}
}
