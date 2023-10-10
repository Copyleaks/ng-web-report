import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OneToOneReportLayoutMobileComponent } from './one-to-one-report-layout-mobile.component';
import { ContentViewerContainerModule } from '../../../containers/content-viewer-container/content-viewer-container.module';
import { ReportActionsContainerModule } from '../../../containers/report-actions-container/report-actions-container.module';
import { ReportResultsItemContainerModule } from '../../../containers/report-results-item-container/report-results-item-container.module';

@NgModule({
	declarations: [OneToOneReportLayoutMobileComponent],
	imports: [CommonModule, ContentViewerContainerModule, ReportActionsContainerModule, ReportResultsItemContainerModule],
	exports: [OneToOneReportLayoutMobileComponent],
})
export class OneToOneReportLayoutMobileModule {}
