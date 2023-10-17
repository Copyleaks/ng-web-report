import { NgModule } from '@angular/core';
import { CommonModule, PercentPipe } from '@angular/common';
import { SimilarityPipe } from './similarity.pipe';

@NgModule({
	declarations: [SimilarityPipe],
	exports: [SimilarityPipe],
	providers: [PercentPipe],
	imports: [CommonModule],
})
export class SimilarityPipeModule {}
