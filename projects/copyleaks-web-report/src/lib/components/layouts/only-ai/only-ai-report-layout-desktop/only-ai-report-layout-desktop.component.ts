import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ReportDataService } from 'projects/copyleaks-web-report/src/lib/services/report-data.service';
import { ReportMatchHighlightService } from 'projects/copyleaks-web-report/src/lib/services/report-match-highlight.service';
import { ReportMatchesService } from 'projects/copyleaks-web-report/src/lib/services/report-matches.service';
import { ReportStatisticsService } from 'projects/copyleaks-web-report/src/lib/services/report-statistics.service';
import { ReportViewService } from 'projects/copyleaks-web-report/src/lib/services/report-view.service';
import { OneToManyReportLayoutBaseComponent } from '../../base/report-layout-one-to-many-base.component';
import { ReportNgTemplatesService } from 'projects/copyleaks-web-report/src/lib/services/report-ng-templates.service';

@Component({
	selector: 'copyleaks-only-ai-report-layout-desktop',
	templateUrl: './only-ai-report-layout-desktop.component.html',
	styleUrls: ['./only-ai-report-layout-desktop.component.scss'],
})
export class OnlyAiReportLayoutDesktopComponent
	extends OneToManyReportLayoutBaseComponent
	implements OnInit, OnDestroy
{
	constructor(
		reportDataSvc: ReportDataService,
		reportViewSvc: ReportViewService,
		matchSvc: ReportMatchesService,
		renderer: Renderer2,
		highlightSvc: ReportMatchHighlightService,
		statisticsSvc: ReportStatisticsService,
		templatesSvc: ReportNgTemplatesService
	) {
		super(reportDataSvc, reportViewSvc, matchSvc, renderer, highlightSvc, statisticsSvc, templatesSvc);
	}

	ngOnInit(): void {
		this.initOneToManyViewData();
	}

	ngOnDestroy(): void {}
}