import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReportAlertsContainerModule } from 'projects/copyleaks-web-report/src/lib/components/containers/report-alerts-container/report-alerts-container.module';
import { PoweredByModule } from 'projects/copyleaks-web-report/src/lib/components/powered-by/powered-by.module';
import { DemoComponentsPageRoutingModule } from './demo-components-page-routing.module';
import { DemoComponentsPageComponent } from './demo-components-page.component';
import { ReportResultsItemContainerModule } from 'projects/copyleaks-web-report/src/lib/components/containers/report-results-item-container/report-results-item-container.module';
import { SimilarityPipeModule } from 'projects/copyleaks-web-report/src/lib/pipes/similarity-pipe.module';
import { ReportResultsContainerModule } from 'projects/copyleaks-web-report/src/lib/components/containers/report-results-container/report-results-container.module';
import { ReportViewService } from 'projects/copyleaks-web-report/src/lib/services/report-view.service';

@NgModule({
	declarations: [DemoComponentsPageComponent],
	imports: [
		CommonModule,
		DemoComponentsPageRoutingModule,
		ReportResultsItemContainerModule,
		SimilarityPipeModule,
		PoweredByModule,
		ReportAlertsContainerModule,
		ReportResultsContainerModule,
		FlexLayoutModule,
	],
	providers: [ReportViewService],
})
export class DemoComponentsPageModule {}
