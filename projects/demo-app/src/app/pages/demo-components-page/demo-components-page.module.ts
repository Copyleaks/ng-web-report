import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DemoComponentsPageRoutingModule } from './demo-components-page-routing.module';
import { DemoComponentsPageComponent } from './demo-components-page.component';
import { ReportAlertsContainerModule } from 'projects/copyleaks-web-report/src/lib/components/containers/report-alerts-container/report-alerts-container.module';

@NgModule({
	declarations: [DemoComponentsPageComponent],
	imports: [CommonModule, DemoComponentsPageRoutingModule, ReportAlertsContainerModule],
})
export class DemoComponentsPageModule {}
