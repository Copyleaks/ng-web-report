import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'copyleaks-ai-percentage',
	templateUrl: './ai-percentage.component.html',
	styleUrls: ['./ai-percentage.component.scss'],
})
export class AiPercentageComponent implements OnInit {
	constructor() {}

	@Input() aiPercentageResult: number = 0;
	ngOnInit(): void {}
}
