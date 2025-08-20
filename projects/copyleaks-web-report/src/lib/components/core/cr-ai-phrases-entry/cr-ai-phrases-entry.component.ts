import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReportViewService } from '../../../services/report-view.service';

@Component({
    selector: 'cr-ai-phrases-entry',
    templateUrl: './cr-ai-phrases-entry.component.html',
    styleUrls: ['./cr-ai-phrases-entry.component.scss'],
    standalone: false
})
export class CrAiPhrasesEntryComponent implements OnInit {
	/**
	 * @Input {string} Title of the alert displayed in the component
	 */
	@Input() alertTitle: string = '';

	/**
	 * @Input {string} Message of the alert displayed in the component
	 */
	@Input() alertMessage: string = '';

	/**
	 * @Input {boolean} Flag indicating if the alert is related to AI insights
	 */
	@Input() aiInsightAlert: boolean = false;

	/**
	 * @Input {string} Tooltip text displayed on the bar component
	 */
	@Input() barTooltipText: string = '';

	/**
	 * @Input {number} Minimum proportion value used for rendering the bar chart
	 */
	@Input() minProportion: number = 0;

	/**
	 * @Input {number} Maximum proportion value used for rendering the bar chart
	 */
	@Input() maxProportion: number = 0;

	/**
	 * @Input {number} Minimum grade value displayed on the bar
	 */
	@Input() minGradeBar: number = 0;

	/**
	 * @Input {number} Maximum grade value displayed on the bar
	 */
	@Input() maxGradeBar: number = 0;

	/**
	 * @Input {number} Midpoint grade value displayed on the bar for reference
	 */
	@Input() midGradeBar: number = 0;

	/**
	 * @Input {boolean} A flag indicating if the result includes an infinity value
	 */
	@Input() hasInfinityResult: boolean = false;

	/**
	 * @Input {number} Total number of phrases contributing to the result
	 */
	@Input() totalPhrases: number = 0;

	/**
	 * @Input {boolean} A flag indicating if the component is in loading state
	 */
	@Input() isLoading: boolean = true;

	/**
	 * @Input {number} The AI percentage result to display on the bar
	 */
	@Input() aiPercentageResult: number = 0;

	/**
	 * @Output {EventEmitter<void>} Emits when user navigates to the phrases section
	 */
	@Output() onNavigateToPhrases = new EventEmitter<void>();

	constructor(public reportViewSvc: ReportViewService) {}

	ngOnInit(): void {}

	onNavigateToPhrasesClick() {
		this.onNavigateToPhrases.emit();
	}
}
