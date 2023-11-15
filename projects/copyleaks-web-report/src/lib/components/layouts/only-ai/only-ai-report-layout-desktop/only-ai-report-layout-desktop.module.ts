import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnlyAiReportLayoutDesktopComponent } from './only-ai-report-layout-desktop.component';
import { ContentViewerContainerModule } from '../../../containers/content-viewer-container/content-viewer-container.module';
import { ReportActionsContainerModule } from '../../../containers/report-actions-container/report-actions-container.module';
import { ReportAlertsContainerModule } from '../../../containers/report-alerts-container/report-alerts-container.module';
import { ReportResultsContainerModule } from '../../../containers/report-results-container/report-results-container.module';
import { ReportTabsContainerModule } from '../../../containers/report-tabs-container/report-tabs-container.module';

@NgModule({
	declarations: [OnlyAiReportLayoutDesktopComponent],
	imports: [
		CommonModule,
		ReportTabsContainerModule,
		ContentViewerContainerModule,
		ReportActionsContainerModule,
		ReportAlertsContainerModule,
		ReportResultsContainerModule,
	],
	exports: [OnlyAiReportLayoutDesktopComponent],
})
export class OnlyAiReportLayoutDesktopModule {}
