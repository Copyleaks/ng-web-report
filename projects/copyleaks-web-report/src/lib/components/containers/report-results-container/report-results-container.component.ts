import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
	ChangeDetectorRef,
	Component,
	ElementRef,
	HostBinding,
	Input,
	OnChanges,
	OnInit,
	SimpleChanges,
	TemplateRef,
	ViewChild,
} from '@angular/core';
import { Observable, combineLatest, fromEvent } from 'rxjs';
import { distinctUntilChanged, filter, map, pairwise } from 'rxjs/operators';
import {
	EPlatformType,
	EReportViewType,
	EResponsiveLayoutType,
	EResultPreviewType,
} from '../../../enums/copyleaks-web-report.enums';
import { ICopyleaksReportOptions } from '../../../models/report-options.models';
import { ReportDataService } from '../../../services/report-data.service';
import { ReportNgTemplatesService } from '../../../services/report-ng-templates.service';
import { ReportViewService } from '../../../services/report-view.service';
import { untilDestroy } from '../../../utils/until-destroy';
import { ECustomResultsReportView } from '../../core/cr-custom-results/models/cr-custom-results.enums';
import { EnumNavigateMobileButton } from '../report-results-item-container/components/models/report-result-item.enum';
import { IResultItem } from '../report-results-item-container/components/models/report-result-item.models';
import { IResultsActions } from './components/results-actions/models/results-actions.models';
import { ReportMatchHighlightService } from '../../../services/report-match-highlight.service';
import { IMatchesCategoryStatistics, IMatchesTypeStatistics } from '../../../models/report-statistics.models';
import { RESULT_TAGS_CODES } from '../../../constants/report-result-tags.constants';
import { ALERTS } from '../../../constants/report-alerts.constants';

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
	@Input() hideAiTap: boolean;
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
	EReportViewType = EReportViewType;
	EPlatformType = EPlatformType;
	searchedValue: string;

	customEmptyResultsTemplate: TemplateRef<any> | undefined = undefined;
	customAISourceMatchUpgradeTemplate: TemplateRef<any> | undefined = undefined;
	showCustomView: boolean;
	currentViewedIndex: number = 0;
	scrollSub: any;
	addPaddingToContainer: boolean;

	filterIsOn: boolean;
	filterIndicatorOn: boolean = false;

	excludedResultsIds: string[];

	ECustomResultsReportView = ECustomResultsReportView;

	allMatchResultsStats: IMatchesTypeStatistics[];
	selectedCategory: IMatchesCategoryStatistics | null;
	selectedCategoryResults: IResultItem[];

	aiSourceMatchUpgradeCategory: IMatchesTypeStatistics = {
		categories: [],
		totalResults: 0,
		totalResultsPct: 0,
		type: EResultPreviewType.AISourceMatchUpgrade,
	};

	private _resizeObserver: ResizeObserver;
	hideCategoriesSection: boolean;
	docDirection: 'ltr' | 'rtl';

	get allResultsItemLength() {
		return this.allResults?.length;
	}

	get displayedResultsLength() {
		return this.displayedResults?.length;
	}

	get showCustomResults() {
		return this.reportViewMode === ECustomResultsReportView.Full;
	}

	get getSelectedCategoryResults() {
		const results = this.selectedCategory?.results.filter(result =>
			this.displayedResults.find(r => r?.resultPreview?.id === result?.resultPreview?.id)
		);
		return results;
	}

	constructor(
		private _cdr: ChangeDetectorRef,
		private _elementRef: ElementRef,
		public reportDataSvc: ReportDataService,
		public highlightService: ReportMatchHighlightService,
		public reportNgTemplatesSvc: ReportNgTemplatesService,
		public reportViewSvc: ReportViewService
	) {}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['allResults']?.currentValue) {
			this.searchedValue = '';
			setTimeout(() => {
				if (!this.filterIsOn) {
					this.displayedResults = this.allResults;
					this.selectedCategoryResults = this.getSelectedCategoryResults;
					this._updateMatchesResultsStats();
					if (this.selectedCategoryResults?.length === 0) this._setSelectedCategoryRef(null);
				}
				if (this.reportDataSvc.filterOptions && this.reportDataSvc.excludedResultsIds)
					this._filterResults(this.reportDataSvc.filterOptions, this.reportDataSvc.excludedResultsIds);
			});
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

		this.reportNgTemplatesSvc.reportTemplatesSubject$.pipe(untilDestroy(this)).subscribe(refs => {
			if (refs?.customEmptyResultsTemplate !== undefined && this.customEmptyResultsTemplate === undefined) {
				this.customEmptyResultsTemplate = refs?.customEmptyResultsTemplate;
				this._cdr.detectChanges();
			}

			if (
				refs?.customAISourceMatchUpgradeTemplate !== undefined &&
				this.customAISourceMatchUpgradeTemplate === undefined
			) {
				this.customAISourceMatchUpgradeTemplate = refs?.customAISourceMatchUpgradeTemplate;
				this._cdr.detectChanges();
			}
		});

		this._resizeObserver = new ResizeObserver(_ => {
			this.viewport?.checkViewportSize();
		});

		this.reportViewSvc.documentDirection$.pipe(untilDestroy(this)).subscribe(dir => {
			this.docDirection = dir;
		});
	}

	private _handelFilterUpdates() {
		if (this.reportDataSvc.filterOptions && this.reportDataSvc.excludedResultsIds)
			this._filterResults(this.reportDataSvc.filterOptions, this.reportDataSvc.excludedResultsIds);

		combineLatest([
			this.reportDataSvc.filterOptions$.pipe(distinctUntilChanged()),
			this.reportDataSvc.excludedResultsIds$.pipe(distinctUntilChanged()),
		])
			.pipe(untilDestroy(this))
			.subscribe(([filterOptions, excludedResultsIds]) => {
				if (this.showLoadingView || !filterOptions || !excludedResultsIds) return;
				this.filterIndicatorOn = this.reportDataSvc.isFilterOn;
				this._filterResults(filterOptions, excludedResultsIds);
			});
	}

	ngAfterViewInit(): void {
		this.detectEndOfList();

		fromEvent(window, 'resize')
			.pipe(untilDestroy(this))
			.subscribe(() => {
				this.checkAndApplyPadding();
			});

		this._resizeObserver.observe(this._elementRef.nativeElement);
	}

	checkAndApplyPadding() {
		setTimeout(() => {
			if (!this.viewport || this.showLoadingView) return;
			const isScrollable =
				this.viewport.elementRef.nativeElement.scrollHeight > this.viewport.elementRef.nativeElement.clientHeight;

			this.addPaddingToContainer = isScrollable;
		});
	}

	hideResultItem() {
		this.displayProp = 'none';
	}

	onSearch(value: string): void {
		this.searchedValue = value;

		if (this.reportDataSvc.filterOptions && this.reportDataSvc.excludedResultsIds)
			this._filterResults(this.reportDataSvc.filterOptions, this.reportDataSvc.excludedResultsIds);

		if (!value || value === '') {
			return;
		}

		value = value.toLowerCase();

		this.displayedResults = this.displayedResults.filter(
			r =>
				r.resultPreview.introduction?.toLowerCase()?.includes(value) ||
				r.resultPreview.title?.toLowerCase()?.includes(value) ||
				r.resultPreview.metadata?.filename?.toLowerCase()?.includes(value) ||
				(r.resultPreview.url && r.resultPreview.url?.toLowerCase()?.includes(value)) ||
				this.isSearchByType(value, r)
		);
	}

	isSearchByType(value: string, r: IResultItem): boolean {
		if (!value) return false;

		value = value.toLowerCase();
		// check if the searched value is the result type name
		switch (value) {
			case 'internet':
				return r.resultPreview.type === EResultPreviewType.Internet;
			case 'internal database':
				return r.resultPreview.type === EResultPreviewType.Database;
			case 'repository':
				return r.resultPreview.type === EResultPreviewType.Repositroy;
			case 'batch':
				return r.resultPreview.type === EResultPreviewType.Batch;
			default:
				return false;
		}
	}

	//#region navigate mobile button

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
				if (this.displayedResultsLength > 5 && this.currentViewedIndex >= this.displayedResultsLength - 3)
					this.scrollToIndex(this.displayedResultsLength - 5);
				else if (this.displayedResultsLength > 5 && this.currentViewedIndex >= 3)
					this.scrollToIndex(this.currentViewedIndex - 2);
				else this.scrollToIndex(0);
				break;
			}
			case EnumNavigateMobileButton.SecondButton: {
				if (this.displayedResultsLength > 5 && this.currentViewedIndex >= this.displayedResultsLength - 3)
					this.scrollToIndex(this.displayedResultsLength - 4);
				else if (this.displayedResultsLength > 5 && this.currentViewedIndex >= 3)
					this.scrollToIndex(this.currentViewedIndex - 1);
				else this.scrollToIndex(1);
				break;
			}
			case EnumNavigateMobileButton.ThirdButton: {
				if (this.displayedResultsLength > 5 && this.currentViewedIndex >= this.displayedResultsLength - 3)
					this.scrollToIndex(this.displayedResultsLength - 3);
				else if (this.displayedResultsLength > 5 && this.currentViewedIndex >= 3)
					this.scrollToIndex(this.currentViewedIndex);
				else this.scrollToIndex(2);
				break;
			}
			case EnumNavigateMobileButton.FourthButton: {
				if (this.displayedResultsLength > 5 && this.currentViewedIndex >= this.displayedResultsLength - 3)
					this.scrollToIndex(this.displayedResultsLength - 2);
				else if (this.displayedResultsLength > 5 && this.currentViewedIndex >= 3)
					this.scrollToIndex(this.currentViewedIndex + 1);
				else this.scrollToIndex(3);
				break;
			}
			case EnumNavigateMobileButton.FifthButton: {
				if (this.displayedResultsLength > 5 && this.currentViewedIndex >= this.displayedResultsLength - 3)
					this.scrollToIndex(this.displayedResultsLength - 1);
				else if (this.displayedResultsLength > 5 && this.currentViewedIndex >= 3)
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
		const excludedResutsIds = this.reportDataSvc.excludedResultsIds ?? [];
		this.reportDataSvc.excludedResultsIds$.next(excludedResutsIds.filter(id => id != resultId));
	}

	excludeResultById(resultId: string) {
		const excludedResutsIds = new Set(this.reportDataSvc.excludedResultsIds);
		excludedResutsIds.add(resultId);
		this.reportDataSvc.excludedResultsIds$.next(Array.from(excludedResutsIds));
	}

	private _filterResults(filterOptions: ICopyleaksReportOptions, excludedResultsIds: string[]) {
		this.excludedResultsIds = excludedResultsIds;

		const filteredResults = this.reportDataSvc.filterResults(filterOptions, excludedResultsIds);

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
					(b.resultPreview.isLocked
						? 0
						: b.iStatisticsResult.identical + b.iStatisticsResult.minorChanges + b.iStatisticsResult.relatedMeaning) -
					(a.resultPreview.isLocked
						? 0
						: a.iStatisticsResult.identical + a.iStatisticsResult.minorChanges + a.iStatisticsResult.relatedMeaning)
			);

		this.resultsActions = {
			...this.resultsActions,
			totalExcluded: excludedResultsIds?.length,
			totalFiltered:
				this.reportDataSvc.totalCompleteResults - filteredResults.length <= 0
					? 0
					: this.reportDataSvc.totalCompleteResults - filteredResults.length - excludedResultsIds?.length,
			totalResults: this.reportDataSvc.totalCompleteResults,
		};

		this.filterIsOn = filteredResults.length !== this.reportDataSvc.scanResultsDetails?.length;
		if (!filterOptions.showIdentical || !filterOptions.showMinorChanges || !filterOptions.showRelated)
			this.filterIsOn = true;

		this._updateMatchesResultsStats();
		this.selectedCategoryResults = this.getSelectedCategoryResults;
		if (this.selectedCategoryResults?.length === 0) this._setSelectedCategoryRef(null);

		setTimeout(() => {
			this.checkAndApplyPadding();
		});
	}

	//#endregion
	goToAllResultsView() {
		this.reportDataSvc.selectedCategoryResultsIds$.next(undefined);
		this._setSelectedCategoryRef(null);

		if (this.reportViewSvc.reportViewMode?.navigateBackToAIView && this.reportDataSvc.isAiDetectionEnabled()) {
			this.reportViewSvc.selectedAlert$.next(ALERTS.SUSPECTED_AI_TEXT_DETECTED);
			this.reportViewSvc.reportViewMode$.next({
				...this.reportViewSvc.reportViewMode,
				viewMode: 'one-to-many',
				alertCode: ALERTS.SUSPECTED_AI_TEXT_DETECTED,
			});
		}
	}

	onSelectCategory(selectedCategory: IMatchesCategoryStatistics) {
		this._setSelectedCategoryRef(selectedCategory);
		this.selectedCategoryResults = this.getSelectedCategoryResults;
		if (this.selectedCategoryResults?.length === 0) this._setSelectedCategoryRef(null);

		if (selectedCategory) {
			const selectedCategoryResultsIds = this.allResults
				.filter(result => selectedCategory.results.find(r => r.resultPreview?.id === result?.resultPreview?.id))
				.map(r => r.resultPreview.id);
			this.reportDataSvc.selectedCategoryResultsIds$.next([...selectedCategoryResultsIds]);
			this.reportViewSvc.reportViewMode$.next({
				...this.reportViewSvc.reportViewMode,
				navigateBackToAIView: false,
			});
		} else {
			this.reportDataSvc.selectedCategoryResultsIds$.next(undefined);
		}
	}

	private _setSelectedCategoryRef(selectedCategory: IMatchesCategoryStatistics | null) {
		this.selectedCategory = selectedCategory;

		const selectedCategoryTypeQueryParam = this.reportViewSvc.reportViewMode.selectedResultsCategory
			? decodeURI(this.reportViewSvc.reportViewMode.selectedResultsCategory)
			: null;
		if (selectedCategoryTypeQueryParam === selectedCategory?.type) return;
		this.reportViewSvc.reportViewMode$.next({
			...this.reportViewSvc.reportViewMode,
			selectedResultsCategory: selectedCategory?.type ? encodeURI(selectedCategory?.type) : null,
		});
	}

	private _updateMatchesResultsStats() {
		this.allMatchResultsStats = this._initMatchResultsStatistics();
		this.displayedResults.forEach(result => {
			// if the result is an AI source match result add it to the AI source match category
			const aiSourceMatchTag = result?.resultPreview?.tags?.find(
				tag => tag.code === RESULT_TAGS_CODES.SUSPECTED_AI_GENERATED
			);
			if (aiSourceMatchTag) {
				this._increaseMatchResultsCategoryTotal(
					this.allMatchResultsStats,
					EResultPreviewType.AISourceMatch,
					$localize`AI Source Match`,
					result
				);
				this.allMatchResultsStats[4].totalResults += 1;
				this.allMatchResultsStats[4].totalResultsPct =
					this.allMatchResultsStats[4].totalResults / (this.displayedResults?.length ?? 0);
			}

			switch (result.resultPreview.type) {
				case EResultPreviewType.Internet:
					if (result.resultPreview.url)
						this._increaseMatchResultsCategoryTotal(
							this.allMatchResultsStats,
							EResultPreviewType.Internet,
							result.resultPreview.url,
							result
						);
					this.allMatchResultsStats[0].totalResults += 1;
					this.allMatchResultsStats[0].totalResultsPct = this.allMatchResultsStats[0].totalResultsPct =
						this.allMatchResultsStats[0].totalResults / (this.displayedResults?.length ?? 0);
					break;
				case EResultPreviewType.Batch:
					if (result?.resultPreview?.metadata?.author)
						this._increaseMatchResultsCategoryTotal(
							this.allMatchResultsStats,
							EResultPreviewType.Batch,
							result.resultPreview.metadata.author,
							result
						);
					this.allMatchResultsStats[1].totalResults += 1;
					this.allMatchResultsStats[1].totalResultsPct =
						this.allMatchResultsStats[1].totalResults / (this.displayedResults?.length ?? 0);

					break;
				case EResultPreviewType.Database:
					if (result?.resultPreview?.scanId)
						this._increaseMatchResultsCategoryTotal(
							this.allMatchResultsStats,
							EResultPreviewType.Database,
							'Your files',
							result
						);
					else {
						this._increaseMatchResultsCategoryTotal(
							this.allMatchResultsStats,
							EResultPreviewType.Database,
							'Others files',
							result
						);
					}
					this.allMatchResultsStats[2].totalResults += 1;
					this.allMatchResultsStats[2].totalResultsPct =
						this.allMatchResultsStats[2].totalResults / (this.displayedResults?.length ?? 0);
					break;
				case EResultPreviewType.Repositroy:
					this._increaseMatchResultsCategoryTotal(
						this.allMatchResultsStats,
						EResultPreviewType.Repositroy,
						result.resultPreview.title,
						result
					);
					this.allMatchResultsStats[3].totalResults += 1;
					this.allMatchResultsStats[3].totalResultsPct =
						this.allMatchResultsStats[3].totalResults / (this.displayedResults?.length ?? 0);
					break;
				default:
					break;
			}
		});
		// check if all allMatchResultsStats categories are empty
		if (this.allMatchResultsStats.every(r => r.categories.length === 0)) this.hideCategoriesSection = true;
		else this.hideCategoriesSection = false;

		const selectedCategoryType = this.reportViewSvc.reportViewMode.selectedResultsCategory
			? decodeURI(this.reportViewSvc.reportViewMode.selectedResultsCategory)
			: null;

		if (selectedCategoryType) {
			let selectedCategory: IMatchesCategoryStatistics = null;
			this.allMatchResultsStats.forEach(r => {
				const category = r?.categories?.find(c => c?.type === selectedCategoryType);
				if (category) selectedCategory = category;
			});
			this.selectedCategory = selectedCategory;
			if (selectedCategory) {
				const selectedCategoryResultsIds = this.allResults
					.filter(result => selectedCategory.results.find(r => r.resultPreview?.id === result?.resultPreview?.id))
					.map(r => r.resultPreview.id);
				this.reportDataSvc.selectedCategoryResultsIds$.next([...selectedCategoryResultsIds]);
			} else {
				this.reportDataSvc.selectedCategoryResultsIds$.next(undefined);
			}
		}
	}

	private _initMatchResultsStatistics(): IMatchesTypeStatistics[] {
		return [
			{
				type: EResultPreviewType.Internet,
				categories: [],
				totalResults: 0,
				totalResultsPct: 0,
			},
			{
				type: EResultPreviewType.Batch,
				categories: [],
				totalResults: 0,
				totalResultsPct: 0,
			},
			{
				type: EResultPreviewType.Database,
				categories: [],
				totalResults: 0,
				totalResultsPct: 0,
			},
			{
				type: EResultPreviewType.Repositroy,
				categories: [],
				totalResults: 0,
				totalResultsPct: 0,
			},
			{
				type: EResultPreviewType.AISourceMatch,
				categories: [],
				totalResults: 0,
				totalResultsPct: 0,
			},
		];
	}

	private _increaseMatchResultsCategoryTotal(
		writingFeedbackStats: IMatchesTypeStatistics[],
		resultType: EResultPreviewType,
		category: string,
		resultItem: IResultItem
	) {
		const index = writingFeedbackStats.findIndex(r => r.type === resultType);
		if (index === -1) return;

		const resultStats = writingFeedbackStats[index];
		if (resultType === EResultPreviewType.Internet) {
			const urlObj = new URL(category);
			category = urlObj.hostname;
		}
		const categoryIndex = resultStats.categories.findIndex(c => c.type === category);
		if (categoryIndex > -1) {
			resultStats.categories[categoryIndex].totalResults++;
			// check if the results array is not undefined and create it if it is
			if (!resultStats.categories[categoryIndex].results) resultStats.categories[categoryIndex].results = [];
			if (!resultStats.categories[categoryIndex].results.find(r => r.resultPreview.id === resultItem.resultPreview.id))
				resultStats.categories[categoryIndex].results.push(resultItem);
		} else {
			resultStats.categories.push({
				type: category,
				totalResults: 1,
				results: [resultItem],
			});
		}
	}

	ngOnDestroy() {
		this._resizeObserver.disconnect();
	}
}
