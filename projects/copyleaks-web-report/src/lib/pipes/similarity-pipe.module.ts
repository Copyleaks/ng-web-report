import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimilarityPipe } from './similarity.pipe';

@NgModule({
	declarations: [SimilarityPipe],
	exports: [SimilarityPipe],
	providers: [SimilarityPipe],
	imports: [CommonModule],
})
export class SimilarityPipeModule {}
