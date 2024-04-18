import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SimilarityPipeModule } from '../../pipes/similarity-pipe/similarity-pipe.module';
import { CrReportMatchTooltipContentComponent } from './cr-report-match-tooltip-content.component';
import { ReportMatchTooltipDirective } from './report-match-tooltip.directive';

@NgModule({
	declarations: [CrReportMatchTooltipContentComponent, ReportMatchTooltipDirective],
	imports: [CommonModule, SimilarityPipeModule],
	exports: [CrReportMatchTooltipContentComponent, ReportMatchTooltipDirective],
})
export class CrReportMatchTooltipModule {}
