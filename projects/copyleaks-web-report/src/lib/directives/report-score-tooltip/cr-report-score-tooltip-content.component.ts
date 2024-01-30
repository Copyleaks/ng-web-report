import { Component, OnInit } from '@angular/core';
import { EReportScoreTooltipPosition } from '../../enums/copyleaks-web-report.enums';
import { IReportScoreTooltipModel } from '../../models/report-view.models';
import { trigger, state, transition, animate, style } from '@angular/animations';

@Component({
	selector: 'cr-report-score-tooltip-content',
	templateUrl: './cr-report-score-tooltip-content.component.html',
	styleUrls: ['./cr-report-score-tooltip-content.component.scss'],
	animations: [trigger('fade', [state('void', style({ opacity: 0 })), transition('void <=> *', animate(300))])],
})
export class CrReportScoreTooltipContentComponent implements OnInit {
	scoreStats: IReportScoreTooltipModel | null = null;
	position: EReportScoreTooltipPosition = EReportScoreTooltipPosition.DEFAULT;
	left: number = 0;
	top: number = 0;

	EReportScoreTooltipPosition = EReportScoreTooltipPosition;

	constructor() {}

	ngOnInit(): void {}
}
