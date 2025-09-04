import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { IPaginateData, PageEvent } from './models/cr-paginator.models';

/**
 * Class representing a new design for the Copyleaks Paginator.
 */
@Component({
	selector: 'cr-paginator',
	templateUrl: './cr-paginator.component.html',
	styleUrls: ['./cr-paginator.component.scss'],
	standalone: false,
})
export class CrPaginatorComponent implements OnInit {
	/***
	 * The current selected page size
	 * @Input
	 */
	@Input() numberOfPages: number = 0;

	/***
	 * The current page index
	 * @Input
	 */
	@Input() pageIndex: number = 1;

	/**
	 * Event that fires when:
	 * 1) A new page size is selected
	 * 2) Navigation to the next or previous page
	 * @Output
	 */
	@Output() readonly page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

	offSet: number = 0; // how many entities have been loaded
	showPageSizeOptions = true; // flag for showing the page size options

	constructor() {}

	ngOnInit() {}

	ngOnChanges(changes: SimpleChanges): void {
		if ('pageIndex' in changes || 'numberOfPages' in changes) {
			this.pageIndex = this.pageIndex > this.numberOfPages ? 1 : this.pageIndex;
		}
	}

	/**
	 * Function that is called when 'previous page' button is clicked
	 * sends an event to the upper component that the previous page called
	 * @param dataOffset the total number of data has been loaded
	 */
	previous() {
		const preIndex = this.pageIndex;
		this.pageIndex--;
		this._emitPageEvent(preIndex);
	}

	/**
	 * Function that is called when 'next page' button is clicked
	 * sends an event to the upper component that the next page called
	 */
	next() {
		const preIndex = this.pageIndex;
		this.pageIndex++;
		this._emitPageEvent(preIndex);
	}

	/**
	 * Send an event to the upper component which contains data about the page size change or the current selected page
	 * @param preIndex the previous page index
	 */
	private _emitPageEvent(preIndex: number) {
		this.page.emit({
			preIndex: preIndex,
			pageIndex: this.pageIndex,
		} as IPaginateData);
	}
}
