import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ReportDataService } from '../../../../services/report-data.service';
import { ReportMatchHighlightService } from '../../../../services/report-match-highlight.service';
import { ReportMatchesService } from '../../../../services/report-matches.service';
import { ReportStatisticsService } from '../../../../services/report-statistics.service';
import { ReportViewService } from '../../../../services/report-view.service';
import { OneToManyReportLayoutBaseComponent } from '../../base/report-layout-one-to-many-base.component';
import { ReportNgTemplatesService } from '../../../../services/report-ng-templates.service';

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
