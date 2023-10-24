import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { LockResultItemComponent } from '../report-results-item-container/components/lock-result-item/lock-result-item.component';
import { PercentageResultItemModule } from '../report-results-item-container/components/percentage-result-item/percentage-result-item.module';
import { ReportResultsItemComponent } from '../report-results-item-container/components/report-results-item/report-results-item.component';
import { EmptyResultStateComponent } from './components/empty-result-state/empty-result-state.component';
import { ResultsActionsComponent } from './components/results-actions/results-actions.component';
import { ReportResultsContainerComponent } from './report-results-container.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
	declarations: [
		ReportResultsContainerComponent,
		ResultsActionsComponent,
		EmptyResultStateComponent,
		ReportResultsItemComponent,
		LockResultItemComponent,
	],
	imports: [
		CommonModule,
		MatIconModule,
		FlexLayoutModule,
		MatChipsModule,
		MatMenuModule,
		MatInputModule,
		MatButtonModule,
		NgxSkeletonLoaderModule,
		PercentageResultItemModule,
		FormsModule,
		MatFormFieldModule,
		ReactiveFormsModule,
	],
	exports: [
		ReportResultsContainerComponent,
		ResultsActionsComponent,
		EmptyResultStateComponent,
		ReportResultsItemComponent,
		LockResultItemComponent,
	],
})
export class ReportResultsContainerModule {}
