import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FilterCorrectionsDialogComponent } from '../../../dialogs/filter-corrections-dialog/filter-corrections-dialog.component';
import { IFilterCorrectionsDialogData } from '../../../dialogs/filter-corrections-dialog/models/filter-corrections-dialog.models';
import { ReportDataService } from '../../../services/report-data.service';
import { ReportViewService } from '../../../services/report-view.service';
import { EFilterCorrectionsDialogView } from '../../../dialogs/filter-corrections-dialog/enums/filter-corrections-dialog.enums';
import { IWritingFeedbackTypeStatistics } from '../../../models/report-data.models';

@Component({
	selector: 'cr-corrections-actions',
	templateUrl: './cr-corrections-actions.component.html',
	styleUrls: ['./cr-corrections-actions.component.scss'],
})
export class CrCorrectionsActionsComponent implements OnInit {
	/**
	 * @Input {number} The report Writing Feedback total issues.
	 */
	@Input() totalWritingFeedbackIssues: number = 0;

	/**
	 * @Input {number} The report Writing Feedback total ignored issues.
	 */
	@Input() totalIgnoredWritingFeedbackIssues: number = 2;

	/**
	 * @Input {number} The report Writing Feedback total filtered out issues.
	 */
	@Input() totalFilteredWritingFeedbackIssues: number = 3;

	@Input() writingFeedbackStats: IWritingFeedbackTypeStatistics[];

	isFilterOn: boolean = false;

	constructor(
		private _matDialog: MatDialog,
		private _reportDataSvc: ReportDataService,
		private _reportViewSvc: ReportViewService
	) {}

	ngOnInit(): void {}

	openFilterDialog(excludedView: boolean = false): void {
		this._matDialog.open(FilterCorrectionsDialogComponent, {
			maxWidth: '95%',
			width: '1050px',
			panelClass: 'filter-corrections-dailog',
			ariaLabel: $localize`Report Corrections Filter Options`,
			autoFocus: false,
			data: {
				reportViewSvc: this._reportViewSvc,
				reportDataSvc: this._reportDataSvc,
				selectedView: excludedView ? EFilterCorrectionsDialogView.Exclude : EFilterCorrectionsDialogView.Filter,
				totalCorrections: this.totalWritingFeedbackIssues,
				writingFeedbackStats: this.writingFeedbackStats,
			} as IFilterCorrectionsDialogData,
		});
	}

	clearFilter() {
		this._reportDataSvc.clearCorrectionsFilter();
	}
}
