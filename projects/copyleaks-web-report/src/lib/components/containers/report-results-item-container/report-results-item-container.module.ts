import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportResultsItemContainerComponent } from './report-results-item-container.component';
import { ReportResultsItemComponent } from './components/report-results-item/report-results-item.component';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { SimilarityPipeModule } from '../../../pipes/similarity-pipe.module';
import { PercentageResultItemComponent } from './components/percentage-result-item/percentage-result-item.component';
import { ReportExpandResultItemComponent } from './components/report-expand-result-item/report-expand-result-item.component';
import { MatChipsModule } from '@angular/material/chips';
import { LockResultItemComponent } from './components/lock-result-item/lock-result-item.component';
import { PercentageResultItemModule } from './components/percentage-result-item/percentage-result-item.module';

@NgModule({
	declarations: [
		ReportResultsItemContainerComponent,
		ReportResultsItemComponent,
		ReportExpandResultItemComponent,
		LockResultItemComponent,
	],
	exports: [
		ReportResultsItemContainerComponent,
		ReportResultsItemComponent,
		ReportExpandResultItemComponent,
		LockResultItemComponent,
	],
	imports: [
		CommonModule,
		MatIconModule,
		FlexLayoutModule,
		MatMenuModule,
		MatButtonModule,
		NgxSkeletonLoaderModule,
		MatChipsModule,
		PercentageResultItemModule,
	],
})
export class ReportResultsItemContainerModule {}
