import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportResultsContainerComponent } from './report-results-container.component';
import { ResultsActionsComponent } from './components/results-actions/results-actions.component';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EmptyResultStateComponent } from './components/empty-result-state/empty-result-state.component';

@NgModule({
	declarations: [ReportResultsContainerComponent, ResultsActionsComponent, EmptyResultStateComponent],
	imports: [CommonModule, MatIconModule, FlexLayoutModule],
	exports: [ReportResultsContainerComponent, ResultsActionsComponent, EmptyResultStateComponent],
})
export class ReportResultsContainerModule {}
