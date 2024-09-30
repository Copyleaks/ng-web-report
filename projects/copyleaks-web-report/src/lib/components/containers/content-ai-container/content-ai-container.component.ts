import { Component, Input, OnInit } from '@angular/core';
import { ExplainableAIResults } from '../../../models/report-matches.models';

@Component({
	selector: 'copyleaks-content-ai-container',
	templateUrl: './content-ai-container.component.html',
	styleUrls: ['./content-ai-container.component.scss'],
})
export class ContentAiContainerComponent implements OnInit {
	@Input() explainableAIResults: ExplainableAIResults = { explain: null, slicedMatch: [] };

	constructor() {}
	ngOnInit(): void {}
}
