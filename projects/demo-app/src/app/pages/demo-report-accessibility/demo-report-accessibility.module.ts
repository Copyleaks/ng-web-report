import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemoReportAccessibilityComponent } from './demo-report-accessibility.component';
import { DemoReportAccessibilityRoutingModule } from './demo-report-accessibility-routing.module';
import { CopyleaksWebReportModule } from 'projects/copyleaks-web-report/src/public-api';
import { CrButtonModule } from 'projects/copyleaks-web-report/src/lib/components/core/cr-button/cr-button.module';
import { MatIconModule } from '@angular/material/icon';
import { DemoCustomResultsBoxItemModule } from '../../components/demo-custom-results-box-item/demo-custom-results-box-item.module';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
	declarations: [DemoReportAccessibilityComponent],
	imports: [
		CommonModule,
		DemoReportAccessibilityRoutingModule,
		CopyleaksWebReportModule,
		CrButtonModule,
		MatIconModule,
		DemoCustomResultsBoxItemModule,
		RouterModule,
		MatMenuModule,
	],
	exports: [DemoReportAccessibilityComponent],
})
export class DemoReportAccessibilityModule {}
