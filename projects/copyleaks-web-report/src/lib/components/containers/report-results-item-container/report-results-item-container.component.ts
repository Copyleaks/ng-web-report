import { AfterViewInit, Component, ElementRef, HostBinding, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { IResultItem } from './components/models/report-result-item.models';
import { fromEvent } from 'rxjs';
import { debounceTime, take } from 'rxjs/operators';
import { ReportViewService } from '../../../services/report-view.service';
import { EnumNavigateMobileButton } from './components/models/report-result-item.enum';

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

	@ViewChild('resultsContainer', { read: ElementRef }) public resultsContainer: ElementRef;

	private _startingIndex: number = 0;
	private _pageSize: number = 10;
	private _currentPage: number = 1;
	showList: IResultItem[] = [];
	resultItemList: IResultItem[];
	lastItemLoading: boolean = true;

	isMobile: boolean;
	navigateMobileButton: EnumNavigateMobileButton;
	enumNavigateMobileButton = EnumNavigateMobileButton;
	showMatChip: boolean = true;

	resultItem: IResultItem = {
		previewResult: {
			id: '00fe0c8338',
			introduction: 'No introduction available.',
			matchedWords: 400,
			tags: [],
			title: 'Copyleaks Internal Database',
			type: 3,
			url: 'url.com/slug/slug/123xyz..',
		},

		iStatisticsResult: {
			identical: 88,
			minorChanges: 2,
			relatedMeaning: 2,
		},
		metadataSource: {
			words: 100,
			excluded: 0,
		},
	};

	get EndingIndex(): number {
		return this._startingIndex + this._pageSize * this._currentPage;
	}

	get resultItemLength() {
		return this.showList.length;
	}

	constructor(private _reportViewService: ReportViewService, private _renderer: Renderer2) {
		let count = 0;
		while (count < 40) {
			this.showList.push({
				previewResult: {
					id: '00fe0c8338',
					introduction: 'No introduction available.',
					matchedWords: 400,
					tags: [],
					title: 'Copyleaks Internal Database ' + count,
					type: 3,
					url: 'url.com/slug/slug/123xyz..',
				},

				iStatisticsResult: {
					identical: 88,
					minorChanges: 2,
					relatedMeaning: 2,
				},
				metadataSource: {
					words: 100,
					excluded: 0,
				},
			});
			count += 1;
		}

		if (this.resultItemLength > this._pageSize) {
			this.resultItemList = this.showList.slice(this._startingIndex, this.EndingIndex);
		} else {
			this.resultItemList = this.showList;
		}
	}

	ngOnInit(): void {
		if (this.flexGrow !== undefined && this.flexGrow !== null) this.flexGrowProp = this.flexGrow;
		this.isMobile = false;
	}

	ngAfterViewInit(): void {
		fromEvent(this.resultsContainer.nativeElement, 'scroll')
			.pipe(debounceTime(500))
			.subscribe((e: any) => this.onTableScroll(e));
	}

	private onTableScroll(e: any): void {
		if (this.isMobile) {
			const tableViewWidth = e.target.offsetWidth;
			const tableScrollWidth = e.target.scrollWidth;
			const scrollLocation = e.target.scrollLeft;
			const scrollThreshold = 200;
			const scrollDownLimit = tableScrollWidth - tableViewWidth - scrollThreshold;
			if (scrollLocation > scrollDownLimit && this.EndingIndex < this.showList.length) {
				this._currentPage += 1;
				this.resultItemList = this.showList.slice(this._startingIndex, this.EndingIndex);
				this.scrollTo(tableScrollWidth / 2 + tableViewWidth);
			}
			if (this.EndingIndex >= this.showList.length) {
				this.lastItemLoading = false;
			}
		} else {
			const tableViewHeight = e.target.offsetHeight;
			const tableScrollHeight = e.target.scrollHeight;
			const scrollLocation = e.target.scrollTop;

			const scrollThreshold = 200;
			const scrollDownLimit = tableScrollHeight - tableViewHeight - scrollThreshold;
			if (scrollLocation > scrollDownLimit && this.EndingIndex < this.showList.length) {
				this._currentPage += 1;
				this.lastItemLoading = true;
				this.resultItemList = this.showList.slice(this._startingIndex, this.EndingIndex);

				this.scrollTo(tableScrollHeight / 2 + tableViewHeight);
			}
			if (this.EndingIndex >= this.showList.length) {
				this.lastItemLoading = false;
			}
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
