import { Component, EventEmitter, HostBinding, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { IResultsActions } from './models/results-actions.models';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { FilterResultDailogComponent } from 'projects/copyleaks-web-report/src/lib/dialogs/filter-result-dailog/filter-result-dailog.component';
import { ReportDataService } from 'projects/copyleaks-web-report/src/lib/services/report-data.service';
import { IFilterResultDailogData } from 'projects/copyleaks-web-report/src/lib/dialogs/filter-result-dailog/models/filter-result-dailog.enum';
import { ReportViewService } from 'projects/copyleaks-web-report/src/lib/services/report-view.service';

@Component({
	selector: 'cr-results-actions',
	templateUrl: './results-actions.component.html',
	styleUrls: ['./results-actions.component.scss'],
})
export class ResultsActionsComponent implements OnInit, OnChanges {
	@HostBinding('style.padding')
	paddingProp: string;

	@Input() resultsActions: IResultsActions | null;
	@Input() searchedValue: string | null = null;
	@Input() isMobile: boolean = false;
	@Input() hideTotal: boolean = false;

	/**
	 * @Input {boolean} Flag indicating whether to show the loading view or not.
	 */
	@Input() showLoadingView: boolean = false;

	/**
	 * @Input {boolean} Flag indicating whether to show the loading view or not.
	 */
	@Input() expandSection: boolean = false;

	@Output() onSearch = new EventEmitter<string>();
	@Output() onExpandToggle = new EventEmitter<boolean>();

	searchFc = new FormControl('');
	showSearchFiled: boolean = false;

	constructor(
		private _matDialog: MatDialog,
		private _reportDataSvc: ReportDataService,
		private _reportViewSvc: ReportViewService
	) {}

	ngOnInit(): void {
		this.searchFc.valueChanges.pipe(debounceTime(500)).subscribe(value => {
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

	expandResultsSection() {
		this.expandSection = !this.expandSection;
		this.onExpandToggle.emit(this.expandSection);
		if (this.expandSection) this.paddingProp = '8px 8px 0px 8px';
		else this.paddingProp = '8px 8px 8px 8px';
	}

	showFilterDialog(showExcludedDailog: boolean = false) {
		this._matDialog.open(FilterResultDailogComponent, {
			width: '670px',
			panelClass: 'filter-result-dailog',
			data: {
				reportDataSvc: this._reportDataSvc,
				reportViewSvc: this._reportViewSvc,
				showExcludedDailog: showExcludedDailog,
			} as IFilterResultDailogData,
		});
	}
}
