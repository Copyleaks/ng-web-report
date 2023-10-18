import { AfterViewInit, Component, ElementRef, HostBinding, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { IResultItem } from './components/models/report-result-item.models';
import { fromEvent } from 'rxjs';
import { debounceTime, take } from 'rxjs/operators';
import { EnumNavigateMobileButton } from './components/models/report-result-item.enum';
import { EResponsiveLayoutType } from '../../../enums/copyleaks-web-report.enums';
import { untilDestroy } from '../../../utils/until-destroy';

@Component({
	selector: 'copyleaks-report-results-item-container',
	templateUrl: './report-results-item-container.component.html',
	styleUrls: ['./report-results-item-container.component.scss'],
})
export class ReportResultsItemContainerComponent implements OnInit, AfterViewInit {
	@HostBinding('style.display')
	displayProp = 'flex';

	@HostBinding('style.flex-grow')
	flexGrowProp: number;
	/**
	 * @Input {number} Flex grow property - flex-grow
	 */
	@Input() flexGrow: number;
	@Input() reportResponsive: EResponsiveLayoutType;
	@Input() allResultsItem: IResultItem[] = [];
	@ViewChild('resultsContainer', { read: ElementRef }) public resultsContainer: ElementRef;
	@ViewChild('resultitem', { read: ElementRef }) public resultitem: ElementRef;

	private _startingIndex: number = 0;
	private _pageSize: number = 10;
	private _currentPage: number = 1;

	resultItemList: IResultItem[];
	lastItemLoading: boolean = true;

	isMobile: boolean;
	navigateMobileButton: EnumNavigateMobileButton;
	enumNavigateMobileButton = EnumNavigateMobileButton;
	showMatChip: boolean = true;

	get EndingIndex(): number {
		return this._startingIndex + this._pageSize * this._currentPage;
	}

	get allResultsItemLength() {
		return this.allResultsItem?.length;
	}

	constructor(private _renderer: Renderer2) {}

	ngOnInit(): void {
		if (this.flexGrow !== undefined && this.flexGrow !== null) this.flexGrowProp = this.flexGrow;
		this.isMobile = true; //this.reportResponsive == EResponsiveLayoutType.Mobile;

		if (this.allResultsItemLength > this._pageSize) {
			this.resultItemList = this.allResultsItem.slice(this._startingIndex, this.EndingIndex);
		} else {
			this.resultItemList = this.allResultsItem;
		}
		this.navigateMobileButton = EnumNavigateMobileButton.FirstButton;
	}

	ngAfterViewInit(): void {
		fromEvent(this.resultsContainer.nativeElement, 'scroll')
			.pipe(debounceTime(200))
			.subscribe((e: any) => this.onTableScroll(e));
	}

	private onTableScroll(e: any): void {
		const scrollThreshold = 200;

		if (this.isMobile) {
			const tableViewWidth = e.target.offsetWidth;
			const tableScrollWidth = e.target.scrollWidth;
			const scrollLocation = e.target.scrollLeft;
			const scrollRightLimit = tableScrollWidth - tableViewWidth - scrollThreshold;
			this.updateNavigateButton(scrollLocation);
			if (scrollLocation > scrollRightLimit && this.EndingIndex < this.allResultsItemLength) {
				this._currentPage += 1;
				this.lastItemLoading = true;
				this.resultItemList = this.allResultsItem.slice(this._startingIndex, this.EndingIndex);
				this.scrollTo(tableScrollWidth / 2 + tableViewWidth);
			}
		} else {
			const tableViewHeight = e.target.offsetHeight;
			const tableScrollHeight = e.target.scrollHeight;
			const scrollLocation = e.target.scrollTop;
			const scrollDownLimit = tableScrollHeight - tableViewHeight - scrollThreshold;
			if (scrollLocation > scrollDownLimit && this.EndingIndex < this.allResultsItemLength) {
				this._currentPage += 1;
				this.lastItemLoading = true;
				this.resultItemList = this.allResultsItem.slice(this._startingIndex, this.EndingIndex);
				this.scrollTo(tableScrollHeight / 2 + tableViewHeight);
			}
		}
		if (this.EndingIndex >= this.allResultsItemLength) {
			this.lastItemLoading = false;
		}
	}

	private scrollTo(position: number): void {
		if (this.isMobile) {
			this._renderer.setProperty(this.resultsContainer.nativeElement, 'scrollLeft', position);
		} else {
			this._renderer.setProperty(this.resultsContainer.nativeElement, 'scrollTop', position);
		}
	}

	hideResultItem() {
		this.displayProp = 'none';
	}

	//#region navigate mobile button
	navigateButton(navigateButton: EnumNavigateMobileButton) {
		const navigateNum = this.resultItemList.length / 5;
		const resultitemWidth = this.resultitem.nativeElement.offsetWidth;
		const viewWidth = resultitemWidth * navigateNum;
		switch (navigateButton) {
			case EnumNavigateMobileButton.FirstButton: {
				this.scrollTo(0);
				this.navigateMobileButton = EnumNavigateMobileButton.FirstButton;
				break;
			}
			case EnumNavigateMobileButton.SecondButton: {
				this.scrollTo(viewWidth);
				this.navigateMobileButton = EnumNavigateMobileButton.SecondButton;
				break;
			}
			case EnumNavigateMobileButton.ThirdButton: {
				this.scrollTo(viewWidth * 2);
				this.navigateMobileButton = EnumNavigateMobileButton.ThirdButton;
				break;
			}
			case EnumNavigateMobileButton.FourthButton: {
				this.scrollTo(viewWidth * 3);
				this.navigateMobileButton = EnumNavigateMobileButton.FourthButton;
				break;
			}
			case EnumNavigateMobileButton.FifthButton: {
				this.scrollTo(viewWidth * 4);
				this.navigateMobileButton = EnumNavigateMobileButton.FifthButton;
				break;
			}
			case EnumNavigateMobileButton.None: {
				this.scrollTo(this.resultsContainer.nativeElement.scrollWidth);
				this.navigateMobileButton = EnumNavigateMobileButton.None;
				break;
			}
		}
	}

	updateNavigateButton(scrollLocation: number) {
		const navigateNum = this.resultItemList.length / 5;
		const resultitemWidth = this.resultitem.nativeElement.offsetWidth;
		const viewWidth = resultitemWidth * navigateNum;
		if (0 <= scrollLocation && viewWidth > scrollLocation) {
			this.navigateMobileButton = EnumNavigateMobileButton.FirstButton;
		} else if (viewWidth <= scrollLocation && viewWidth * 2 > scrollLocation) {
			this.navigateMobileButton = EnumNavigateMobileButton.SecondButton;
		} else if (viewWidth * 2 <= scrollLocation && viewWidth * 3 > scrollLocation) {
			this.navigateMobileButton = EnumNavigateMobileButton.ThirdButton;
		} else if (viewWidth * 3 <= scrollLocation && viewWidth * 4 > scrollLocation) {
			this.navigateMobileButton = EnumNavigateMobileButton.FourthButton;
		} else if (viewWidth * 4 <= scrollLocation) {
			this.navigateMobileButton = EnumNavigateMobileButton.FifthButton;
		}
	}
	//#endregion
}
