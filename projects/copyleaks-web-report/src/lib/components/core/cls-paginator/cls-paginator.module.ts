import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClsPaginatorComponent } from './cls-paginator.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
	declarations: [ClsPaginatorComponent],
	imports: [
		CommonModule,
		FormsModule,
		FlexLayoutModule,
		MatFormFieldModule,
		MatSelectModule,
		MatButtonModule,
		MatIconModule,
	],
	exports: [ClsPaginatorComponent],
})
export class ClsPaginatorModule {}
