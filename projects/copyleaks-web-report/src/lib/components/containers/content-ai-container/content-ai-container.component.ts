import { Component, Input, OnInit } from '@angular/core';
import { ExplainableAIResults } from '../../../models/report-matches.models';
import { ReportMatchHighlightService } from '../../../services/report-match-highlight.service';

@Component({
	selector: 'copyleaks-content-ai-container',
	templateUrl: './content-ai-container.component.html',
	styleUrls: ['./content-ai-container.component.scss'],
})
export class ContentAiContainerComponent implements OnInit {
	/**
	 * @Input {boolean} A flag indicating if the component is in mobile view
	 */
	@Input() isMobile: boolean = false;

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
	 * @Input {number[]} The start character index of the selected text
	 */
	@Input() selectAIText: number[] = [];

	/**
	 * @Input {boolean} A flag indicating if the results are locked
	 */
	@Input() lockedResults: boolean = false;

	totalAiWords: number = 0;
	constructor(private _highlightService: ReportMatchHighlightService) {}
	ngOnInit(): void {
		this.totalAiWords = Math.ceil(this.aiScore * ((this.wordsTotal ?? 0) - (this.excludedTotal ?? 0)));
	}

	clearSelectResult() {
		this._highlightService.clearAllMatchs();
	}
}
