import {
	Component,
	EventEmitter,
	HostBinding,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges,
} from '@angular/core';
import { IResultsActions } from './models/results-actions.models';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { FilterResultDailogComponent } from '../../../../../dialogs/filter-result-dailog/filter-result-dailog.component';
import { ReportDataService } from '../../../../../services/report-data.service';
import { IFilterResultDailogData } from '../../../../../dialogs/filter-result-dailog/models/filter-result-dailog.enum';
import { ReportViewService } from '../../../../../services/report-view.service';
import { ReportMatchHighlightService } from '../../../../../services/report-match-highlight.service';
import { untilDestroy } from '../../../../../utils/until-destroy';

@Component({
	selector: 'cr-results-actions',
	templateUrl: './results-actions.component.html',
	styleUrls: ['./results-actions.component.scss'],
})
export class ResultsActionsComponent implements OnInit, OnChanges, OnDestroy {
	@HostBinding('style.padding')
	paddingProp: string;

	@HostBinding('style.justify-content')
	justifyContent = 'center';

	@HostBinding('style.border-bottom')
	borderBottom: string;

	@Input() resultsActions: IResultsActions | null;
	@Input() searchedValue: string | null = null;
	@Input() isMobile: boolean = false;
	@Input() hideTotal: boolean = false;
	@Input() isFilterOn: boolean = false;

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
	loadingResults: boolean;

	constructor(
		private _matDialog: MatDialog,
		private _reportDataSvc: ReportDataService,
		private _reportViewSvc: ReportViewService,
		private _highlightService: ReportMatchHighlightService
	) {}

	ngOnInit(): void {
		this.searchFc.valueChanges.pipe(untilDestroy(this)).subscribe(value => {
			this.onSearch.emit(value);
		});

		this._reportDataSvc.loadingMoreResults$.pipe(untilDestroy(this)).subscribe(value => {
			this.loadingResults = value;
		});
	}

	ngOnChanges(changes: SimpleChanges): void {
		if ('searchedValue' in changes) this.searchFc.setValue(changes['searchedValue'].currentValue);
		if ('isMobile' in changes && changes['isMobile'].currentValue === true) this.borderBottom = 'none';
	}

	showSearch() {
		this.showSearchFiled = !this.showSearchFiled;

		if (!this.showSearchFiled) {
			this.searchFc.setValue('');
			this.justifyContent = 'center';
		} else this.justifyContent = 'start';
	}

	expandResultsSection() {
		this.expandSection = !this.expandSection;
		this.onExpandToggle.emit(this.expandSection);
		if (this.expandSection) this.paddingProp = '8px 8px 0px 8px';
		else this.paddingProp = '8px 8px 8px 8px';
	}

	showFilterDialog(showExcludedDailog: boolean = false) {
		this._matDialog.open(FilterResultDailogComponent, {
			maxWidth: '95%',
			minWidth: this.isMobile ? '95%' : '',
			width: this.isMobile ? '' : '1010px',
			panelClass: 'filter-result-dailog',
			ariaLabel: $localize`Report Filter Options`,
			autoFocus: false,
			data: {
				reportDataSvc: this._reportDataSvc,
				reportViewSvc: this._reportViewSvc,
				highlightService: this._highlightService,
				showExcludedDailog: showExcludedDailog,
				isMobile: this.isMobile,
			} as IFilterResultDailogData,
		});
	}

	deselectMatch() {
		this._highlightService.clearAllMatchs();
	}

	clearFilter() {
		this._reportDataSvc.clearFilter();
	}

	ngOnDestroy() {}
}
