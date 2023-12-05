import {
	Component,
	ElementRef,
	HostBinding,
	Input,
	OnChanges,
	OnInit,
	ViewChild,
	SimpleChanges,
	ChangeDetectorRef,
	TemplateRef,
} from '@angular/core';
import { EResponsiveLayoutType } from '../../../enums/copyleaks-web-report.enums';
import { EnumNavigateMobileButton } from '../report-results-item-container/components/models/report-result-item.enum';
import { IResultItem } from '../report-results-item-container/components/models/report-result-item.models';
import { IResultsActions } from './components/results-actions/models/results-actions.models';
import { ReportNgTemplatesService } from '../../../services/report-ng-templates.service';
import { untilDestroy } from '../../../utils/until-destroy';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Observable, combineLatest, fromEvent } from 'rxjs';
import { map, pairwise, filter, distinctUntilChanged } from 'rxjs/operators';
import { ReportDataService } from '../../../services/report-data.service';
import { ResultDetailItem } from '../../../models/report-matches.models';
import { ICopyleaksReportOptions } from '../../../models/report-options.models';
import { ECustomResultsReportView } from '../../core/cr-custom-results/models/cr-custom-results.enums';

@Component({
	selector: 'copyleaks-report-results-container',
	templateUrl: './report-results-container.component.html',
	styleUrls: ['./report-results-container.component.scss'],
})
export class ReportResultsContainerComponent implements OnInit, OnChanges {
	@HostBinding('style.display')
	displayProp = 'flex';

	@HostBinding('style.flex-grow')
	flexGrowProp: number;
	/**
	 * @Input {number} Flex grow property - flex-grow
	 */
	@Input() flexGrow: number;
	@Input() reportResponsive: EResponsiveLayoutType;
	@Input() allResults: IResultItem[] = [];
	@Input() newResults: IResultItem[];
	@Input() resultsActions: IResultsActions;
	@Input() isMobile: boolean;
	@Input() filterOptions: ICopyleaksReportOptions;
	@Input() customResultsTemplate: TemplateRef<any> | undefined = undefined;
	@Input() reportViewMode: ECustomResultsReportView;
	/**
	 * @Input {boolean} Flag indicating whether to show the loading view or not.
	 */
	@Input() showLoadingView = false;

	showResultsSection: boolean = true;

	@ViewChild('resultsContainer', { read: ElementRef }) public resultsContainer: ElementRef;
	@ViewChild('resultitem', { read: ElementRef }) public resultitem: ElementRef;
	@ViewChild('customEmptyResultView', { read: ElementRef }) public customEmptyResultView: ElementRef;
	@ViewChild(CdkVirtualScrollViewport, { static: false }) viewport: CdkVirtualScrollViewport;

	displayedResults: IResultItem[];
	lastItemLoading: boolean = false;

	navigateMobileButton: EnumNavigateMobileButton;
	enumNavigateMobileButton = EnumNavigateMobileButton;
	searchedValue: string;

	customEmptyResultsTemplate: TemplateRef<any> | undefined = undefined;
	showCustomView: boolean;
	currentViewedIndex: number = 0;
	scrollSub: any;
	resizeSubscription: any;
	addPaddingToContainer: boolean;
	stopPaddingCheck: boolean;
	filterIsOn: boolean;

	excludedResultsIds: string[];

	ECustomResultsReportView = ECustomResultsReportView;

	get allResultsItemLength() {
		return this.allResults?.length;
	}

	get showCustomResults() {
		return this.reportViewMode === ECustomResultsReportView.Full;
	}

	constructor(
		private _reportNgTemplatesSvc: ReportNgTemplatesService,
		private cdr: ChangeDetectorRef,
		private _reportDataSvc: ReportDataService
	) {}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['allResults']?.currentValue) {
			this.searchedValue = '';
			if (!this.filterIsOn) this.displayedResults = this.allResults;
			if (this._reportDataSvc.filterOptions && this._reportDataSvc.excludedResultsIds)
				this._filterResults(this._reportDataSvc.filterOptions, this._reportDataSvc.excludedResultsIds);
		}
		if (changes['showLoadingView']?.currentValue == false) {
			this._handelFilterUpdates();
			this.checkAndApplyPadding();

			setTimeout(() => {
				const container: HTMLElement = this.customEmptyResultView?.nativeElement;
				if (container && container?.childElementCount > 0) this.showCustomView = true;
				else this.showCustomView = false;

				this.detectEndOfList();
			});
		}

		if ('filterOptions' in changes && changes['filterOptions'].currentValue) {
			this.displayedResults?.forEach(result => {
				result.iStatisticsResult = {
					identical: this.filterOptions.showIdentical ? result.iStatisticsResult?.identical ?? 0 : 0,
					minorChanges: this.filterOptions.showMinorChanges ? result.iStatisticsResult?.minorChanges ?? 0 : 0,
					relatedMeaning: this.filterOptions.showRelated ? result.iStatisticsResult?.relatedMeaning ?? 0 : 0,
				};
			});
		}
	}

	ngOnInit(): void {
		if (this.flexGrow !== undefined && this.flexGrow !== null) {
			this.flexGrowProp = this.flexGrow;
		}
		this.navigateMobileButton = EnumNavigateMobileButton.FirstButton;

		this._reportNgTemplatesSvc.reportTemplatesSubject$.pipe(untilDestroy(this)).subscribe(refs => {
			if (refs?.customEmptyResultsTemplate !== undefined && this.customEmptyResultsTemplate === undefined) {
				this.customEmptyResultsTemplate = refs?.customEmptyResultsTemplate;
				this.cdr.detectChanges();
			}
		});
	}

	private _handelFilterUpdates() {
		if (this._reportDataSvc.filterOptions && this._reportDataSvc.excludedResultsIds)
			this._filterResults(this._reportDataSvc.filterOptions, this._reportDataSvc.excludedResultsIds);

		combineLatest([this._reportDataSvc.filterOptions$, this._reportDataSvc.excludedResultsIds$])
			.pipe(untilDestroy(this))
			.subscribe(([filterOptions, excludedResultsIds]) => {
				if (this.showLoadingView || !filterOptions || !excludedResultsIds) return;
				this._filterResults(filterOptions, excludedResultsIds);
			});
	}

	ngAfterViewInit(): void {
		this.detectEndOfList();

		this.resizeSubscription = fromEvent(window, 'resize')
			.pipe(untilDestroy(this))
			.subscribe(() => {
				this.checkAndApplyPadding();
			});
	}

	checkAndApplyPadding() {
		setTimeout(() => {
			if (!this.viewport || this.stopPaddingCheck || this.showLoadingView) return;
			const isScrollable =
				this.viewport.elementRef.nativeElement.scrollHeight > this.viewport.elementRef.nativeElement.clientHeight;

			this.addPaddingToContainer = isScrollable;
			this.stopPaddingCheck = true;
		});
	}

	hideResultItem() {
		this.displayProp = 'none';
	}

	//#region navigate mobile button

	onSearch(value: string): void {
		this.searchedValue = value;

		if (this._reportDataSvc.filterOptions && this._reportDataSvc.excludedResultsIds)
			this._filterResults(this._reportDataSvc.filterOptions, this._reportDataSvc.excludedResultsIds);

		if (!value || value === '') {
			return;
		}

		value = value.toLowerCase();

		this.displayedResults = this.displayedResults.filter(
			r =>
				r.resultPreview.introduction.toLowerCase().includes(value) ||
				r.resultPreview.title.toLowerCase().includes(value) ||
				(r.resultPreview.url && r.resultPreview.url.toLowerCase().includes(value))
		);
	}

	onScroll(index: number) {
		this.currentViewedIndex = index;
		if (index === 0) this.navigateMobileButton = EnumNavigateMobileButton.FirstButton;
		else if (index === 1) this.navigateMobileButton = EnumNavigateMobileButton.SecondButton;
		else if (
			(index >= 2 && index != this.allResultsItemLength - 1 && index != this.allResultsItemLength - 2) ||
			(index === 2 && this.allResultsItemLength <= 5)
		)
			this.navigateMobileButton = EnumNavigateMobileButton.ThirdButton;
		else if (index === this.allResultsItemLength - 2) this.navigateMobileButton = EnumNavigateMobileButton.FourthButton;
		else if (index === this.allResultsItemLength - 1) this.navigateMobileButton = EnumNavigateMobileButton.FifthButton;
	}

	// Function to scroll to the given index
	scrollToIndex(index?: number): void {
		if (!this.viewport) return;
		if (index != undefined) this.viewport.scrollToIndex(index, 'smooth');
	}

	onDotNavigate(dot: EnumNavigateMobileButton) {
		switch (dot) {
			case EnumNavigateMobileButton.FirstButton: {
				if (this.allResultsItemLength > 5 && this.currentViewedIndex >= this.allResultsItemLength - 3)
					this.scrollToIndex(this.allResultsItemLength - 5);
				else if (this.allResultsItemLength > 5 && this.currentViewedIndex >= 3)
					this.scrollToIndex(this.currentViewedIndex - 2);
				else this.scrollToIndex(0);
				break;
			}
			case EnumNavigateMobileButton.SecondButton: {
				if (this.allResultsItemLength > 5 && this.currentViewedIndex >= this.allResultsItemLength - 3)
					this.scrollToIndex(this.allResultsItemLength - 4);
				else if (this.allResultsItemLength > 5 && this.currentViewedIndex >= 3)
					this.scrollToIndex(this.currentViewedIndex - 1);
				else this.scrollToIndex(1);
				break;
			}
			case EnumNavigateMobileButton.ThirdButton: {
				if (this.allResultsItemLength > 5 && this.currentViewedIndex >= this.allResultsItemLength - 3)
					this.scrollToIndex(this.allResultsItemLength - 3);
				else if (this.allResultsItemLength > 5 && this.currentViewedIndex >= 3)
					this.scrollToIndex(this.currentViewedIndex);
				else this.scrollToIndex(2);
				break;
			}
			case EnumNavigateMobileButton.FourthButton: {
				if (this.allResultsItemLength > 5 && this.currentViewedIndex >= this.allResultsItemLength - 3)
					this.scrollToIndex(this.allResultsItemLength - 2);
				else if (this.allResultsItemLength > 5 && this.currentViewedIndex >= 3)
					this.scrollToIndex(this.currentViewedIndex + 1);
				else this.scrollToIndex(3);
				break;
			}
			case EnumNavigateMobileButton.FifthButton: {
				if (this.allResultsItemLength > 5 && this.currentViewedIndex >= this.allResultsItemLength - 3)
					this.scrollToIndex(this.allResultsItemLength - 1);
				else if (this.allResultsItemLength > 5 && this.currentViewedIndex >= 3)
					this.scrollToIndex(this.currentViewedIndex + 2);
				else this.scrollToIndex(4);
				break;
			}
			default:
				break;
		}
	}

	private detectEndOfList() {
		if (!this.viewport || this.scrollSub) {
			return;
		}

		const scrolledIndexChange$: Observable<number> = this.viewport.scrolledIndexChange;

		// Detect if we're at the end of the list
		this.scrollSub = scrolledIndexChange$
			.pipe(
				map(index => index + this.viewport.getViewportSize() / 313),
				pairwise(),
				filter(([prevIndex, currIndex]) => {
					const viewportSize = this.viewport.getViewportSize();
					const totalContentSize = this.viewport.getDataLength() * 313;
					// Determine if the end is reached by comparing the current index and the total content size
					const endReached = currIndex > prevIndex && viewportSize + currIndex * 313 >= totalContentSize;
					return endReached;
				}),
				distinctUntilChanged(),
				untilDestroy(this)
			)
			.subscribe(() => {
				this.currentViewedIndex = this.allResultsItemLength - 1;
				if (this.allResultsItemLength === 2) this.navigateMobileButton = EnumNavigateMobileButton.SecondButton;
				if (this.allResultsItemLength === 3) this.navigateMobileButton = EnumNavigateMobileButton.ThirdButton;
				if (this.allResultsItemLength === 4) this.navigateMobileButton = EnumNavigateMobileButton.FourthButton;
				if (this.allResultsItemLength >= 5) this.navigateMobileButton = EnumNavigateMobileButton.FifthButton;
			});
	}

	includeResultById(resultId: string) {
		const excludedResutsIds = this._reportDataSvc.excludedResultsIds ?? [];
		this._reportDataSvc.excludedResultsIds$.next(excludedResutsIds.filter(id => id != resultId));
	}

	excludeResultById(resultId: string) {
		const excludedResutsIds = new Set(this._reportDataSvc.excludedResultsIds);
		excludedResutsIds.add(resultId);
		this._reportDataSvc.excludedResultsIds$.next(Array.from(excludedResutsIds));
	}

	private _filterResults(filterOptions: ICopyleaksReportOptions, excludedResultsIds: string[]) {
		this.excludedResultsIds = excludedResultsIds;

		const filteredResults = this._reportDataSvc.filterResults(filterOptions, excludedResultsIds);

		this.displayedResults = this.allResults
			.filter(result => !!filteredResults.find(r => r.id === result.resultPreview?.id))
			.map(result => {
				return {
					...result,
					iStatisticsResult: {
						identical: filterOptions.showIdentical ? result.iStatisticsResult?.identical ?? 0 : 0,
						minorChanges: filterOptions.showMinorChanges ? result.iStatisticsResult?.minorChanges ?? 0 : 0,
						relatedMeaning: filterOptions.showRelated ? result.iStatisticsResult?.relatedMeaning ?? 0 : 0,
					},
				} as IResultItem;
			})
			.sort(
				(a, b) =>
					b.iStatisticsResult.identical +
					b.iStatisticsResult.minorChanges +
					b.iStatisticsResult.relatedMeaning -
					(a.iStatisticsResult.identical + a.iStatisticsResult.minorChanges + a.iStatisticsResult.relatedMeaning)
			);

		this.resultsActions = {
			...this.resultsActions,
			totalExcluded: excludedResultsIds?.length,
			totalFiltered:
				this._reportDataSvc.totalCompleteResults - filteredResults.length <= 0
					? 0
					: this._reportDataSvc.totalCompleteResults - filteredResults.length - excludedResultsIds?.length,
			totalResults: this._reportDataSvc.totalCompleteResults,
		};

		this.filterIsOn = filteredResults.length !== this._reportDataSvc.scanResultsDetails?.length;
		if (!filterOptions.showIdentical || !filterOptions.showMinorChanges || !filterOptions.showRelated)
			this.filterIsOn = true;
	}

	//#endregion
	ngOnDestroy() {}
}
