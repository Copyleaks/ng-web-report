import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportResultsItemContainerComponent } from './report-results-item-container.component';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatChipsModule } from '@angular/material/chips';
import { PercentageResultItemModule } from './components/percentage-result-item/percentage-result-item.module';
import { ReportExpandResultItemComponent } from './components/report-expand-result-item/report-expand-result-item.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CrButtonModule } from '../../core/cr-button/cr-button.module';

@NgModule({
	declarations: [ReportResultsItemContainerComponent, ReportExpandResultItemComponent],
	exports: [ReportResultsItemContainerComponent, ReportExpandResultItemComponent],
	imports: [
		CommonModule,
		MatIconModule,
		FlexLayoutModule,
		MatMenuModule,
		MatButtonModule,
		NgxSkeletonLoaderModule,
		MatChipsModule,
		MatTooltipModule,
		PercentageResultItemModule,
		CrButtonModule,
	],
})
export class ReportResultsItemContainerModule {}
