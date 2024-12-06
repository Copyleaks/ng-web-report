import { NgModule } from '@angular/core';
import { CommonModule, PercentPipe } from '@angular/common';
import { FormaDecimalNumberPipe } from './forma-decimal-number.pipe';

@NgModule({
	declarations: [FormaDecimalNumberPipe],
	exports: [FormaDecimalNumberPipe],
	providers: [PercentPipe],
	imports: [CommonModule],
})
export class FormaDecimalPipeModule {}
