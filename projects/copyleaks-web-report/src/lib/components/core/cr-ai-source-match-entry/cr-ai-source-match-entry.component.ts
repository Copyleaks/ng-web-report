import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReportStatistics } from '../../../models/report-statistics.models';
import { EReportScoreTooltipPosition } from '../../../enums/copyleaks-web-report.enums';
import { ReportViewService } from '../../../services/report-view.service';
import { ReportDataService } from '../../../services/report-data.service';

@Component({
	selector: 'cr-ai-source-match-entry',
	templateUrl: './cr-ai-source-match-entry.component.html',
	styleUrls: ['./cr-ai-source-match-entry.component.scss'],
})
export class CrAiSourceMatchEntryComponent implements OnInit {
	@Input() aiSourceMatchResultsStats: ReportStatistics;
	@Input() aiSourceMatchResultsScore: number = 0;
	@Input() aiSourceMatchResultsIndenticalScore: number = 0;
	@Input() aiSourceMatchResultsMinorChangesScore: number = 0;
	@Input() aiSourceMatchResultsParaphrasedScore: number = 0;
	@Input() aiSourceMatchResultsTotal: number = 0;
	@Input() isLoading: boolean = true;

	@Output() onNavigateToResults = new EventEmitter<void>();

	EReportScoreTooltipPosition = EReportScoreTooltipPosition;

	constructor(public reportViewSvc: ReportViewService, public reportDataSvc: ReportDataService) {}

	ngOnInit(): void {}

	onNavigateToResultsClick() {
		this.onNavigateToResults.emit();
	}
}
