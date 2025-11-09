import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'copyleaks-ai-percentage',
	templateUrl: './ai-percentage.component.html',
	styleUrls: ['./ai-percentage.component.scss'],
	standalone: false,
})
export class AiPercentageComponent implements OnInit {
	/**
	 * @Input {boolean} A flag indicating if the component is in loading state
	 */
	@Input() isLoading: boolean = false;

	/**
	 * @Input {number} The AI percentage result
	 */
	@Input() aiPercentageResult: number = 0;

	tooltipText: string = $localize`This is the overall percentage of content from the submitted text that is likely to contain AI content.`;

	ngOnInit(): void {}
}
