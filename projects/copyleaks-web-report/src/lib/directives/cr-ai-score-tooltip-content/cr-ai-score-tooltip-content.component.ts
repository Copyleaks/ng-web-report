import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'cr-ai-score-tooltip-content',
    templateUrl: './cr-ai-score-tooltip-content.component.html',
    styleUrls: ['./cr-ai-score-tooltip-content.component.scss'],
    animations: [trigger('fade', [state('void', style({ opacity: 0 })), transition('void <=> *', animate(300))])],
    standalone: false
})
export class CrAIScoreTooltipContentComponent implements OnInit {
	@Input() tooltipText: string = '';
	@Input() isTooltipBar: boolean = false;

	constructor() {}

	ngOnInit(): void {}
}
