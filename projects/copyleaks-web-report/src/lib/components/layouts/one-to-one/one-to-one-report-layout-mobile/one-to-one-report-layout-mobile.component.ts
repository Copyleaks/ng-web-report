import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ReportDataService } from 'projects/copyleaks-web-report/src/lib/services/report-data.service';
import { ReportMatchHighlightService } from 'projects/copyleaks-web-report/src/lib/services/report-match-highlight.service';
import { ReportMatchesService } from 'projects/copyleaks-web-report/src/lib/services/report-matches.service';
import { ReportViewService } from 'projects/copyleaks-web-report/src/lib/services/report-view.service';
import { ReportStatisticsService } from 'projects/copyleaks-web-report/src/lib/services/report-statistics.service';
import { OneToOneReportLayoutBaseComponent } from '../../base/report-layout-one-to-one-base.component';

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
		statisticsSvc: ReportStatisticsService
	) {
		super(reportDataSvc, reportViewSvc, matchSvc, renderer, highlightSvc, statisticsSvc);
	}

	ngOnInit(): void {
		this.initOneToOneViewData();
	}

	ngOnDestroy(): void {}
}
