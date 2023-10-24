import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportTabsContainerComponent } from './report-tabs-container.component';
import { CrReportScoreTooltipModule } from '../../../directives/report-score-tooltip/cr-report-score-tooltip-content.module';

@NgModule({
	declarations: [ReportTabsContainerComponent],
	imports: [CommonModule, CrReportScoreTooltipModule],
	exports: [ReportTabsContainerComponent],
})
export class ReportTabsContainerModule {}
