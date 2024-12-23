import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrAIScoreTooltipContentDirective } from './cr-ai-score-tooltip-content.directive';
import { CrAIScoreTooltipContentComponent } from './cr-ai-score-tooltip-content.component';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
	exports: [CrAIScoreTooltipContentDirective, CrAIScoreTooltipContentComponent],
	declarations: [CrAIScoreTooltipContentDirective, CrAIScoreTooltipContentComponent],
	imports: [CommonModule, FlexLayoutModule],
})
export class CrAIScoreTooltipContentModule {}
