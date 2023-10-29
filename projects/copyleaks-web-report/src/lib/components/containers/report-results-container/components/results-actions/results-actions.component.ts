import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { IResultsActions } from './models/results-actions.models';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { FilterResultDailogComponent } from 'projects/copyleaks-web-report/src/lib/dialogs/filter-result-dailog/filter-result-dailog.component';

@Component({
	selector: 'cr-results-actions',
	templateUrl: './results-actions.component.html',
	styleUrls: ['./results-actions.component.scss'],
})
export class ResultsActionsComponent implements OnInit, OnChanges {
	@Input() resultsActions: IResultsActions | null;
	@Input() searchedValue: string | null = null;

	@Output() onSearch = new EventEmitter<string>();
	searchFc = new FormControl('');
	showSearchFiled: boolean = false;

	constructor(private _matDialog: MatDialog) {}

	ngOnInit(): void {
		this.searchFc.valueChanges.pipe(debounceTime(1000)).subscribe(value => {
			this.onSearch.emit(value);
		});
	}

	ngOnChanges(changes: SimpleChanges): void {
		if ('searchedValue' in changes) this.searchFc.setValue(changes['searchedValue'].currentValue);
	}

	showSearch() {
		this.showSearchFiled = !this.showSearchFiled;

		if (!this.showSearchFiled) this.searchFc.setValue('');
	}

	startSearch() {}

	showFilterDialog() {
		this._matDialog.open(FilterResultDailogComponent, {
			width: '670px',
			panelClass: 'filter-result-dailog',
		});
	}
}
