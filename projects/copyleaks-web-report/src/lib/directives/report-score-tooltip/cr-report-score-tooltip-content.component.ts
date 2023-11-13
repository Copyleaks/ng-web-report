import { Component, OnInit } from '@angular/core';
import { IReportScoreTooltipModel } from '../../models/report-view.models';
import { EReportScoreTooltipPosition } from '../../enums/copyleaks-web-report.enums';
import { ReportDataService } from '../../services/report-data.service';

@Component({
	selector: 'cr-report-score-tooltip-content',
	templateUrl: './cr-report-score-tooltip-content.component.html',
	styleUrls: ['./cr-report-score-tooltip-content.component.scss'],
})
export class CrReportScoreTooltipContentComponent implements OnInit {
	scoreStats: IReportScoreTooltipModel | null = null;
	position: EReportScoreTooltipPosition = EReportScoreTooltipPosition.DEFAULT;
	left: number = 0;
	top: number = 0;

	EReportScoreTooltipPosition = EReportScoreTooltipPosition;

	constructor(public reportDataSvc: ReportDataService) {}

	ngOnInit(): void {}
}
