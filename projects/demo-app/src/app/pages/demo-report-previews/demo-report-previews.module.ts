import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DemoReportPreviewsRoutingModule } from './demo-report-previews-routing.module';
import { DemoReportPreviewsComponent } from './demo-report-previews.component';
import { CopyleaksWebReportModule } from 'projects/copyleaks-web-report/src/lib/copyleaks-web-report.module';
import { CrActionsModule } from 'projects/copyleaks-web-report/src/lib/components/core/cr-report-actions/cr-report-actions.module';
import { CrCustomTabItemModule } from 'projects/copyleaks-web-report/src/lib/components/core/cr-custom-tabs/components/cr-custom-tab-item/cr-custom-tab-item.module';
import { CrCustomTabsModule } from 'projects/copyleaks-web-report/src/lib/components/core/cr-custom-tabs/cr-custom-tabs.module';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
	declarations: [DemoReportPreviewsComponent],
	imports: [
		CommonModule,
		DemoReportPreviewsRoutingModule,
		CopyleaksWebReportModule,
		CrActionsModule,
		CrCustomTabsModule,
		CrCustomTabItemModule,
		MatIconModule,
	],
	exports: [DemoReportPreviewsComponent],
})
export class DemoReportPreviewsModule {}
