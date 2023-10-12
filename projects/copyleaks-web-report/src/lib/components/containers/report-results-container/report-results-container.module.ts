import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportResultsContainerComponent } from './report-results-container.component';
import { ResultsActionsComponent } from './components/results-actions/results-actions.component';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
	declarations: [ReportResultsContainerComponent, ResultsActionsComponent],
	imports: [CommonModule, MatIconModule, FlexLayoutModule],
	exports: [ReportResultsContainerComponent, ResultsActionsComponent],
})
export class ReportResultsContainerModule {}
