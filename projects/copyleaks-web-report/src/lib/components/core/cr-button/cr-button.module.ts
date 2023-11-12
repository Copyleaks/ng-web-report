import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CrSpinnerModule } from '../cr-spinner/cr-spinner.module';
import { CrButtonComponent } from './cr-button.component';

@NgModule({
	declarations: [CrButtonComponent],
	imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule, FlexLayoutModule, CrSpinnerModule],
	exports: [CrButtonComponent],
})
export class CrButtonModule {}
