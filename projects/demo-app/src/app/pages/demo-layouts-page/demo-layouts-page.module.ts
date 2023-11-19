import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DemoLayoutsPageRoutingModule } from './demo-layouts-page-routing.module';
import { DemoLayoutsPageComponent } from './demo-layouts-page.component';
import { CopyleaksWebReportModule } from 'projects/copyleaks-web-report/src/lib/copyleaks-web-report.module';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
	declarations: [DemoLayoutsPageComponent],
	imports: [CommonModule, DemoLayoutsPageRoutingModule, CopyleaksWebReportModule, MatIconModule],
})
export class DemoLayoutsPageModule {}
