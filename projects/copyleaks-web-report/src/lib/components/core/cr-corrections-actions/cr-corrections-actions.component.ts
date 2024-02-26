import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'cr-corrections-actions',
	templateUrl: './cr-corrections-actions.component.html',
	styleUrls: ['./cr-corrections-actions.component.scss'],
})
export class CrCorrectionsActionsComponent implements OnInit {
	/**
	 * @Input {number} The report Writing Feedback total issues.
	 */
	@Input() totalWritingFeedbackIssues: number = 0;

	isFilterOn: boolean = false;

	constructor() {}

	ngOnInit(): void {}
}
