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
	ngOnInit(): void {}
}
