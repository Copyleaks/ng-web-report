import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'copyleaks-ai-percentage',
	templateUrl: './ai-percentage.component.html',
	styleUrls: ['./ai-percentage.component.scss'],
})
export class AiPercentageComponent implements OnInit {
	/**
	 * @Input {number} The AI percentage result
	 */
	@Input() aiPercentageResult: number = 0;
	tooltipText: string;
	ngOnInit(): void {
		this.tooltipText = $localize`This is the overall percentage of content from the submitted text that is likely to contain AI content`;
	}
}
