import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OneToManyReportLayoutDesktopComponent } from './one-to-many-report-layout-desktop.component';
import { ContentViewerContainerModule } from '../../containers/content-viewer-container/content-viewer-container.module';
import { ReportActionsContainerModule } from '../../containers/report-actions-container/report-actions-container.module';
import { ReportAlertsContainerModule } from '../../containers/report-alerts-container/report-alerts-container.module';
import { ReportResultsContainerModule } from '../../containers/report-results-container/report-results-container.module';
import { ReportTabsContainerModule } from '../../containers/report-tabs-container/report-tabs-container.module';

@NgModule({
  declarations: [OneToManyReportLayoutDesktopComponent],
  imports: [
    CommonModule,
    ReportTabsContainerModule,
    ContentViewerContainerModule,
    ReportActionsContainerModule,
    ReportAlertsContainerModule,
    ReportResultsContainerModule,
  ],
  exports: [OneToManyReportLayoutDesktopComponent],
})
export class OneToManyReportLayoutDesktopModule {}
