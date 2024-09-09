import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'copyleaks-more-frequently-phrases-container',
	templateUrl: './more-frequently-phrases-container.component.html',
	styleUrls: ['./more-frequently-phrases-container.component.scss'],
})
export class MoreFrequentlyPhrasesContainerComponent implements OnInit {
	constructor() {}

	get headerTooltip(): string {
		return $localize`Generative AI models often overuse certain phrases, which is one of over three dozen signals used by our algorithms to identify the presence of AI.`;
	}
	ngOnInit(): void {}
}
