import { NgModule } from '@angular/core';
import { CommonModule, PercentPipe } from '@angular/common';
import { SecondsToTimePipe } from './seconds-to-time.pipe';

@NgModule({
	declarations: [SecondsToTimePipe],
	exports: [SecondsToTimePipe],
	providers: [PercentPipe],
	imports: [CommonModule],
})
export class SecondsToTimePipeModule {}
