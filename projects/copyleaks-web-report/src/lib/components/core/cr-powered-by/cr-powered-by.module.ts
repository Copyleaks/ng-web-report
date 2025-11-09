import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrPoweredByComponent } from './cr-powered-by.component';
import { FlexLayoutModule } from 'ngx-flexible-layout';

@NgModule({
	declarations: [CrPoweredByComponent],
	imports: [CommonModule, FlexLayoutModule],
	exports: [CrPoweredByComponent],
})
export class CrPoweredByModule {}
