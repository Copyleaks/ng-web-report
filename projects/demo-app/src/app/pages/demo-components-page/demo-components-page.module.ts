import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FlexLayoutModule } from '@angular/flex-layout';
import { ReportAlertsContainerModule } from 'projects/copyleaks-web-report/src/lib/components/containers/report-alerts-container/report-alerts-container.module';
import { PoweredByModule } from 'projects/copyleaks-web-report/src/lib/components/core/powered-by/powered-by.module';
import { DemoComponentsPageRoutingModule } from './demo-components-page-routing.module';
import { DemoComponentsPageComponent } from './demo-components-page.component';
import { ReportResultsContainerModule } from 'projects/copyleaks-web-report/src/lib/components/containers/report-results-container/report-results-container.module';
import { FilterResultDailogModule } from 'projects/copyleaks-web-report/src/lib/dialogs/filter-result-dailog/filter-result-dailog.module';

@NgModule({
	declarations: [DemoComponentsPageComponent],
	imports: [
		CommonModule,
		DemoComponentsPageRoutingModule,
		PoweredByModule,
		ReportAlertsContainerModule,
		ReportResultsContainerModule,
		FlexLayoutModule,
		FilterResultDailogModule,
	],
})
export class DemoComponentsPageModule {}
