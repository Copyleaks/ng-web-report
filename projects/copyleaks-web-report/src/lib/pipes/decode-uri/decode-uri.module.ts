import { NgModule } from '@angular/core';
import { CommonModule, PercentPipe } from '@angular/common';
import { DecodeUriPipe } from './decode-uri.pipe';

@NgModule({
	declarations: [DecodeUriPipe],
	exports: [DecodeUriPipe],
	providers: [PercentPipe],
	imports: [CommonModule],
})
export class DecodeUriPipeModule {}
