import { Component, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ReportDataService } from '../../../../services/report-data.service';
import { ReportMatchHighlightService } from '../../../../services/report-match-highlight.service';
import { ReportMatchesService } from '../../../../services/report-matches.service';
import { ReportStatisticsService } from '../../../../services/report-statistics.service';
import { ReportViewService } from '../../../../services/report-view.service';
import { OneToManyReportLayoutBaseComponent } from '../../base/report-layout-one-to-many-base.component';
import { ReportNgTemplatesService } from '../../../../services/report-ng-templates.service';
import { ReportRealtimeResultsService } from '../../../../services/report-realtime-results.service';
import { ReportErrorsService } from '../../../../services/report-errors.service';

@Component({
	selector: 'copyleaks-only-ai-report-layout-mobile',
	templateUrl: './only-ai-report-layout-mobile.component.html',
	styleUrls: ['./only-ai-report-layout-mobile.component.scss'],
	standalone: false,
})
export class OnlyAiReportLayoutMobileComponent extends OneToManyReportLayoutBaseComponent implements OnInit, OnDestroy {
	@Input() companyLogo: string = null;

	@Input() hideWritingFeedback: boolean = false;

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
		this.initOneToManyViewData();
	}

	ngOnDestroy(): void {
		this.onComponentDestroy();
	}
}
