import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportAlertsContainerModule } from 'projects/copyleaks-web-report/src/lib/components/containers/report-alerts-container/report-alerts-container.module';
import { ReportResultsContainerModule } from 'projects/copyleaks-web-report/src/lib/components/containers/report-results-container/report-results-container.module';
import { ReportResultsItemContainerModule } from 'projects/copyleaks-web-report/src/lib/components/containers/report-results-item-container/report-results-item-container.module';
import { CrCustomTabItemModule } from 'projects/copyleaks-web-report/src/lib/components/core/cr-custom-tabs/components/cr-custom-tab-item/cr-custom-tab-item.module';
import { CrCustomTabsModule } from 'projects/copyleaks-web-report/src/lib/components/core/cr-custom-tabs/cr-custom-tabs.module';
import { CrPoweredByModule } from 'projects/copyleaks-web-report/src/lib/components/core/cr-powered-by/cr-powered-by.module';
import { FilterResultDailogModule } from 'projects/copyleaks-web-report/src/lib/dialogs/filter-result-dailog/filter-result-dailog.module';
import { SimilarityPipeModule } from 'projects/copyleaks-web-report/src/lib/pipes/similarity-pipe/similarity-pipe.module';
import { ReportNgTemplatesService } from 'projects/copyleaks-web-report/src/lib/services/report-ng-templates.service';
import { ReportViewService } from 'projects/copyleaks-web-report/src/lib/services/report-view.service';
import { DemoComponentsPageRoutingModule } from './demo-components-page-routing.module';
import { DemoComponentsPageComponent } from './demo-components-page.component';

@NgModule({
	declarations: [DemoComponentsPageComponent],
	imports: [
		CommonModule,
		DemoComponentsPageRoutingModule,
		ReportResultsItemContainerModule,
		SimilarityPipeModule,
		CrPoweredByModule,
		ReportAlertsContainerModule,
		ReportResultsContainerModule,
		FlexLayoutModule,
		FilterResultDailogModule,
		CrCustomTabsModule,
		CrCustomTabItemModule,
		FormsModule,
		ReactiveFormsModule,
		HttpClientModule,
	],
	providers: [ReportViewService, ReportNgTemplatesService],
})
export class DemoComponentsPageModule {}
