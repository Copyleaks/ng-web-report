import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { EReportScoreTooltipView, EReportViewType } from '../../../enums/copyleaks-web-report.enums';
import { ReportDataService } from '../../../services/report-data.service';

@Component({
	selector: 'cr-assessment-tool-tab-score-panel',
	templateUrl: './cr-assessment-tool-tab-score-panel.component.html',
	styleUrls: ['./cr-assessment-tool-tab-score-panel.component.scss'],
})
export class CrAssessmentToolTabScorePanelComponent implements OnInit, OnChanges {
	/**
	 * @Input {boolean} Flag indicating whether to show the report AI tab or not.
	 */
	@Input() selectedTap: EReportViewType | undefined = EReportViewType.PlagiarismView;

	/**
	 * Flag indicating whether the view is a mobile or not.
	 */
	@Input() isMobile: boolean;

	/**
	 * @Input {boolean} Flag indicating whether to show the report AI tab or not.
	 */
	@Input() wordsTotal: number = 0;

	/**
	 * @Input {boolean} Flag indicating whether to show the report AI tab or not.
	 */
	@Input() identicalTotal: number = 0;

	/**
	 * @Input {boolean} Flag indicating whether to show the report AI tab or not.
	 */
	@Input() minorChangesTotal: number = 0;

	/**
	 * @Input {boolean} Flag indicating whether to show the report AI tab or not.
	 */
	@Input() paraphrasedTotal: number = 0;

	/**
	 * @Input {boolean} Flag indicating whether to show the report AI tab or not.
	 */
	@Input() excludedTotal: number = 0;

	/**
	 * @Input {number} The report plagiarism score.
	 */
	@Input() plagarismScore: number = 0;

	/**
	 * @Input {number} The report AI score.
	 */
	@Input() aiScore: number = 0;

	/**
	 * @Input {number} The report Writing Feedback score.
	 */
	@Input() writingFeedbackScore: number = 0;

	/**
	 * @Input {number} The report Writing Feedback total issues.
	 */
	@Input() totalWritingFeedbackIssues: number = 0;

	/**
	 * @Input {boolean} Flag indicating whether to show the loading view or not.
	 */
	@Input() showLoadingView: boolean = false;

	expanded: boolean = false;
	totalAiWords: number = 0;
	totalHumanWords: number = 0;

	EXPAND_TOOLTIP = $localize`Expand`;
	COLLAPSE_TOOLTIP = $localize`Collapse`;
	MATCHED_TEXT_TITLE = $localize`Matched Text`;
	AI_CONTENT_TITLE = $localize`AI Content `;

	EReportScoreTooltipView = EReportScoreTooltipView;
	EReportViewType = EReportViewType;

	constructor(public reportDataSvc: ReportDataService) {}

	ngOnInit(): void {}

	ngOnChanges(_: SimpleChanges): void {
		this.totalAiWords = Math.ceil(this.aiScore * ((this.wordsTotal ?? 0) - (this.excludedTotal ?? 0)));
		this.totalHumanWords = Math.ceil((this.wordsTotal ?? 0) - (this.excludedTotal ?? 0) - (this.totalAiWords ?? 0));
	}

	expandedChange(event): void {
		setTimeout(() => {
			this.expanded = event;
		}, 100);
	}
	expandAccordion() {
		this.expanded = true;
	}
}
