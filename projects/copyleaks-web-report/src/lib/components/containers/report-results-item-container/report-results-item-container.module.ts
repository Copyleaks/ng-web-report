import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportResultsItemContainerComponent } from './report-results-item-container.component';
import { ReportResultsItemComponent } from './components/report-results-item/report-results-item.component';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
	declarations: [ReportResultsItemContainerComponent, ReportResultsItemComponent],
	imports: [CommonModule, MatIconModule, FlexLayoutModule, MatMenuModule, MatButtonModule],
	exports: [ReportResultsItemContainerComponent, ReportResultsItemComponent],
})
export class ReportResultsItemContainerModule {}
