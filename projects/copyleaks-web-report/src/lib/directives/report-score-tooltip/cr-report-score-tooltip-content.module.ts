import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrReportScoreTooltipContentComponent } from './cr-report-score-tooltip-content.component';
import { SimilarityPipeModule } from '../../pipes/similarity-pipe/similarity-pipe.module';
import { ReportScoreTooltipDirective } from './report-score-tooltip.directive';

@NgModule({
	declarations: [CrReportScoreTooltipContentComponent, ReportScoreTooltipDirective],
	imports: [CommonModule, SimilarityPipeModule],
	exports: [CrReportScoreTooltipContentComponent, ReportScoreTooltipDirective],
})
export class CrReportScoreTooltipModule {}
