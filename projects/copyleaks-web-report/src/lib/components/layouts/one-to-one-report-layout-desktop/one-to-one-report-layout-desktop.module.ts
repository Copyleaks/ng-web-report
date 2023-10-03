import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OneToOneReportLayoutDesktopComponent } from './one-to-one-report-layout-desktop.component';
import { ContentViewerContainerModule } from '../../containers/content-viewer-container/content-viewer-container.module';
import { ReportActionsContainerModule } from '../../containers/report-actions-container/report-actions-container.module';
import { ReportResultsItemContainerModule } from '../../containers/report-results-item-container/report-results-item-container.module';

@NgModule({
	declarations: [OneToOneReportLayoutDesktopComponent],
	imports: [CommonModule, ContentViewerContainerModule, ReportActionsContainerModule, ReportResultsItemContainerModule],
	exports: [OneToOneReportLayoutDesktopComponent],
})
export class OneToOneReportLayoutModule {}
