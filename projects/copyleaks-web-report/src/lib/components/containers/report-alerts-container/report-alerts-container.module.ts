import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportAlertsContainerComponent } from './report-alerts-container.component';
import { AlertCardComponent } from './components/alert-card/alert-card.component';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
	declarations: [ReportAlertsContainerComponent, AlertCardComponent],
	imports: [CommonModule, MatIconModule, FlexLayoutModule],
	exports: [ReportAlertsContainerComponent, AlertCardComponent],
})
export class ReportAlertsContainerModule {}
