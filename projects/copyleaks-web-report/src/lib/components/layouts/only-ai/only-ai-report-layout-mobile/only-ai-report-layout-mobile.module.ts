import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnlyAiReportLayoutMobileComponent } from './only-ai-report-layout-mobile.component';
import { ContentViewerContainerModule } from '../../../containers/content-viewer-container/content-viewer-container.module';
import { ReportActionsContainerModule } from '../../../containers/report-actions-container/report-actions-container.module';
import { ReportAlertsContainerModule } from '../../../containers/report-alerts-container/report-alerts-container.module';
import { ReportResultsContainerModule } from '../../../containers/report-results-container/report-results-container.module';
import { ReportTabsContainerModule } from '../../../containers/report-tabs-container/report-tabs-container.module';
import { CrPoweredByModule } from '../../../core/cr-powered-by/cr-powered-by.module';

@NgModule({
	declarations: [OnlyAiReportLayoutMobileComponent],
	imports: [
		CommonModule,
		ReportTabsContainerModule,
		ContentViewerContainerModule,
		ReportActionsContainerModule,
		ReportAlertsContainerModule,
		ReportResultsContainerModule,
		CrPoweredByModule,
	],
	exports: [OnlyAiReportLayoutMobileComponent],
})
export class OnlyAiReportLayoutMobileModule {}