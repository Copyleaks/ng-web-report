import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { CopyleaksWebReportModule } from 'projects/copyleaks-web-report/src/lib/copyleaks-web-report.module';
import { DemoCustomResultsBoxItemModule } from '../../components/demo-custom-results-box-item/demo-custom-results-box-item.module';
import { DemoReportPreviewsRoutingModule } from './demo-report-previews-routing.module';
import { DemoReportPreviewsComponent } from './demo-report-previews.component';

@NgModule({
	declarations: [DemoReportPreviewsComponent],
	imports: [
		CommonModule,
		DemoReportPreviewsRoutingModule,
		CopyleaksWebReportModule,
		MatIconModule,
		DemoCustomResultsBoxItemModule,
	],
	exports: [DemoReportPreviewsComponent],
})
export class DemoReportPreviewsModule {}
