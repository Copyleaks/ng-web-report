import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrPaginatorComponent } from './cr-paginator.component';
import { FlexLayoutModule } from 'ngx-flexible-layout';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
	declarations: [CrPaginatorComponent],
	imports: [
		CommonModule,
		FormsModule,
		FlexLayoutModule,
		MatFormFieldModule,
		MatSelectModule,
		MatButtonModule,
		MatTooltipModule,
		MatIconModule,
	],
	exports: [CrPaginatorComponent],
})
export class CrPaginatorModule {}
