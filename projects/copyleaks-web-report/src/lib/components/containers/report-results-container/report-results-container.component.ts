import {
	Component,
	ElementRef,
	HostBinding,
	Input,
	OnChanges,
	OnInit,
	Renderer2,
	ViewChild,
	SimpleChange,
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
	@Input() resultsActions: IResultsActions;
	@Input() isMobile: boolean;

	/**
	 * @Input {boolean} Flag indicating whether to show the loading view or not.
	 */
	@Input() showLoadingView = false;

	showAlertsSection: boolean = true;

	@ViewChild('resultsContainer', { read: ElementRef }) public resultsContainer: ElementRef;
	@ViewChild('resultitem', { read: ElementRef }) public resultitem: ElementRef;
	@ViewChild('customResultView', { read: ElementRef }) public customResultView: ElementRef;
	@ViewChild(CdkVirtualScrollViewport, { static: false }) viewport: CdkVirtualScrollViewport;

	displayedResults: IResultItem[];
	lastItemLoading: boolean = false;

	navigateMobileButton: EnumNavigateMobileButton;
	enumNavigateMobileButton = EnumNavigateMobileButton;
	searchedValue: string;

	customResultsTemplate: TemplateRef<any> | undefined = undefined;
	showCustomView: boolean;
	currentViewedIndex: number = 0;

	get allResultsItemLength() {
		return this.allResults?.length;
	}

	constructor(
		private _renderer: Renderer2,
		private _reportNgTemplatesSvc: ReportNgTemplatesService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnChanges(change: SimpleChanges) {
		if (change['allResults']?.currentValue) {
			this.searchedValue = '';
			this.displayedResults = this.allResults;
		}
	}

	ngAfterViewChecked() {
		const container: HTMLElement = this.customResultView?.nativeElement;
		if (container && container?.childElementCount > 0)
			setTimeout(() => {
				this.showCustomView = true;
			});
		else
			setTimeout(() => {
				this.showCustomView = false;
			});
		this.cdr.detectChanges();
	}

	ngOnInit(): void {
		if (this.flexGrow !== undefined && this.flexGrow !== null) {
			this.flexGrowProp = this.flexGrow;
		}
		this.navigateMobileButton = EnumNavigateMobileButton.FirstButton;

		this._reportNgTemplatesSvc.reportTemplatesSubject$.pipe(untilDestroy(this)).subscribe(refs => {
			if (refs?.customResultsTemplate !== undefined && this.customResultsTemplate === undefined) {
				this.customResultsTemplate = refs?.customResultsTemplate;

				this.cdr.detectChanges();
			}
		});
	}

	hideResultItem() {
		this.displayProp = 'none';
	}

	//#region navigate mobile button

	onSearch(value: string): void {
		this.searchedValue = value;

		if (!value || value === '') {
			this.displayedResults = this.allResults;
			return;
		}

		value = value.toLowerCase();

		this.displayedResults = this.allResults.filter(
			r =>
				r.resultPreview.introduction.toLowerCase().includes(value) ||
				r.resultPreview.title.toLowerCase().includes(value) ||
				(r.resultPreview.url && r.resultPreview.url.toLowerCase().includes(value))
		);
	}

	onScroll(index: number) {
		this.currentViewedIndex = index;
		console.log(this.currentViewedIndex);
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

	//#endregion
	ngOnDestroy() {}
}
