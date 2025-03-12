import {
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	QueryList,
	SimpleChanges,
	ViewChild,
	ViewChildren,
} from '@angular/core';
import {
	AIExplainResultItem,
	EProportionType,
	ExplainableAIResults,
	Match,
	Range,
} from '../../../../../models/report-matches.models';
import { EnumNavigateMobileButton } from '../../../report-results-item-container/components/models/report-result-item.enum';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatTooltip } from '@angular/material/tooltip';
import { ReportMatchesService } from '../../../../../services/report-matches.service';
import { ISelectExplainableAIResult } from '../../../../../models/report-ai-results.models';
import { ReportMatchHighlightService } from '../../../../../services/report-match-highlight.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReportViewService } from '../../../../../services/report-view.service';

@Component({
	selector: 'copyleaks-explainable-ai-result-container',
	templateUrl: './explainable-ai-result-container.component.html',
	styleUrls: ['./explainable-ai-result-container.component.scss'],
})
export class ExplainableAIResultContainerComponent implements OnInit, OnChanges, OnDestroy {
	/**
	 * @Input {ExplainableAIResults} The explainable AI results
	 */
	@Input() explainableAIResults: ExplainableAIResults;

	/**
	 * @Input {boolean} A flag indicating if the results are locked
	 */
	@Input() lockedResults: boolean = false;

	/**
	 * @Input {boolean} A flag indicating if the component is in mobile view
	 */
	@Input() isMobile: boolean = false;

	/**
	 * @Input {boolean} A flag indicating if the component is in loading state
	 */
	@Input() isLoading: boolean = false;

	/**
	 * @Input Service for report matches and corrections.
	 */
	@Input() reportMatchesSvc: ReportMatchesService;

	@Input() highlightService: ReportMatchHighlightService;

	/**
	 * @Output {boolean} Event emitted when the user clears the selected result
	 */
	@Output() clearSelectResultEvent = new EventEmitter<boolean>();

	@ViewChild('scrollContainer') scrollContainer!: ElementRef;

	@ViewChildren(MatExpansionPanel) panels: QueryList<MatExpansionPanel>;

	@ViewChild('desktopScroll') desktopScroll!: ElementRef;

	explainResults: AIExplainResultItem[] = [];
	explainItemResults: AIExplainResultItem[] = [];
	navigateMobileButton: EnumNavigateMobileButton = EnumNavigateMobileButton.FirstButton;
	enumNavigateMobileButton = EnumNavigateMobileButton;

	proportions: number[] = [];
	emptyView: boolean = false;
	aiInsightAlert: boolean = false;
	alertTitle: string;
	alertMessage: string;
	title: string;
	hasInfinityResult: boolean = false;
	openedPanel: boolean = false; // its for the ai insight result height, once panel opened we want to add more height
	minProportion: number = 0;
	maxProportion: number = 0;
	minGradeBar: number = 0;
	midGradeBar: number = 0;
	maxGradeBar: number = 0;
	currentViewedIndex: number = 0;
	infoTooltipText: string;
	proportionTooltipText: string;
	resultTooltipText: string;
	barTooltipText: string;
	updateResult: boolean = false;
	panelIndex: number[] = [];
	tooltipVisible: boolean = false;
	isProgrammaticChange: boolean;
	docDirection: 'ltr' | 'rtl';

	// Subject for destroying all the subscriptions in the main library component
	private unsubscribe$ = new Subject();

	constructor(private _reportViewSvc: ReportViewService) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isLoading']?.currentValue == false) {
			this._initResults();
		}
	}

	ngOnInit(): void {
		if (!this.isLoading) this._initResults();
		this.highlightService.aiInsightsShowResult$
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((selectResult: ISelectExplainableAIResult) => {
				if (selectResult) {
					const selectIndex = this.explainItemResults.findIndex(
						result => result.start <= selectResult.resultRange.start && selectResult.resultRange.end <= result.end
					);
					if (selectIndex === -1) return;
					if (selectResult.isSelected) {
						if (this.isMobile) {
							this.scrollToIndex(selectIndex);
							setTimeout(() => {
								this.panels?.toArray()[selectIndex]?.open();
							}, 500);
						} else {
							this.panels?.toArray()[selectIndex]?.open();
							setTimeout(() => {
								this.desktopScroll.nativeElement.children[selectIndex].scrollIntoView({
									behavior: 'smooth',
									block: 'center',
								});
							}, 350);
						}
					} else {
						this.panels?.toArray()[selectIndex]?.close();
					}
				}
			});

		// Subscription to the originalHtml$ observable to handle the AI insight match click
		this.highlightService.originalHtml$.pipe(takeUntil(this.unsubscribe$)).subscribe(selectedMatch => {
			this._handleHtmlAIInsightMatchClick(selectedMatch);
		});

		this._reportViewSvc.documentDirection$.pipe(takeUntil(this.unsubscribe$)).subscribe(dir => {
			this.docDirection = dir;
		});
	}

	private _initResults() {
		if (!this.updateResult) {
			this._updateTooltipText();
			if (this.explainableAIResults?.explain && this.explainableAIResults?.slicedMatch.length > 0) {
				this.title = $localize`AI Insights`;
				this._mapingtoResultItem();
				this._updateProportionRange();
			} else if (!this.lockedResults) {
				this.emptyView = true;
				// If the AI insights are empty, check if there is an AI alert
				this.aiInsightAlert = !!this.explainableAIResults?.aiScanAlert;
				if (this.aiInsightAlert) {
					this.alertTitle = this.explainableAIResults?.aiScanAlert?.title;
					this.alertMessage = this.explainableAIResults?.aiScanAlert?.message;
				}
			}
			this.updateResult = true;
		}
	}

	/**
	 * Update the tooltip text
	 */
	private _updateTooltipText() {
		this.infoTooltipText = $localize`Learn more about AI Insights`;
		this.proportionTooltipText = $localize`The ratio represents how many times on average AI would use the phrase compared to how many times on average a human would use this phrase.`;
		this.resultTooltipText = $localize`Our dataset consists of millions of documents containing both AI and human written text. Here, we are showing the results normalized per 1M texts for an easier interpretation of the data shown.`;
		this.barTooltipText = $localize`The darker the color, the more frequently the phrase is used by AI compared to a human.`;
	}

	/**
	 * Update the bar score
	 */
	private _updateProportionRange(): void {
		this.proportions = this.explainResults?.map(result => result.proportion) ?? [];
		const proportionsFiltered = this.proportions.filter(p => p > 0);
		this.minProportion = Number(Math.min(...proportionsFiltered).toFixed(0));
		this.maxProportion = Number(Math.max(...proportionsFiltered).toFixed(0));
		this.hasInfinityResult = this.proportions.some(p => p == -1);
		this.minGradeBar = this._getGradePercentByPropoType(EProportionType.Low);
		this.midGradeBar = this._getGradePercentByPropoType(EProportionType.Medium);
		this.maxGradeBar = this._getGradePercentByPropoType(EProportionType.High);
	}

	/**
	 * Get the grade percent in bar score by proportion type
	 * @param type
	 * @returns Number
	 */
	private _getGradePercentByPropoType(type: EProportionType): number {
		const grade =
			(this.explainResults?.filter(result => result.proportionType == type)?.length / this.proportions.length) * 100;
		return Number(grade.toFixed(0));
	}

	/**
	 * Mapping the result to AIExplainResultItem
	 */
	private _mapingtoResultItem() {
		this.explainableAIResults.explain.patterns.statistics.proportion.forEach((item, index) => {
			const wordStart = this.explainableAIResults?.explain?.patterns?.text?.chars.starts[index];
			const wordEnd = this.explainableAIResults?.explain?.patterns?.text?.chars.lengths[index] + wordStart;
			const content = this.explainableAIResults?.sourceText.substring(wordStart, wordEnd);
			const slicedMatchResult = this.explainableAIResults.slicedMatch.find(result => result.match.start === wordStart);

			if (slicedMatchResult?.content) {
				this.explainResults.push({
					content: content,
					proportionType: slicedMatchResult.match.proportionType,
					aiCount: Number(this.explainableAIResults.explain.patterns.statistics.aiCount[index]),
					humanCount: Number(this.explainableAIResults.explain.patterns.statistics.humanCount[index]),
					proportion: Number(item.toFixed(0)),
					isInfinity: item == -1,
					start: this.explainableAIResults.explain.patterns.text.chars.starts[index],
					end: this.explainableAIResults.explain.patterns.text.chars.lengths[index] + wordStart,
				});
			}
		});
		this.explainItemResults = this.explainResults.sort((a, b) => {
			if (a.proportion === -1) return -1;
			if (b.proportion === -1) return 1;
			return b.proportion - a.proportion;
		});
		this.explainItemResults = [...this.explainResults];
	}

	toggleTooltip(tooltip: MatTooltip): void {
		this.tooltipVisible = !this.tooltipVisible;
		this.tooltipVisible ? tooltip.show() : tooltip.hide();
	}

	onScrollMobile() {
		if (this.isMobile && this.openedPanel && this.panelIndex.length) {
			this.closePanel();
		}
		const container = this.scrollContainer.nativeElement;
		const itemWidth = container.clientWidth;
		const scrollPosition = container.scrollLeft;

		// Calculate the index of the item in the center
		const index = Math.round(scrollPosition / itemWidth);
		this.currentViewedIndex = index;
		if (index === 0) this.navigateMobileButton = EnumNavigateMobileButton.FirstButton;
		else if (index === 1) this.navigateMobileButton = EnumNavigateMobileButton.SecondButton;
		else if (
			(index >= 2 && index != this.explainItemResults.length - 1 && index != this.explainItemResults.length - 2) ||
			(index === 2 && this.explainItemResults.length <= 5)
		)
			this.navigateMobileButton = EnumNavigateMobileButton.ThirdButton;
		else if (index === this.explainItemResults.length - 2)
			this.navigateMobileButton = EnumNavigateMobileButton.FourthButton;
		else if (index === this.explainItemResults.length - 1)
			this.navigateMobileButton = EnumNavigateMobileButton.FifthButton;
	}

	onDotNavigate(dot: EnumNavigateMobileButton) {
		switch (dot) {
			case EnumNavigateMobileButton.FirstButton: {
				if (this.explainItemResults.length > 5 && this.currentViewedIndex >= this.explainItemResults.length - 3)
					this.scrollToIndex(this.explainItemResults.length - 5);
				else if (this.explainItemResults.length > 5 && this.currentViewedIndex >= 3)
					this.scrollToIndex(this.currentViewedIndex - 2);
				else this.scrollToIndex(0);
				break;
			}
			case EnumNavigateMobileButton.SecondButton: {
				if (this.explainItemResults.length > 5 && this.currentViewedIndex >= this.explainItemResults.length - 3)
					this.scrollToIndex(this.explainItemResults.length - 4);
				else if (this.explainItemResults.length > 5 && this.currentViewedIndex >= 3)
					this.scrollToIndex(this.currentViewedIndex - 1);
				else this.scrollToIndex(1);
				break;
			}
			case EnumNavigateMobileButton.ThirdButton: {
				if (this.explainItemResults.length > 5 && this.currentViewedIndex >= this.explainItemResults.length - 3)
					this.scrollToIndex(this.explainItemResults.length - 3);
				else if (this.explainItemResults.length > 5 && this.currentViewedIndex >= 3)
					this.scrollToIndex(this.currentViewedIndex);
				else this.scrollToIndex(2);
				break;
			}
			case EnumNavigateMobileButton.FourthButton: {
				if (this.explainItemResults.length > 5 && this.currentViewedIndex >= this.explainItemResults.length - 3)
					this.scrollToIndex(this.explainItemResults.length - 2);
				else if (this.explainItemResults.length > 5 && this.currentViewedIndex >= 3)
					this.scrollToIndex(this.currentViewedIndex + 1);
				else this.scrollToIndex(3);
				break;
			}
			case EnumNavigateMobileButton.FifthButton: {
				if (this.explainItemResults.length > 5 && this.currentViewedIndex >= this.explainItemResults.length - 3)
					this.scrollToIndex(this.explainItemResults.length - 1);
				else if (this.explainItemResults.length > 5 && this.currentViewedIndex >= 3)
					this.scrollToIndex(this.currentViewedIndex + 2);
				else this.scrollToIndex(4);
				break;
			}
			default:
				break;
		}
	}

	// Function to scroll to the given index
	scrollToIndex(index?: number): void {
		const itemWidth = this.scrollContainer.nativeElement.clientWidth;
		const scrollPosition = index * itemWidth;

		this.scrollContainer.nativeElement.scrollTo({ left: scrollPosition, behavior: 'smooth' });
	}

	/**
	 *  close all the panels
	 */
	closePanel() {
		this.panels.forEach(panel => panel.close());
	}

	/**
	 * Add the panel index to the list when the panel is opened
	 * @param index
	 */
	addToPanelIndex(index: number) {
		if (this.isProgrammaticChange) return;

		this.panelIndex.push(index);
		this.openedPanel = true; // its for the ai insight result height, once panel opened we want to add more height

		this.highlightService.aiInsightsSelect$.next({
			resultRange: {
				start: this.explainItemResults[index].start,
				end: this.explainItemResults[index].end,
			} as Range,
			isSelected: true,
		} as ISelectExplainableAIResult);
	}

	/**
	 *
	 * Remove the panel index from the list when the panel is closed
	 * @param index
	 */
	removeFromPanelIndex(index: number) {
		if (this.isProgrammaticChange) return;

		this.panelIndex = this.panelIndex.filter(i => i !== index);
		if (!this.panelIndex.length) this.openedPanel = false;

		this.highlightService.aiInsightsSelect$.next({
			resultRange: {
				start: this.explainItemResults[index].start,
				end: this.explainItemResults[index].end,
			} as Range,
			isSelected: false,
		} as ISelectExplainableAIResult);
	}

	/**
	 * Check if the panel is open
	 * @param index
	 * @returns boolean
	 */
	isPanelOpen(index: number) {
		return this.panelIndex.includes(index);
	}

	/**
	 * Get the proportion class type
	 * @param proportionType
	 * @returns string
	 */
	getProportionClassType(proportionType: EProportionType) {
		switch (proportionType) {
			case EProportionType.Low:
				return 'low-proportion';
			case EProportionType.Medium:
				return 'medium-proportion';
			case EProportionType.High:
				return 'high-proportion';
		}
	}

	/**
	 * Handle the HTML View AI insight match click, and expand the panel if the match is selected and collapse it if it's not
	 * @param selectedMatch The selected HTML match
	 */
	private _handleHtmlAIInsightMatchClick(selectedMatch: Match): void {
		let selectedAIInsight = this.explainableAIResults.slicedMatch[selectedMatch?.gid];
		if (!selectedAIInsight) return;

		let prevSelectedAIInsights = this.highlightService.aiInsightsSelectedResults ?? [];
		let alreadySelected = prevSelectedAIInsights.find(
			ai => ai.resultRange.start === selectedAIInsight.match.start && ai.resultRange.end === selectedAIInsight.match.end
		);

		const selectIndex = this.explainItemResults.findIndex(
			result => result.start <= selectedAIInsight.match.start && selectedAIInsight.match.end <= result.end
		);
		if (alreadySelected) {
			if (this.panels?.toArray()[selectIndex]) this._programmaticallyCollapsePanel(selectIndex);
			this.highlightService.aiInsightsSelectedResults$.next(
				prevSelectedAIInsights.filter(
					ai =>
						ai.resultRange.start !== selectedAIInsight.match.start && ai.resultRange.end !== selectedAIInsight.match.end
				)
			);
		} else if (this.panels?.toArray()[selectIndex]) {
			// add the selected AI insight to reportMatchesSvc.aiInsightsSelectedResults if not already selected
			const selectedResults = this.highlightService.aiInsightsSelectedResults$.value ?? [];
			const index = selectedResults.findIndex(
				result =>
					result.resultRange.start === this.explainItemResults[selectIndex].start &&
					result.resultRange.end === this.explainItemResults[selectIndex].end
			);
			if (index === -1)
				selectedResults.push({
					resultRange: {
						start: this.explainItemResults[selectIndex].start,
						end: this.explainItemResults[selectIndex].end,
					},
				} as ISelectExplainableAIResult);
			this.highlightService.aiInsightsSelectedResults$.next(selectedResults);

			if (this.isMobile) {
				this.scrollToIndex(selectIndex);
				setTimeout(() => {
					this._programmaticallyExpandPanel(selectIndex);
				}, 500);
			} else {
				this._programmaticallyExpandPanel(selectIndex);
				setTimeout(() => {
					this.desktopScroll.nativeElement.children[selectIndex].scrollIntoView({
						behavior: 'smooth',
						block: 'center',
					});
				}, 350);
			}
		}
	}

	/**
	 * Programmatically expand the panel at the given index & don't allow the Material Expansion Panel built-in event to trigger (open/close) the panel
	 * @param index The index of the panel to expand
	 */
	private _programmaticallyExpandPanel(index: number): void {
		if (index <= -1) return;
		const panel = this.panels.toArray()[index];
		if (panel) {
			// Don't allow the Material Expansion Panel built-in event to trigger (open/close) the panel
			this.isProgrammaticChange = true;
			panel.expanded = true;
			this.panelIndex.push(index);
			this.openedPanel = true;
			setTimeout(() => (this.isProgrammaticChange = false), 0); // Reset the flag after the change
		}
	}

	/**
	 * Programmatically collapse the panel at the given index & don't allow the Material Expansion Panel built-in event to trigger (open/close) the panel
	 * @param index The index of the panel to expand
	 */
	private _programmaticallyCollapsePanel(index: number): void {
		if (index <= -1) return;
		const panel = this.panels.toArray()[index];
		if (panel) {
			// Don't allow the Material Expansion Panel built-in event to trigger (open/close) the panel
			this.isProgrammaticChange = true;
			panel.expanded = false;
			this.panelIndex = this.panelIndex.filter(i => i !== index);
			if (!this.panelIndex.length) this.openedPanel = false;
			setTimeout(() => (this.isProgrammaticChange = false), 0); // Reset the flag after the change
		}
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
