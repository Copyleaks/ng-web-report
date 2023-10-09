import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DemoComponentsPageRoutingModule } from './demo-components-page-routing.module';
import { DemoComponentsPageComponent } from './demo-components-page.component';
import { ReportResultsContainerModule } from 'projects/copyleaks-web-report/src/lib/components/containers/report-results-container/report-results-container.module';

@NgModule({
	declarations: [DemoComponentsPageComponent],
	imports: [CommonModule, DemoComponentsPageRoutingModule, ReportResultsContainerModule],
})
export class DemoComponentsPageModule {}
