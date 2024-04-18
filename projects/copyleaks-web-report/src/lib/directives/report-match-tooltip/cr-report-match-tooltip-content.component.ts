import { Component, OnInit } from '@angular/core';
import { trigger, state, transition, animate, style } from '@angular/animations';
import { IWritingFeedbackCorrectionViewModel } from '../../models/report-data.models';

@Component({
	selector: 'cr-report-match-tooltip-content',
	templateUrl: './cr-report-match-tooltip-content.component.html',
	styleUrls: ['./cr-report-match-tooltip-content.component.scss'],
	animations: [trigger('fade', [state('void', style({ opacity: 0 })), transition('void <=> *', animate(300))])],
})
export class CrReportMatchTooltipContentComponent implements OnInit {
	correctionData: IWritingFeedbackCorrectionViewModel;

	constructor() {}

	ngOnInit(): void {}
}
