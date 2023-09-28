import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DemoLayoutsPageRoutingModule } from './demo-layouts-page-routing.module';
import { DemoLayoutsPageComponent } from './demo-layouts-page.component';

import { CopyleaksWebReportModule } from 'projects/copyleaks-plagiarism-report/src/lib/copyleaks-web-report.module';
import { CopyleaksWebReportActionsModule } from 'projects/copyleaks-plagiarism-report/src/lib/components/core/copyleaks-web-report-actions/copyleaks-web-report-actions.module';

@NgModule({
	declarations: [DemoLayoutsPageComponent],
	imports: [CommonModule, DemoLayoutsPageRoutingModule, CopyleaksWebReportModule, CopyleaksWebReportActionsModule],
})
export class DemoLayoutsPageModule {}
