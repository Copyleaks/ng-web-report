import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IFilterCorrectionsDialogData } from './models/filter-corrections-dialog.models';
import { EFilterCorrectionsDialogView } from './enums/filter-corrections-dialog.enums';
import { IWritingFeedbackCorrectionViewModel, IWritingFeedbackTypeStatistics } from '../../models/report-data.models';
import { untilDestroy } from '../../utils/until-destroy';
import { EResponsiveLayoutType } from '../../enums/copyleaks-web-report.enums';
import { FilterCorrectionsDialogService } from './services/filter-corrections-dialog.service';
import { FormControl, FormGroup } from '@angular/forms';
import { startWith } from 'rxjs/operators';
import { getCorrectionCategoryDescription, getCorrectionCategoryTitle } from '../../utils/enums-helpers';

@Component({
	selector: 'cr-filter-corrections-dialog',
	templateUrl: './filter-corrections-dialog.component.html',
	styleUrls: ['./filter-corrections-dialog.component.scss'],
})
export class FilterCorrectionsDialogComponent implements OnInit, OnDestroy {
	isMobile: boolean;
	selectedView: EFilterCorrectionsDialogView = EFilterCorrectionsDialogView.Filter;
	EFilterCorrectionsDialogView = EFilterCorrectionsDialogView;

	excludedCorrections: IWritingFeedbackCorrectionViewModel[] = [];
	searchedExcludedCorrections: IWritingFeedbackCorrectionViewModel[] = [];
	writingFeedbackStats: IWritingFeedbackTypeStatistics[];

	filterCorrectionsForm: FormGroup;
	totalExcludedCorrections: number = 0;
	categoriesKeys: string[];
	allIncluded: boolean;
	totalCorrections: number = 0;
	totalFilteredCorrections: number = 0;
	searchControl = new FormControl('');

	constructor(
		private _filterCorrectionsSvc: FilterCorrectionsDialogService,
		private _dialogRef: MatDialogRef<FilterCorrectionsDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: IFilterCorrectionsDialogData
	) {}

	ngOnInit(): void {
		if (this.data?.reportViewSvc)
			this.data.reportViewSvc.reportResponsiveMode$.pipe(untilDestroy(this)).subscribe(view => {
				this.isMobile = view.mode === EResponsiveLayoutType.Mobile;
			});

		this.selectedView = this.data.selectedView ?? EFilterCorrectionsDialogView.Filter;
		if (this.selectedView === EFilterCorrectionsDialogView.Exclude)
			this._dialogRef.addPanelClass('excluded-corrections-dialog');

		this.totalCorrections = this.data.totalCorrections ?? 0;
		this.totalFilteredCorrections = this.data.totalFilteredCorrections ?? 0;
		this.writingFeedbackStats = this.data.writingFeedbackStats;

		this.excludedCorrections = this.searchedExcludedCorrections = this.data?.reportDataSvc.excludedCorrections;
		this.data?.reportDataSvc.excludedCorrections$.pipe(untilDestroy(this)).subscribe(excludedCorrections => {
			this.totalExcludedCorrections = (excludedCorrections ?? []).length;
			this.allIncluded = excludedCorrections?.length !== (this.excludedCorrections ?? []).length;
		});

		const hiddenCategories = this.data?.reportDataSvc?.filterOptions?.writingFeedback?.hiddenCategories ?? [];
		this._filterCorrectionsSvc.initForm(hiddenCategories, this.writingFeedbackStats);
		this.filterCorrectionsForm = this._filterCorrectionsSvc.filterCorrectionsForm;
		this.categoriesKeys = Object.keys(this._filterCorrectionsSvc.filterCorrectionsForm?.controls);

		this.searchControl.valueChanges.pipe(untilDestroy(this), startWith('')).subscribe(value => {
			this.searchedExcludedCorrections = this._searchCorrections(value || '');
		});
	}

	onClearFilter(): void {
		this._filterCorrectionsSvc.clearFilter();
	}

	onDiscardChanges(): void {
		this._dialogRef.close();
	}

	onSaveChanges(): void {
		const selectedCategories = this._filterCorrectionsSvc.onSubmit();
		this.data.reportDataSvc.filterOptions$.next({
			...this.data.reportDataSvc.filterOptions,
			writingFeedback: {
				hiddenCategories: selectedCategories,
			},
		});
		this._dialogRef.close();
	}

	viewExcludedDialog() {
		this.selectedView = EFilterCorrectionsDialogView.Exclude;
		this._dialogRef.addPanelClass('excluded-corrections-dialog');
	}

	onCloseExecludedView() {
		this.selectedView = EFilterCorrectionsDialogView.Filter;
		this._dialogRef.removePanelClass('excluded-corrections-dialog');
	}

	formatCategroyFormControlKey(key: string): string {
		const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
		return formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1);
	}

	includeAllToggle() {
		if (!this.allIncluded) this.data.reportDataSvc.excludedCorrections$.next([]);
		else this.data.reportDataSvc.excludedCorrections$.next(this.excludedCorrections);
	}

	private _searchCorrections(searchValue: string): IWritingFeedbackCorrectionViewModel[] {
		if (!searchValue || searchValue === '') return this.excludedCorrections;

		searchValue = searchValue.toLowerCase();

		return this.excludedCorrections.filter(
			ec =>
				ec.correctionText?.toLowerCase().includes(searchValue) ||
				ec.wrongText?.toLowerCase().includes(searchValue) ||
				getCorrectionCategoryTitle(ec.type)?.toLowerCase()?.includes(searchValue) ||
				getCorrectionCategoryDescription(ec.type)?.toLowerCase()?.includes(searchValue)
		);
	}

	ngOnDestroy(): void {}
}
