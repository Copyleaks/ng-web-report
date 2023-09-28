import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DemoLayoutsPageRoutingModule } from './demo-layouts-page-routing.module';
import { DemoLayoutsPageComponent } from './demo-layouts-page.component';

import { CopyleaksPlagiarismReportModule } from 'projects/copyleaks-plagiarism-report/src/lib/copyleaks-plagiarism-report.module';

@NgModule({
	declarations: [DemoLayoutsPageComponent],
	imports: [CommonModule, DemoLayoutsPageRoutingModule, CopyleaksPlagiarismReportModule],
})
export class DemoLayoutsPageModule {}
