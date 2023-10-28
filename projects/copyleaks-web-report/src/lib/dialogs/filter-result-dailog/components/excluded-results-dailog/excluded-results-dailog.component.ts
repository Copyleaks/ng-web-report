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
import { IResultItem } from 'projects/copyleaks-web-report/src/lib/components/containers/report-results-item-container/components/models/report-result-item.models';
import { untilDestroy } from 'projects/copyleaks-web-report/src/lib/utils/until-destroy';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
	selector: 'cr-excluded-results-dailog',
	templateUrl: './excluded-results-dailog.component.html',
	styleUrls: ['./excluded-results-dailog.component.scss'],
})
export class ExcludedResultsDailogComponent implements OnInit, AfterViewInit {
	@Input() allResultsItem: IResultItem[] = [];
	@Output() closeDailogEvent = new EventEmitter<boolean>();

	lastItemLoading: boolean = true;
	private _startingIndex: number = 0;
	private _pageSize: number = 10;
	private _currentPage: number = 1;

	@ViewChild('resultsContainer', { read: ElementRef }) public resultsContainer: ElementRef;

	get allResultsItemLength() {
		return this.allResultsItem?.length;
	}

	get excludedResultist() {
		if (this.allResultsItemLength > this._pageSize) {
			return this.allResultsItem.slice(this._startingIndex, this.EndingIndex);
		} else {
			return this.allResultsItem;
		}
	}

	get EndingIndex(): number {
		return this._startingIndex + this._pageSize * this._currentPage;
	}

	constructor(private _renderer: Renderer2) {}

	ngOnInit() {}

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
		if (scrollLocation > scrollDownLimit && this.EndingIndex < this.allResultsItemLength) {
			this._currentPage += 1;
			this.scrollTo(tableScrollHeight / 2 + tableViewHeight);
		}
		if (this.EndingIndex >= this.allResultsItemLength) {
			this.lastItemLoading = false;
		}
	}

	private scrollTo(position: number): void {
		this._renderer.setProperty(this.resultsContainer.nativeElement, 'scrollTop', position);
	}

	closeDailog() {
		this.closeDailogEvent.emit(true);
	}

	includeAllButton() {}

	ngOnDestroy() {}
}
