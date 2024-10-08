import { Component, Input, OnInit } from '@angular/core';
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
export class ExplainableAIResultContainerComponent implements OnInit {
	@Input() explainableAIResults: ExplainableAIResults;
	@Input() selectAIText: number[] = [];
	explainResults: AIExplainResultItem[] = [];

	minProportion: number = 0;
	maxProportion: number = 0;
	proportions: number[] = [];
	minGradeBar: number = 0;
	midGradeBar: number = 0;
	maxGradeBar: number = 0;

	get headerTooltip(): string {
		return $localize`Generative AI models often overuse certain phrases, which is one of over three dozen signals used by our algorithms to identify the presence of AI.`;
	}

	constructor() {}

	get explainItemResults(): AIExplainResultItem[] {
		if (this.selectAIText.length == 0) return this.explainResults;
		let itemResults = this.explainResults.filter(item => this.selectAIText.includes(item.start));
		return itemResults;
	}

	ngOnInit(): void {
		if (this.explainableAIResults) {
			this._updateProportionRange();
			this._mapingtoResultItem();
		}
	}

	private _updateProportionRange(): void {
		this.proportions = this.explainableAIResults.explain?.patterns?.statistics?.proportion ?? [];
		const proportionsFiltered = this.proportions.filter(p => p > 0);
		this.minProportion = Number(Math.min(...proportionsFiltered).toFixed(3));
		this.maxProportion = Number(Math.max(...proportionsFiltered).toFixed(3));

		this.minGradeBar = this._getGradePercentByPropoType(EProportionType.Low);
		this.midGradeBar = this._getGradePercentByPropoType(EProportionType.Medium);
		this.maxGradeBar = this._getGradePercentByPropoType(EProportionType.High);
	}

	private _getGradePercentByPropoType(type: EProportionType): number {
		const grade =
			(this.explainableAIResults.slicedMatch.filter(result => result?.match?.proportionType == type)?.length /
				this.proportions.length) *
			100;
		return Number(grade.toFixed(3));
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
					aiCount: Number(this.explainableAIResults.explain.patterns.statistics.aiCount[index].toFixed(3)),
					humanCount: Number(this.explainableAIResults.explain.patterns.statistics.humanCount[index].toFixed(3)),
					proportion: Number(item.toFixed(3)),
					start: this.explainableAIResults.explain.patterns.text.chars.starts[index],
					end: this.explainableAIResults.explain.patterns.text.chars.lengths[index] + wordStart,
				});
			}
		});
	}
}
