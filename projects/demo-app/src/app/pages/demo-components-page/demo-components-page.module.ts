import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DemoComponentsPageRoutingModule } from './demo-components-page-routing.module';
import { DemoComponentsPageComponent } from './demo-components-page.component';
import { ReportResultsItemContainerModule } from 'projects/copyleaks-web-report/src/lib/components/containers/report-results-item-container/report-results-item-container.module';
import { SimilarityPipeModule } from 'projects/copyleaks-web-report/src/lib/pipes/similarity-pipe.module';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
	declarations: [DemoComponentsPageComponent],
	imports: [
		CommonModule,
		DemoComponentsPageRoutingModule,
		FlexLayoutModule,
		ReportResultsItemContainerModule,
		SimilarityPipeModule,
	],
})
export class DemoComponentsPageModule {}
