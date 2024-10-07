import { Component, Input, OnInit } from '@angular/core';
import { ExplainableAIResults } from '../../../models/report-matches.models';

@Component({
	selector: 'copyleaks-content-ai-container',
	templateUrl: './content-ai-container.component.html',
	styleUrls: ['./content-ai-container.component.scss'],
})
export class ContentAiContainerComponent implements OnInit {
	@Input() wordsTotal: number = 0;
	@Input() aiScore: number = 0;
	@Input() excludedTotal: number = 0;
	@Input() explainableAIResults: ExplainableAIResults;
	@Input() selectAIText: number[] = [];
	totalAiWords: number = 0;

	constructor() {}
	ngOnInit(): void {
		this.totalAiWords = Math.ceil(this.aiScore * ((this.wordsTotal ?? 0) - (this.excludedTotal ?? 0)));
	}
}
