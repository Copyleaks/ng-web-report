import {
	Component,
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
} from '../../../../../models/report-matches.models';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { EnumNavigateMobileButton } from '../../../report-results-item-container/components/models/report-result-item.enum';
import { MatExpansionPanel } from '@angular/material/expansion';

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
	@Input() selectAIText: number[] = [];

	/**
	 * @Input {boolean} A flag indicating if the results are locked
	 */
	@Input() lockedResults: boolean = false;

	/**
	 * @Input {boolean} A flag indicating if the component is in mobile view
	 */
	@Input() isMobile: boolean = false;

	/**
	 * @Output {boolean} Event emitted when the user clears the selected result
	 */
	@Output() clearSelectResultEvent = new EventEmitter<boolean>();

	@ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;

	@ViewChildren(MatExpansionPanel) panels!: QueryList<MatExpansionPanel>;

	explainResults: AIExplainResultItem[] = [];
	explainItemResults: AIExplainResultItem[] = [];
	navigateMobileButton: EnumNavigateMobileButton;
	enumNavigateMobileButton = EnumNavigateMobileButton;

	proportions: number[] = [];
	emptyView: boolean = false;
	hasInfinityResult: boolean = false;
	openedPanel: boolean = false;
	minProportion: number = 0;
	maxProportion: number = 0;
	minGradeBar: number = 0;
	midGradeBar: number = 0;
	maxGradeBar: number = 0;
	currentViewedIndex: number = 0;

	get headerTooltip(): string {
		return $localize`Generative AI models often overuse certain phrases, which is one of over three dozen signals used by our algorithms to identify the presence of AI.`;
	}

	constructor() {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.selectAIText) {
			if (!!this.selectAIText.length) {
				const selectResult = this.explainResults.filter(item => this.selectAIText.includes(item.start));
				this.explainItemResults = [...selectResult];
			} else {
				this.explainItemResults = [...this.explainResults];
			}
		}
	}

	ngOnInit(): void {
		if (this.explainableAIResults?.explain && this.explainableAIResults?.slicedMatch.length > 0) {
			this._updateProportionRange();
			this._mapingtoResultItem();
		} else if (!this.lockedResults) {
			this.emptyView = true;
		}
	}

	private _updateProportionRange(): void {
		this.proportions = this.explainableAIResults.explain?.patterns?.statistics?.proportion ?? [];
		const proportionsFiltered = this.proportions.filter(p => p > 0);
		this.minProportion = Number(Math.min(...proportionsFiltered).toFixed(0));
		this.maxProportion = Number(Math.max(...proportionsFiltered).toFixed(0));
		this.hasInfinityResult = this.proportions.some(p => p == -1);
		this.minGradeBar = this._getGradePercentByPropoType(EProportionType.Low);
		this.midGradeBar = this._getGradePercentByPropoType(EProportionType.Medium);
		this.maxGradeBar = this._getGradePercentByPropoType(EProportionType.High);
	}

	private _getGradePercentByPropoType(type: EProportionType): number {
		const grade =
			(this.explainableAIResults.slicedMatch.filter(result => result?.match?.proportionType == type)?.length /
				this.proportions.length) *
			100;
		return Number(grade.toFixed(0));
	}

	private _mapingtoResultItem() {
		this.explainableAIResults.explain.patterns.statistics.proportion.forEach((item, index) => {
			const wordStart = this.explainableAIResults?.explain?.patterns?.text?.chars.starts[index];
			if (wordStart) {
				const slicedMatchResult = this.explainableAIResults.slicedMatch.find(
					result => result.match.start === wordStart
				);
				this.explainResults.push({
					content: slicedMatchResult.content,
					proportionType: slicedMatchResult.match.proportionType,
					aiCount: Number(this.explainableAIResults.explain.patterns.statistics.aiCount[index].toFixed(0)),
					humanCount: Number(this.explainableAIResults.explain.patterns.statistics.humanCount[index].toFixed(0)),
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

	clearSelectdResult() {
		this.clearSelectResultEvent.emit(true);
	}

	onScroll(index: number) {
		if (this.isMobile && this.openedPanel) {
			this.closePanel();
		}
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
		if (!this.viewport) return;
		if (index != undefined) this.viewport.scrollToIndex(index, 'smooth');
	}

	closePanel() {
		this.panels.forEach(panel => panel.close()); // Only closes the first expansion panel found
	}
}
