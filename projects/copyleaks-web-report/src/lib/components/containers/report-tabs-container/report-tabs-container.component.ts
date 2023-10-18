import { Component, Input, OnInit } from '@angular/core';
import { EReportViewType } from '../../../enums/copyleaks-web-report.enums';
import { ReportViewService } from '../../../services/report-view.service';
import { ALERTS } from '../../../constants/report-alerts.constants';

@Component({
	selector: 'copyleaks-report-tabs-container',
	templateUrl: './report-tabs-container.component.html',
	styleUrls: ['./report-tabs-container.component.scss'],
})
export class ReportTabsContainerComponent implements OnInit {
	/**
	 * @Input {boolean} Flag indicating whether to show the report AI tab or not.
	 */
	@Input() selectedTap: EReportViewType = EReportViewType.PlagiarismView;

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
	 * @Input {boolean} Flag indicating whether to show the report Plagiarism tab or not.
	 */
	@Input() plagarismScore: number = 0;

	/**
	 * @Input {boolean} Flag indicating whether to show the report AI tab or not.
	 */
	@Input() aiScore: number = 0;

	/**
	 * @Input {boolean} Flag indicating whether to show the report Plagiarism tab or not.
	 */
	@Input() hidePlagarismTap = false;

	/**
	 * @Input {boolean} Flag indicating whether to show the report AI tab or not.
	 */
	@Input() hideAiTap = false;

	EReportViewType = EReportViewType;

	constructor(private _reportViewSvc: ReportViewService) {}

	ngOnInit(): void {}

	selectTap(selectedTab: EReportViewType) {
		this.selectedTap = selectedTab;

		switch (selectedTab) {
			case EReportViewType.AIView:
				this._reportViewSvc.reportViewMode$.next({
					...this._reportViewSvc.reportViewMode,
					viewMode: 'one-to-many',
					isHtmlView: false,
					alertCode: ALERTS.SUSPECTED_AI_TEXT_DETECTED,
				});
				this._reportViewSvc.selectedAlert$.next(ALERTS.SUSPECTED_AI_TEXT_DETECTED);

				break;
			case EReportViewType.PlagiarismView:
				this._reportViewSvc.reportViewMode$.next({
					...this._reportViewSvc.reportViewMode,
					viewMode: 'one-to-many',
					isHtmlView: false,
					alertCode: undefined,
				});
				this._reportViewSvc.selectedAlert$.next(null);
				break;
			default:
				break;
		}
	}
}
