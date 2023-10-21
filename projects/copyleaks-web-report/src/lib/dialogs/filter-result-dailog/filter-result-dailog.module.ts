import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterResultDailogComponent } from './filter-result-dailog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';

@NgModule({
	declarations: [FilterResultDailogComponent],
	exports: [FilterResultDailogComponent],
	imports: [
		CommonModule,
		MatIconModule,
		FlexLayoutModule,
		MatSlideToggleModule,
		MatDividerModule,
		MatSliderModule,
		MatCheckboxModule,
		MatChipsModule,
	],
})
export class FilterResultDailogModule {}
