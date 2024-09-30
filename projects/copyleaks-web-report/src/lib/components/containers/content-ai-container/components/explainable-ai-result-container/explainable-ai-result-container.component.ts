import { Component, Input, OnInit } from '@angular/core';
import { ExplainableAIResults } from '../../../../../models/report-matches.models';

@Component({
	selector: 'copyleaks-explainable-ai-result-container',
	templateUrl: './explainable-ai-result-container.component.html',
	styleUrls: ['./explainable-ai-result-container.component.scss'],
})
export class ExplainableAIResultContainerComponent implements OnInit {
	get headerTooltip(): string {
		return $localize`Generative AI models often overuse certain phrases, which is one of over three dozen signals used by our algorithms to identify the presence of AI.`;
	}

	@Input() explainableAIResults: ExplainableAIResults = { explain: null, slicedMatch: [] };
	constructor() {}
	ngOnInit(): void {
		console.log(this.explainableAIResults);
	}
}
