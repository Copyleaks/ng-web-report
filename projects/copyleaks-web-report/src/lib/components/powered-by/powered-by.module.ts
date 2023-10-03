import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PoweredByComponent } from './powered-by.component';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
	declarations: [PoweredByComponent],
	imports: [CommonModule, FlexLayoutModule],
	exports: [PoweredByComponent],
})
export class PoweredByModule {}
