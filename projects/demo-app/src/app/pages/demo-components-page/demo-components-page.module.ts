import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FlexLayoutModule } from '@angular/flex-layout';
import { ReportAlertsContainerModule } from 'projects/copyleaks-web-report/src/lib/components/containers/report-alerts-container/report-alerts-container.module';
import { PoweredByModule } from 'projects/copyleaks-web-report/src/lib/components/powered-by/powered-by.module';
import { DemoComponentsPageRoutingModule } from './demo-components-page-routing.module';
import { DemoComponentsPageComponent } from './demo-components-page.component';
import { ReportResultsContainerModule } from 'projects/copyleaks-web-report/src/lib/components/containers/report-results-container/report-results-container.module';

@NgModule({
	declarations: [DemoComponentsPageComponent],
	imports: [
		CommonModule,
		DemoComponentsPageRoutingModule,
		PoweredByModule,
		ReportAlertsContainerModule,
		ReportResultsContainerModule,
		FlexLayoutModule,
	],
})
export class DemoComponentsPageModule {}
