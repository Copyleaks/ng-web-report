import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ReportDataService } from 'projects/copyleaks-web-report/src/lib/services/report-data.service';
import { ReportMatchHighlightService } from 'projects/copyleaks-web-report/src/lib/services/report-match-highlight.service';
import { ReportMatchesService } from 'projects/copyleaks-web-report/src/lib/services/report-matches.service';
import { ReportStatisticsService } from 'projects/copyleaks-web-report/src/lib/services/report-statistics.service';
import { ReportViewService } from 'projects/copyleaks-web-report/src/lib/services/report-view.service';
import { OneToManyReportLayoutBaseComponent } from '../../base/report-layout-one-to-many-base.component';

@Component({
	selector: 'copyleaks-only-ai-report-layout-mobile',
	templateUrl: './only-ai-report-layout-mobile.component.html',
	styleUrls: ['./only-ai-report-layout-mobile.component.scss'],
})
export class OnlyAiReportLayoutMobileComponent extends OneToManyReportLayoutBaseComponent implements OnInit, OnDestroy {
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
