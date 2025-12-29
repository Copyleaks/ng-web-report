import { Component, Inject, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { untilDestroy } from '../../utils/until-destroy';
import { EResponsiveLayoutType } from '../../enums/copyleaks-web-report.enums';
import { IFilterAiPhrasesDialogData } from './models/filter-ai-phrases-dialog.models';

@Component({
	selector: 'cr-filter-ai-phrases-dialog',
	templateUrl: './filter-ai-phrases-dialog.component.html',
	styleUrls: ['./filter-ai-phrases-dialog.component.scss'],
	standalone: false,
})
export class FilterAiPhrasesDialogComponent implements OnInit {
	isMobile: boolean = false;
	docDirection: 'ltr' | 'rtl';

	// AI Phrases filter properties
	filteredCount: number = 0;
	totalCount: number = 0;
	selectedValue: number = 0;

	@Output() onChange = new EventEmitter<number>();

	// Slider configuration
	minValue: number = 0;
	maxValue: number = 100;
	stepValue: number = 1;

	constructor(
		private _dialogRef: MatDialogRef<FilterAiPhrasesDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: IFilterAiPhrasesDialogData
	) {
		// Initialize values from data or use defaults
		this.minValue = data.minProportion ?? 0;
		this.maxValue = data.maxProportion ?? 100;
		this.totalCount = data.totalCount ?? 0;
		this.filteredCount = data.filteredCount ?? this.totalCount;
		this.selectedValue = data.currentFilter ?? this.minValue;
	}
	ngOnInit() {
		this.data.reportViewSvc?.reportResponsiveMode$.pipe(untilDestroy(this)).subscribe(view => {
			this.isMobile = view.mode === EResponsiveLayoutType.Mobile;
		});

		this.data.reportViewSvc?.documentDirection$.pipe(untilDestroy(this)).subscribe(dir => {
			this.docDirection = dir;
		});
	}

	onSliderChange(change: number | string) {
		this.selectedValue = +change;
		this.onChange.emit(+change);
	}

	onClearFilter() {
		this.selectedValue = this.minValue;
		this.filteredCount = this.totalCount;
	}

	onDiscardChanges() {
		this._dialogRef.close();
	}

	onSaveChanges() {
		// Update filter options with new minAIProportion value
		const currentOptions = this.data.reportDataSvc.filterOptions ?? {};
		this.data.reportDataSvc.filterOptions$.next({
			...currentOptions,
			minAIProportion: this.selectedValue,
		});

		this._dialogRef.close();
	}

	ngOnDestroy() {}
}
