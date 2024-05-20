import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FilterCorrectionsDialogComponent } from '../../../dialogs/filter-corrections-dialog/filter-corrections-dialog.component';
import { IFilterCorrectionsDialogData } from '../../../dialogs/filter-corrections-dialog/models/filter-corrections-dialog.models';
import { ReportDataService } from '../../../services/report-data.service';
import { ReportViewService } from '../../../services/report-view.service';
import { EFilterCorrectionsDialogView } from '../../../dialogs/filter-corrections-dialog/enums/filter-corrections-dialog.enums';
import { ReportMatchHighlightService } from '../../../services/report-match-highlight.service';
import { IWritingFeedbackTypeStatistics } from '../../../models/report-statistics.models';

@Component({
	selector: 'cr-corrections-actions',
	templateUrl: './cr-corrections-actions.component.html',
	styleUrls: ['./cr-corrections-actions.component.scss'],
})
export class CrCorrectionsActionsComponent implements OnInit {
	/**
	 * The padding style property.
	 */
	@HostBinding('style.padding')
	paddingProp: string;

	/**
	 * The total number of writing feedback issues.
	 */
	@Input() totalWritingFeedbackIssues: number = 0;

	/**
	 * The total number of ignored writing feedback issues.
	 */
	@Input() totalIgnoredWritingFeedbackIssues: number = 0;

	/**
	 * The total number of selected writing feedback issues.
	 */
	@Input() totalSelectedWritingFeedbackIssues: number = 0;

	/**
	 * The total number of filtered writing feedback issues.
	 */
	@Input() totalFilteredWritingFeedbackIssues: number = 0;

	/**
	 * The statistics for different types of writing feedback.
	 */
	@Input() writingFeedbackStats: IWritingFeedbackTypeStatistics[];

	/**
	 * Indicates if a correction is clicked.
	 */
	@Input() correctionClicked: boolean = false;

	/**
	 * Indicates if the section should be expanded.
	 */
	@Input() expandSection: boolean = false;

	/**
	 * Indicates if the component is being viewed on a mobile device.
	 */
	@Input() isMobile: boolean = false;

	/**
	 * Indicates if the filter indicator is on.
	 */
	@Input() filterIndicatorOn: boolean = false;

	/**
	 * Indicates if the loading view should be shown.
	 */
	@Input() showLoadingView: boolean = true;

	/**
	 * Event emitter for expand toggle.
	 */
	@Output() onExpandToggle = new EventEmitter<boolean>();

	constructor(
		private _matDialog: MatDialog,
		private _reportDataSvc: ReportDataService,
		private _reportViewSvc: ReportViewService,
		private _highlightService: ReportMatchHighlightService
	) {}

	ngOnInit(): void {}

	/**
	 * Opens the filter dialog.
	 * @param excludedView Indicates if the excluded view is selected.
	 */
	openFilterDialog(excludedView: boolean = false, event?: KeyboardEvent): void {
		if (!event || event.key === 'Enter') {
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
					totalFilteredCorrections: this.totalFilteredWritingFeedbackIssues,
					writingFeedbackStats: this.writingFeedbackStats,
				} as IFilterCorrectionsDialogData,
			});
		}
	}

	/**
	 * Clears the filter.
	 */
	clearFilter() {
		this._reportDataSvc.clearCorrectionsFilter();
	}

	/**
	 * Deselects the match.
	 */
	deselectMatch() {
		this._highlightService.clearAllMatchs();
	}

	/**
	 * Toggles the expand state of the results section.
	 */
	expandResultsSection() {
		this.expandSection = !this.expandSection;
		this.onExpandToggle.emit(this.expandSection);
		if (this.expandSection) this.paddingProp = '8px 8px 0px 8px';
		else this.paddingProp = '8px 8px 8px 8px';
	}
}
