import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CrButtonModule } from 'projects/copyleaks-web-report/src/lib/components/core/cr-button/cr-button.module';
import { DemoCustomResultsBoxItemComponent } from './demo-custom-results-box-item.component';

@NgModule({
	declarations: [DemoCustomResultsBoxItemComponent],
	imports: [
		CommonModule,
		MatSidenavModule,
		MatToolbarModule,
		MatButtonModule,
		MatIconModule,
		RouterModule,
		MatListModule,
		MatMenuModule,
		CrButtonModule,
		MatTooltipModule,
	],
	exports: [DemoCustomResultsBoxItemComponent],
})
export class DemoCustomResultsBoxItemModule {}
