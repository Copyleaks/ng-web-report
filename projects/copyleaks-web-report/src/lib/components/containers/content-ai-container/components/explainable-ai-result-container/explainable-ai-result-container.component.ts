import {
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnChanges,
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
	Range,
} from '../../../../../models/report-matches.models';
import { EnumNavigateMobileButton } from '../../../report-results-item-container/components/models/report-result-item.enum';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
	selector: 'copyleaks-explainable-ai-result-container',
	templateUrl: './explainable-ai-result-container.component.html',
	styleUrls: ['./explainable-ai-result-container.component.scss'],
})
export class ExplainableAIResultContainerComponent implements OnInit, OnChanges {
	/**
	 * @Input {ExplainableAIResults} The explainable AI results
	 */
	@Input() explainableAIResults: ExplainableAIResults;

	/**
	 * @Input {number[]} The start character of the selected text
	 */
	@Input() selectAIText: Range[] = [];

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
	 * @Output {boolean} Event emitted when the user clears the selected result
	 */
	@Output() clearSelectResultEvent = new EventEmitter<boolean>();

	@ViewChild('scrollContainer') scrollContainer!: ElementRef;

	@ViewChildren(MatExpansionPanel) panels: QueryList<MatExpansionPanel>;

	explainResults: AIExplainResultItem[] = [];
	explainItemResults: AIExplainResultItem[] = [];
	navigateMobileButton: EnumNavigateMobileButton = EnumNavigateMobileButton.FirstButton;
	enumNavigateMobileButton = EnumNavigateMobileButton;

	proportions: number[] = [];
	emptyView: boolean = false;
	title: string;
	selectedMatch: boolean = false;
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
	updateResult: boolean = false;
	panelIndex: number[] = [];
	tooltipVisible: boolean = false;

	constructor() {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.selectAIText) {
			const selectResult = this.explainResults?.filter(item =>
				this.selectAIText?.find(range => item.start <= range.start && range.end <= item.end)
			);

			if (!!this.selectAIText.length && !!selectResult.length) {
				this.selectedMatch = true;
				this.title =
					`${selectResult.length} ` +
					(selectResult.length > 1 ? $localize`AI Insights Selected` : $localize`AI Insight Selected`);
				this.explainItemResults = [...selectResult];
				this.closePanel();
			} else {
				this.selectedMatch = false;
				this.title = $localize`AI Insights`;
				this.explainItemResults = [...this.explainResults];
			}
		}
		if (changes['isLoading']?.currentValue == false) {
			this._initResults();
		}
	}

	ngOnInit(): void {
		if (!this.isLoading) this._initResults();
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
			}
			this.updateResult = true;
		}
	}

	/**
	 * Update the tooltip text
	 */
	private _updateTooltipText() {
		this.infoTooltipText = $localize`Generative Al models often overuse certain phrases, which is one of over three dozen signals used by our algorithms to identify the presence of AI.`;
		this.proportionTooltipText = $localize`The ratio represents how many times on average AI would use the phrase compared to how many times on average a human would use this phrase.`;
		this.resultTooltipText = $localize`Our dataset consists of millions of documents containing both AI and human written text. Here, we are showing the results normalized per 1M texts for an easier interpretation of the data shown.`;
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
					aiCount: Number(this.explainableAIResults.explain.patterns.statistics.aiCount[index].toFixed(2)),
					humanCount: Number(this.explainableAIResults.explain.patterns.statistics.humanCount[index].toFixed(2)),
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

	/**
	 * Clear the selected result
	 */
	clearSelectdResult() {
		this.clearSelectResultEvent.emit(true);
		this.closePanel();
		this.panelIndex = [];
	}

	toggleTooltip(tooltip: MatTooltip): void {
		this.tooltipVisible = !this.tooltipVisible;
		this.tooltipVisible ? tooltip.show() : tooltip.hide();
	}

	onScrollMobile() {
		if (this.isMobile && this.openedPanel) {
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
		this.panelIndex.push(index);
		this.openedPanel = true; // its for the ai insight result height, once panel opened we want to add more height
	}

	/**
	 *
	 * Remove the panel index from the list when the panel is closed
	 * @param index
	 */
	removeFromPanelIndex(index: number) {
		this.panelIndex = this.panelIndex.filter(i => i !== index);
		if (!this.panelIndex.length) this.openedPanel = false;
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
}
