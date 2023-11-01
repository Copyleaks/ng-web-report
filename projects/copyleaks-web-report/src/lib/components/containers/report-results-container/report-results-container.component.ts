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

	displayedResults: IResultItem[];
	lastItemLoading: boolean = false;

	navigateMobileButton: EnumNavigateMobileButton;
	enumNavigateMobileButton = EnumNavigateMobileButton;
	showMatChip: boolean = true;
	searchedValue: string;

	customResultsTemplate: TemplateRef<any> | undefined = undefined;
	showCustomView: boolean;

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
		const navigateNum = this.displayedResults?.length / 5;
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
		const navigateNum = this.displayedResults?.length / 5;
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

	//#endregion
	ngOnDestroy() {}
}
