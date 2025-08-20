import {
	AfterViewInit,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnInit,
	Output,
	Renderer2,
	ViewChild,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { fromEvent } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';
import { IResultItem } from '../../../../components/containers/report-results-item-container/components/models/report-result-item.models';
import { ReportDataService } from '../../../../services/report-data.service';
import { ReportViewService } from '../../../../services/report-view.service';
import { ReportMatchHighlightService } from '../../../../services/report-match-highlight.service';
import { untilDestroy } from '../../../../utils/until-destroy';

@Component({
    selector: 'cr-excluded-results-dailog',
    templateUrl: './excluded-results-dailog.component.html',
    styleUrls: ['./excluded-results-dailog.component.scss'],
    standalone: false
})
export class ExcludedResultsDailogComponent implements OnInit, AfterViewInit {
	/**
	 * @Input {IResultItem[]} List of all result items to be displayed in the dialog
	 */
	@Input() allResultsItem: IResultItem[] = [];

	/**
	 * @Input {ReportDataService} Service for accessing and managing report data
	 */
	@Input() reportDataSvc: ReportDataService;

	/**
	 * @Input {ReportViewService} Service for controlling report view behavior and state
	 */
	@Input() reportViewSvc: ReportViewService;

	/**
	 * @Input {ReportMatchHighlightService} Service responsible for handling result text highlighting
	 */
	@Input() highlightService: ReportMatchHighlightService;

	/**
	 * @Output {EventEmitter<boolean>} Emits a boolean when the dialog is closed (true if confirmed, false if cancelled)
	 */
	@Output() closeDailogEvent = new EventEmitter<boolean>();

	filteredList: IResultItem[];
	searchControl = new UntypedFormControl('');

	private _startingIndex: number = 0;
	private _pageSize: number = 10;
	private _currentPage: number = 1;

	@ViewChild('resultsContainer', { read: ElementRef }) public resultsContainer: ElementRef;

	get searchValue() {
		return this.searchControl.value;
	}

	get allResultsItemLength() {
		return this.allResultsItem?.length;
	}

	get filteredListLength() {
		return this.filteredList?.length;
	}

	get excludedResultist() {
		if (this.filteredListLength > this._pageSize) {
			return this.filteredList.slice(this._startingIndex, this.EndingIndex);
		} else {
			return this.filteredList;
		}
	}

	get EndingIndex(): number {
		return this._startingIndex + this._pageSize * this._currentPage;
	}

	get lastItemLoading() {
		if (this.EndingIndex >= this.filteredListLength || this.filteredListLength == 0) {
			return false;
		} else {
			return true;
		}
	}

	get allResultsIncluded(): boolean {
		return this.reportDataSvc.excludedResultsIds?.length === 0;
	}

	constructor(private _renderer: Renderer2) {}

	ngOnInit() {
		this.searchControl.valueChanges.pipe(untilDestroy(this), startWith('')).subscribe(value => {
			this.filteredList = this._filterTags(value || '');
		});
	}

	ngAfterViewInit(): void {
		fromEvent(this.resultsContainer.nativeElement, 'scroll')
			.pipe(debounceTime(200), untilDestroy(this))
			.subscribe((e: any) => this.onTableScroll(e));
	}

	private onTableScroll(e: any) {
		const tableViewHeight = e.target.offsetHeight;
		const tableScrollHeight = e.target.scrollHeight;
		const scrollLocation = e.target.scrollTop;
		const scrollThreshold = 200;
		const scrollDownLimit = tableScrollHeight - tableViewHeight - scrollThreshold;
		if (scrollLocation > scrollDownLimit && this.EndingIndex < this.filteredListLength) {
			this._currentPage += 1;
			this.scrollTo(tableScrollHeight / 2 + tableViewHeight);
		}
	}

	private scrollTo(position: number): void {
		this._renderer.setProperty(this.resultsContainer.nativeElement, 'scrollTop', position);
	}

	private _filterTags(value: string) {
		return this.allResultsItem.filter(
			result =>
				result?.resultPreview?.title?.toLowerCase().includes(value?.toLowerCase()) ||
				result?.resultPreview?.metadata?.filename?.toLowerCase()?.includes(value?.toLowerCase())
		);
	}

	closeDailog() {
		this.closeDailogEvent.emit(true);
	}

	clearSearch() {
		this.searchControl.setValue('');
	}

	includeAllButtonToggle() {
		// if all the results are already excluded, then don't do anything
		if (this.allResultsIncluded)
			this.reportDataSvc.excludedResultsIds$.next(this.filteredList?.map(result => result?.resultPreview?.id) ?? []);
		else this.reportDataSvc.excludedResultsIds$.next([]);
	}

	isResultExcluded(id?: string): boolean {
		return this.reportDataSvc.excludedResultsIds?.find(resultId => resultId === id) != undefined;
	}

	includeResultById(resultId: string) {
		const excludedResutsIds = this.reportDataSvc.excludedResultsIds ?? [];
		this.reportDataSvc.excludedResultsIds$.next(excludedResutsIds.filter(id => id != resultId));
	}

	excludeResultById(resultId: string) {
		const excludedResutsIds = new Set(this.reportDataSvc.excludedResultsIds);
		excludedResutsIds.add(resultId);
		this.reportDataSvc.excludedResultsIds$.next(Array.from(excludedResutsIds));
	}

	ngOnDestroy() {}
}
