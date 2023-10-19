import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DemoLayoutsPageRoutingModule } from './demo-layouts-page-routing.module';
import { DemoLayoutsPageComponent } from './demo-layouts-page.component';
import { CopyleaksWebReportModule } from 'projects/copyleaks-web-report/src/lib/copyleaks-web-report.module';
import { CrActionsModule } from 'projects/copyleaks-web-report/src/lib/components/core/cr-report-actions/cr-report-actions.module';

@NgModule({
	declarations: [DemoLayoutsPageComponent],
	imports: [CommonModule, DemoLayoutsPageRoutingModule, CopyleaksWebReportModule, CrActionsModule],
})
export class DemoLayoutsPageModule {}
