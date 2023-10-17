import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterResultDailogComponent } from './filter-result-dailog.component';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
	declarations: [FilterResultDailogComponent],
	exports: [FilterResultDailogComponent],
	imports: [CommonModule, MatIconModule, FlexLayoutModule],
})
export class FilterResultDailogModule {}
