import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrPaginatorComponent } from './cr-paginator.component';
import { FlexLayoutModule } from 'ngx-flexible-layout';
import { FormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

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
