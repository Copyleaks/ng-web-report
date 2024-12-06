import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ExplainableAIResults } from '../../../models/report-matches.models';
import { ReportMatchHighlightService } from '../../../services/report-match-highlight.service';
import { ReportMatchesService } from '../../../services/report-matches.service';

@Component({
	selector: 'copyleaks-content-ai-container',
	templateUrl: './content-ai-container.component.html',
	styleUrls: ['./content-ai-container.component.scss'],
})
export class ContentAiContainerComponent implements OnInit, OnChanges {
	/**
	 * @Input {boolean} A flag indicating if the component is in mobile view
	 */
	@Input() isMobile: boolean = false;

	/**
	 * @Input {boolean} A flag indicating if the component is in loading state
	 */
	@Input() isLoading: boolean = false;

	/**
	 * @Input {boolean} A flag indicating if the results are locked
	 */
	@Input() lockedResults: boolean = false;

	/**
	 * @Input {number} The total number of words in this scan
	 */
	@Input() wordsTotal: number = 0;

	/**
	 * @Input {number} The AI probability
	 */
	@Input() aiScore: number = 0;

	/**
	 * @Input {number} The total number of omitted words matched in this scan
	 */
	@Input() excludedTotal: number = 0;

	/**
	 * @Input {ExplainableAIResults} The explainable AI results
	 */
	@Input() explainableAIResults: ExplainableAIResults;

	/**
	 * {number} The AI percentage result
	 */
	aiPercentageResult: number = 0;

	constructor(private _highlightService: ReportMatchHighlightService, public reportMatchesSvc: ReportMatchesService) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isLoading']?.currentValue == false) {
			this._updateAiPercentageResult();
		}
	}

	ngOnInit(): void {
		this._updateAiPercentageResult();
	}

	/**
	 * Update the AI percentage result
	 */
	private _updateAiPercentageResult() {
		this.aiPercentageResult =
			Math.ceil(this.aiScore * ((this.wordsTotal ?? 0) - (this.excludedTotal ?? 0))) / this.wordsTotal;
	}

	/**
	 * Clear the selected result
	 */
	clearSelectResult() {
		this._highlightService.clearAllMatchs();
	}
}
