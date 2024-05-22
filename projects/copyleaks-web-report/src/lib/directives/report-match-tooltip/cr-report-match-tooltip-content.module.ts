import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SimilarityPipeModule } from '../../pipes/similarity-pipe/similarity-pipe.module';
import { CrReportMatchTooltipContentComponent } from './cr-report-match-tooltip-content.component';
import { CrReportMatchTooltipDirective } from './cr-report-match-tooltip.directive';

@NgModule({
	declarations: [CrReportMatchTooltipContentComponent, CrReportMatchTooltipDirective],
	imports: [CommonModule, SimilarityPipeModule],
	exports: [CrReportMatchTooltipContentComponent, CrReportMatchTooltipDirective],
})
export class CrReportMatchTooltipModule {}
