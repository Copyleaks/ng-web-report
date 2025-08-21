import {
	AfterViewInit,
	Component,
	ElementRef,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	SimpleChanges,
	ViewChild,
} from '@angular/core';
import { trigger, state, transition, animate, style } from '@angular/animations';
import { IWritingFeedbackCorrectionViewModel } from '../../../models/report-data.models';
import { EReportViewType, EWritingFeedbackCategories } from '../../../enums/copyleaks-web-report.enums';
import {
	getCorrectionCategoryDescription,
	getCorrectionCategoryTitle,
	getSelectedCategoryType,
} from '../../../utils/enums-helpers';
import { ReportDataService } from '../../../services/report-data.service';
import { EnumNavigateMobileButton } from '../report-results-item-container/components/models/report-result-item.enum';
import { distinctUntilChanged, filter, map, pairwise } from 'rxjs/operators';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Observable, fromEvent } from 'rxjs';
import { untilDestroy } from '../../../utils/until-destroy';
import { ReportMatchesService } from '../../../services/report-matches.service';
import { ReportMatchHighlightService } from '../../../services/report-match-highlight.service';
import { IWritingFeedbackTypeStatistics } from '../../../models/report-statistics.models';
import { ReportViewService } from '../../../services/report-view.service';

@Component({
	selector: 'copyleaks-report-corrections-container',
	templateUrl: './report-corrections-container.component.html',
	styleUrls: ['./report-corrections-container.component.scss'],
	animations: [
		trigger('fadeIn', [
			state('void', style({ opacity: 0 })),
			transition(':enter', [animate('0.5s ease-in', style({ opacity: 1 }))]),
		]),
	],
	standalone: false,
})
export class ReportCorrectionsContainerComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
	@ViewChild(CdkVirtualScrollViewport, { static: false }) viewport: CdkVirtualScrollViewport;

	/**
	 * @Input {number} The report Writing Feedback total issues.
	 */
	@Input() totalWritingFeedbackIssues: number = 0;

	/**
	 * @Input {number} The report Writing Feedback total filtered issues.
	 */
	@Input() totalFilteredCorrections: number = 0;

	/**
	 * Represents the statistics for different types of writing feedback.
	 */
	@Input() writingFeedbackStats: IWritingFeedbackTypeStatistics[];

	/**
	 * Represents the statistics for different types of writing feedbacks.
	 */
	@Input() allWritingFeedbacksStats: IWritingFeedbackTypeStatistics[];
	/**
	 * Represents the displayed scan corrections view.
	 */
	@Input() displayedScanCorrectionsView: IWritingFeedbackCorrectionViewModel[];

	/**
	 * Represents all the scan corrections view.
	 */
	@Input() allScanCorrectionsView: IWritingFeedbackCorrectionViewModel[];

	/**
	 * Represents the selected category for writing feedback.
	 */
	@Input() selectedCategroy: EWritingFeedbackCategories | undefined = undefined;

	/**
	 * Represents whether a correction is clicked or not.
	 */
	@Input() correctionClicked: boolean = false;

	/**
	 * Represents whether the component is being viewed on a mobile device.
	 */
	@Input() isMobile: boolean = false;

	/**
	 * Represents whether the loading view should be shown or not.
	 */
	@Input() showLoadingView: boolean = true;

	selectedCategroyTotal: number = 0;
	selectedCategroyTitle: string;
	selectedCategroyDescription: string;
	selectedCategroyCorrections: IWritingFeedbackCorrectionViewModel[];
	emptyCorrectionsMessage: string = $localize`No Grammar corrections were found!`;
	totalIgnoredWritingFeedbackIssues: number = 0;
	totalSelectedWritingFeedbackIssues: number = 0;

	private _resizeObserver: ResizeObserver;
	addPaddingToContainer: boolean;
	scrollSub: any;
	currentViewedIndex: number = 0;
	navigateMobileButton: EnumNavigateMobileButton;
	enumNavigateMobileButton = EnumNavigateMobileButton;
	EReportViewType = EReportViewType;
	showResultsSection: boolean = true;
	filterIndicatorOn: boolean;
	docDirection: 'ltr' | 'rtl';

	get allResultsItemLength() {
		return this.allScanCorrectionsView?.length;
	}

	get displayedScanCorrectionsViewLength() {
		return this.displayedScanCorrectionsView?.length;
	}

	constructor(
		public reportDataSvc: ReportDataService,
		public reportViewSvc: ReportViewService,
		public reportMatchesSvc: ReportMatchesService,
		public highlightService: ReportMatchHighlightService,
		private _elementRef: ElementRef
	) {}

	ngOnInit(): void {
		this._resizeObserver = new ResizeObserver(_ => {
			this.viewport?.checkViewportSize();
		});

		this.reportDataSvc.scanResultsPreviews$.pipe(untilDestroy(this)).subscribe(scanResultsPreviews => {
			if (!scanResultsPreviews) return;
			this.filterIndicatorOn =
				scanResultsPreviews?.filters?.writingFeedback?.hiddenCategories?.length > 0 ||
				scanResultsPreviews?.filters?.writingFeedback?.excludedCorrections?.length > 0;
		});

		this.reportViewSvc.documentDirection$.pipe(untilDestroy(this)).subscribe(dir => {
			this.docDirection = dir;
		});
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['displayedScanCorrectionsView'] || changes['allScanCorrectionsView'] || changes['correctionClicked']) {
			this.totalIgnoredWritingFeedbackIssues = (this.reportDataSvc.excludedCorrections ?? []).length;
			if (this.correctionClicked)
				this.totalSelectedWritingFeedbackIssues = this.displayedScanCorrectionsView?.length ?? 0;
			else this.totalSelectedWritingFeedbackIssues = 0;

			if (this.selectedCategroy) {
				this.selectedCategroyCorrections = this.displayedScanCorrectionsView.filter(
					c => c.type === this.selectedCategroy
				);
				if (this.selectedCategroyCorrections.length === 0) this.selectedCategroy = undefined;
			}
		}

		if (
			changes['showLoadingView']?.currentValue == false ||
			changes['displayedScanCorrectionsView'] ||
			changes['allScanCorrectionsView']
		) {
			this.checkAndApplyPadding();
			setTimeout(() => {
				this.detectEndOfList();
			});
		}
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

	onSelectCategory(category: EWritingFeedbackCategories) {
		this.selectedCategroy = category;
		this.selectedCategroyTitle = this.getCorrectionCategoryTitle(category);
		this.selectedCategroyDescription = this.getCorrectionCategoryDescription(category);
		this.selectedCategroyCorrections = this.displayedScanCorrectionsView.filter(c => c.type === category);
		this.highlightService.clearAllMatchs();

		const selectedType = getSelectedCategoryType(category);
		if (this.writingFeedbackStats && this.writingFeedbackStats[selectedType]) {
			const selectedCategoryStats = this.writingFeedbackStats[selectedType].categories?.find(c => c.type === category);
			if (selectedCategoryStats) this.selectedCategroyTotal = selectedCategoryStats.totalIssues;
			else this.selectedCategroyTotal = 0;
		}
	}

	goToAllCorrectionsView() {
		this.selectedCategroy = undefined;
	}

	getCorrectionCategoryTitle(type: EWritingFeedbackCategories): string {
		return getCorrectionCategoryTitle(type);
	}

	getCorrectionCategoryDescription(type: EWritingFeedbackCategories): string {
		return getCorrectionCategoryDescription(type);
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
				if (
					this.displayedScanCorrectionsViewLength > 5 &&
					this.currentViewedIndex >= this.displayedScanCorrectionsViewLength - 3
				)
					this.scrollToIndex(this.displayedScanCorrectionsViewLength - 5);
				else if (this.displayedScanCorrectionsViewLength > 5 && this.currentViewedIndex >= 3)
					this.scrollToIndex(this.currentViewedIndex - 2);
				else this.scrollToIndex(0);
				break;
			}
			case EnumNavigateMobileButton.SecondButton: {
				if (
					this.displayedScanCorrectionsViewLength > 5 &&
					this.currentViewedIndex >= this.displayedScanCorrectionsViewLength - 3
				)
					this.scrollToIndex(this.displayedScanCorrectionsViewLength - 4);
				else if (this.displayedScanCorrectionsViewLength > 5 && this.currentViewedIndex >= 3)
					this.scrollToIndex(this.currentViewedIndex - 1);
				else this.scrollToIndex(1);
				break;
			}
			case EnumNavigateMobileButton.ThirdButton: {
				if (
					this.displayedScanCorrectionsViewLength > 5 &&
					this.currentViewedIndex >= this.displayedScanCorrectionsViewLength - 3
				)
					this.scrollToIndex(this.displayedScanCorrectionsViewLength - 3);
				else if (this.displayedScanCorrectionsViewLength > 5 && this.currentViewedIndex >= 3)
					this.scrollToIndex(this.currentViewedIndex);
				else this.scrollToIndex(2);
				break;
			}
			case EnumNavigateMobileButton.FourthButton: {
				if (
					this.displayedScanCorrectionsViewLength > 5 &&
					this.currentViewedIndex >= this.displayedScanCorrectionsViewLength - 3
				)
					this.scrollToIndex(this.displayedScanCorrectionsViewLength - 2);
				else if (this.displayedScanCorrectionsViewLength > 5 && this.currentViewedIndex >= 3)
					this.scrollToIndex(this.currentViewedIndex + 1);
				else this.scrollToIndex(3);
				break;
			}
			case EnumNavigateMobileButton.FifthButton: {
				if (
					this.displayedScanCorrectionsViewLength > 5 &&
					this.currentViewedIndex >= this.displayedScanCorrectionsViewLength - 3
				)
					this.scrollToIndex(this.displayedScanCorrectionsViewLength - 1);
				else if (this.displayedScanCorrectionsViewLength > 5 && this.currentViewedIndex >= 3)
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

	checkAndApplyPadding() {
		setTimeout(() => {
			if (!this.viewport || this.showLoadingView) return;
			const isScrollable =
				this.viewport.elementRef.nativeElement.scrollHeight > this.viewport.elementRef.nativeElement.clientHeight;

			this.addPaddingToContainer = isScrollable;
		});
	}

	//#endregion

	ngOnDestroy(): void {}
}
