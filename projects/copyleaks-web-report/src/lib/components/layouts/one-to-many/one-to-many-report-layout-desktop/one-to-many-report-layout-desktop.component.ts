import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ReportDataService } from '../../../../services/report-data.service';
import { ReportMatchesService } from '../../../../services/report-matches.service';
import { ReportViewService } from '../../../../services/report-view.service';
import { ReportMatchHighlightService } from 'projects/copyleaks-web-report/src/lib/services/report-match-highlight.service';
import { ReportStatisticsService } from 'projects/copyleaks-web-report/src/lib/services/report-statistics.service';
import { OneToManyReportLayoutBaseComponent } from '../../base/report-layout-one-to-many-base.component';
import { ReportNgTemplatesService } from 'projects/copyleaks-web-report/src/lib/services/report-ng-templates.service';

@Component({
	selector: 'copyleaks-one-to-many-report-layout-desktop',
	templateUrl: './one-to-many-report-layout-desktop.component.html',
	styleUrls: ['./one-to-many-report-layout-desktop.component.scss'],
})
export class OneToManyReportLayoutDesktopComponent
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
