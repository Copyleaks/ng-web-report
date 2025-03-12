import { Component, Input, OnInit } from '@angular/core';
import { EReportScoreTooltipPosition, EReportScoreTooltipView } from '../../enums/copyleaks-web-report.enums';
import { IReportScoreTooltipModel } from '../../models/report-view.models';
import { trigger, state, transition, animate, style } from '@angular/animations';
import { ReportViewService } from '../../services/report-view.service';

@Component({
	selector: 'cr-report-score-tooltip-content',
	templateUrl: './cr-report-score-tooltip-content.component.html',
	styleUrls: ['./cr-report-score-tooltip-content.component.scss'],
	animations: [trigger('fade', [state('void', style({ opacity: 0 })), transition('void <=> *', animate(300))])],
})
export class CrReportScoreTooltipContentComponent implements OnInit {
	@Input() scoreStats: IReportScoreTooltipModel | null = null;
	@Input() viewType: EReportScoreTooltipView = EReportScoreTooltipView.Tooltip;
	@Input() reportViewService: ReportViewService;

	position: EReportScoreTooltipPosition = EReportScoreTooltipPosition.DEFAULT;
	left: number = 0;
	top: number = 0;

	EReportScoreTooltipPosition = EReportScoreTooltipPosition;
	EReportScoreTooltipView = EReportScoreTooltipView;

	constructor() {}

	ngOnInit(): void {}
}
