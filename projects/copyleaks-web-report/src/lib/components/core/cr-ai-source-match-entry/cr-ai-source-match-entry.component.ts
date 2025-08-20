import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReportStatistics } from '../../../models/report-statistics.models';
import { EReportScoreTooltipPosition } from '../../../enums/copyleaks-web-report.enums';
import { ReportViewService } from '../../../services/report-view.service';
import { ReportDataService } from '../../../services/report-data.service';

@Component({
    selector: 'cr-ai-source-match-entry',
    templateUrl: './cr-ai-source-match-entry.component.html',
    styleUrls: ['./cr-ai-source-match-entry.component.scss'],
    standalone: false
})
export class CrAiSourceMatchEntryComponent implements OnInit {
	/**
	 * @Input {ReportStatistics} The full statistics object for AI source match results
	 */
	@Input() aiSourceMatchResultsStats: ReportStatistics;

	/**
	 * @Input {number} The overall AI source match score
	 */
	@Input() aiSourceMatchResultsScore: number = 0;

	/**
	 * @Input {number} The score representing identical content matches
	 */
	@Input() aiSourceMatchResultsIndenticalScore: number = 0;

	/**
	 * @Input {number} The score representing matches with minor changes
	 */
	@Input() aiSourceMatchResultsMinorChangesScore: number = 0;

	/**
	 * @Input {number} The score representing paraphrased content matches
	 */
	@Input() aiSourceMatchResultsParaphrasedScore: number = 0;

	/**
	 * @Input {number} The total number of AI source match results
	 */
	@Input() aiSourceMatchResultsTotal: number = 0;

	/**
	 * @Input {boolean} A flag indicating if the component is in loading state
	 */
	@Input() isLoading: boolean = true;

	/**
	 * @Output {EventEmitter<void>} Emits when user navigates to the AI source match results categroy view
	 */
	@Output() onNavigateToResults = new EventEmitter<void>();

	EReportScoreTooltipPosition = EReportScoreTooltipPosition;

	constructor(public reportViewSvc: ReportViewService, public reportDataSvc: ReportDataService) {}

	ngOnInit(): void {}

	onNavigateToResultsClick() {
		this.onNavigateToResults.emit();
	}
}
