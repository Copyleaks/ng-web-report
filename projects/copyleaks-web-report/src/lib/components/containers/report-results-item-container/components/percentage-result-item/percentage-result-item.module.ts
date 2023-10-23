import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PercentageResultItemComponent } from './percentage-result-item.component';
import { SimilarityPipeModule } from 'projects/copyleaks-web-report/src/lib/pipes/similarity-pipe.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { CrReportScoreTooltipModule } from 'projects/copyleaks-web-report/src/lib/directives/report-score-tooltip/cr-report-score-tooltip-content.module';

@NgModule({
	declarations: [PercentageResultItemComponent],
	exports: [PercentageResultItemComponent],
	imports: [CommonModule, SimilarityPipeModule, MatIconModule, FlexLayoutModule, CrReportScoreTooltipModule],
})
export class PercentageResultItemModule {}
