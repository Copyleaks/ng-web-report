import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportTabsContainerComponent } from './report-tabs-container.component';
import { CrReportScoreTooltipModule } from '../../../directives/report-score-tooltip/cr-report-score-tooltip-content.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@NgModule({
	declarations: [ReportTabsContainerComponent],
	imports: [CommonModule, CrReportScoreTooltipModule, NgxSkeletonLoaderModule],
	exports: [ReportTabsContainerComponent],
})
export class ReportTabsContainerModule {}
