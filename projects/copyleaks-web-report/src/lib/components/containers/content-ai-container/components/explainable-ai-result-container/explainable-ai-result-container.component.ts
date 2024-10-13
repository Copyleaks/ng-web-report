import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import {
	AIExplainResultItem,
	EProportionType,
	ExplainableAIResults,
} from '../../../../../models/report-matches.models';

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
	 * @Output {boolean} Event emitted when the user clears the selected result
	 */
	@Output() clearSelectResultEvent = new EventEmitter<boolean>();

	explainResults: AIExplainResultItem[] = [];
	explainItemResults: AIExplainResultItem[] = [];
	proportions: number[] = [];
	emptyView: boolean = false;
	hasInfinityResult: boolean = false;
	minProportion: number = 0;
	maxProportion: number = 0;
	minGradeBar: number = 0;
	midGradeBar: number = 0;
	maxGradeBar: number = 0;

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
}
