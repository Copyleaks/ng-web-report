import { AfterViewInit, Component, ElementRef, HostBinding, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { IResultItem } from './components/models/report-result-item.models';
import { fromEvent } from 'rxjs';
import { debounceTime, take } from 'rxjs/operators';
import { ReportViewService } from '../../../services/report-view.service';
import { EnumNavigateMobileButton } from './components/models/report-result-item.enum';
import { EResponsiveLayoutType } from '../../../enums/copyleaks-web-report.enums';

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
		this.isMobile = this.reportResponsive == EResponsiveLayoutType.Mobile;

		if (this.allResultsItemLength > this._pageSize) {
			this.resultItemList = this.allResultsItem.slice(this._startingIndex, this.EndingIndex);
		} else {
			this.resultItemList = this.allResultsItem;
		}
	}

	ngAfterViewInit(): void {
		fromEvent(this.resultsContainer.nativeElement, 'scroll')
			.pipe(debounceTime(500))
			.subscribe((e: any) => this.onTableScroll(e));
	}

	private onTableScroll(e: any): void {
		const scrollThreshold = 200;

		if (this.isMobile) {
			const tableViewWidth = e.target.offsetWidth;
			const tableScrollWidth = e.target.scrollWidth;
			const scrollLocation = e.target.scrollLeft;
			const scrollRightLimit = tableScrollWidth - tableViewWidth - scrollThreshold;
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
	firstButton() {
		this.scrollTo(0);
		this.navigateMobileButton = EnumNavigateMobileButton.FirstButton;
	}
	secondButton() {
		this.scrollTo(313);
		console.log(this.resultsContainer.nativeElement.offsetWidth);

		this.navigateMobileButton = EnumNavigateMobileButton.SecondButton;
	}
	thirdButton() {
		this.scrollTo(this.resultsContainer.nativeElement.offsetWidth * 2);
		this.navigateMobileButton = EnumNavigateMobileButton.ThirdButton;
	}
	fourthButton() {
		this.scrollTo(this.resultsContainer.nativeElement.offsetWidth * 3);
		this.navigateMobileButton = EnumNavigateMobileButton.FourthButton;
	}
	fifthButton() {
		this.scrollTo(this.resultsContainer.nativeElement.offsetWidth * 4);
		this.navigateMobileButton = EnumNavigateMobileButton.FifthButton;
	}

	matChipButton() {
		this.scrollTo(this.resultsContainer.nativeElement.scrollWidth);
		this.navigateMobileButton = EnumNavigateMobileButton.None;
	}
	//#endregion
}
