import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ReportDataService } from '../../../../services/report-data.service';
import { ReportMatchesService } from '../../../../services/report-matches.service';
import { ReportViewService } from 'projects/copyleaks-web-report/src/lib/services/report-view.service';
import { ReportMatchHighlightService } from 'projects/copyleaks-web-report/src/lib/services/report-match-highlight.service';
import { ReportStatisticsService } from 'projects/copyleaks-web-report/src/lib/services/report-statistics.service';
import { OneToManyReportLayoutBaseComponent } from '../../base/report-layout-one-to-many-base.component';

@Component({
	selector: 'copyleaks-one-to-many-report-layout-mobile',
	templateUrl: './one-to-many-report-layout-mobile.component.html',
	styleUrls: ['./one-to-many-report-layout-mobile.component.scss'],
})
export class OneToManyReportLayoutMobileComponent
	extends OneToManyReportLayoutBaseComponent
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
		this.initOneToManyViewData();
	}

	ngOnDestroy(): void {}
}
