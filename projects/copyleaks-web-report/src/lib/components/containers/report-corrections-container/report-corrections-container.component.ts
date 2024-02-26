import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { trigger, state, transition, animate, style } from '@angular/animations';
import {
	IWritingFeedbackCorrectionViewModel,
	IWritingFeedbackTypeStatistics,
} from '../../../models/report-data.models';

@Component({
	selector: 'copyleaks-report-corrections-container',
	templateUrl: './report-corrections-container.component.html',
	styleUrls: ['./report-corrections-container.component.scss'],
	animations: [
		trigger('fadeIn', [
			state('void', style({ opacity: 0 })),
			transition(':enter', [animate('0.5s ease-in', style({ opacity: 1 }))]),
		]),
	],
})
export class ReportCorrectionsContainerComponent implements OnInit, OnDestroy {
	/**
	 * @Input {number} The report Writing Feedback total issues.
	 */
	@Input() totalWritingFeedbackIssues: number = 0;

	@Input() writingFeedbackStats: IWritingFeedbackTypeStatistics[];

	@Input() displayedScanCorrectionsView: IWritingFeedbackCorrectionViewModel[];

	constructor() {}

	ngOnInit(): void {}

	ngOnDestroy(): void {}
}
