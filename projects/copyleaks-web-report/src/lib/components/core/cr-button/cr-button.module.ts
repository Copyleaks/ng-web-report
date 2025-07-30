import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { FlexLayoutModule } from 'ngx-flexible-layout';
import { CrSpinnerModule } from '../cr-spinner/cr-spinner.module';
import { CrButtonComponent } from './cr-button.component';

@NgModule({
	declarations: [CrButtonComponent],
	imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule, FlexLayoutModule, CrSpinnerModule],
	exports: [CrButtonComponent],
})
export class CrButtonModule {}
