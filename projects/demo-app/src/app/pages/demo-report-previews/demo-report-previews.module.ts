import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DemoReportPreviewsRoutingModule } from './demo-report-previews-routing.module';
import { DemoReportPreviewsComponent } from './demo-report-previews.component';
import { CopyleaksWebReportModule } from 'projects/copyleaks-plagiarism-report/src/lib/copyleaks-web-report.module';
import { CopyleaksWebReportActionsModule } from 'projects/copyleaks-plagiarism-report/src/lib/components/core/copyleaks-web-report-actions/copyleaks-web-report-actions.module';

@NgModule({
	declarations: [DemoReportPreviewsComponent],
	imports: [CommonModule, DemoReportPreviewsRoutingModule, CopyleaksWebReportModule, CopyleaksWebReportActionsModule],
	exports: [DemoReportPreviewsComponent],
})
export class DemoReportPreviewsModule {}
