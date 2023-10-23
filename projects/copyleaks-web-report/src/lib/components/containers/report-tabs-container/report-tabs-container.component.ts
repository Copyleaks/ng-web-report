import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { EReportScoreTooltipPosition, EReportViewType } from '../../../enums/copyleaks-web-report.enums';
import { ReportViewService } from '../../../services/report-view.service';
import { ALERTS } from '../../../constants/report-alerts.constants';
import { ReportNgTemplatesService } from '../../../services/report-ng-templates.service';
import { untilDestroy } from '../../../utils/until-destroy';

@Component({
	selector: 'copyleaks-report-tabs-container',
	templateUrl: './report-tabs-container.component.html',
	styleUrls: ['./report-tabs-container.component.scss'],
})
export class ReportTabsContainerComponent implements OnInit, OnDestroy {
	/**
	 * @Input {boolean} Flag indicating whether to show the report AI tab or not.
	 */
	@Input() selectedTap: EReportViewType | undefined = EReportViewType.PlagiarismView;

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
	EReportScoreTooltipPosition = EReportScoreTooltipPosition;
	customTabsTemplateRef: TemplateRef<any>[] | undefined = undefined;

	constructor(
		private _reportViewSvc: ReportViewService,
		private _reportNgTemplatesSvc: ReportNgTemplatesService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this._reportNgTemplatesSvc.reportTemplatesSubject$.pipe(untilDestroy(this)).subscribe(refs => {
			if (refs?.customTabsTemplates !== undefined && this.customTabsTemplateRef == undefined) {
				this.customTabsTemplateRef = refs?.customTabsTemplates?.map(
					ctt => ctt.customTabTitleTemplates as TemplateRef<any>
				);
				this.cdr.detectChanges();
			}
		});

		this._reportViewSvc.selectedCustomTabContent$.pipe(untilDestroy(this)).subscribe(content => {
			this.selectedTap = content ? EReportViewType.CustomTabView : this.selectedTap;
		});
	}

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
				this._reportViewSvc.selectedCustomTabContent$.next(null);

				break;
			case EReportViewType.PlagiarismView:
				this._reportViewSvc.reportViewMode$.next({
					...this._reportViewSvc.reportViewMode,
					viewMode: 'one-to-many',
					isHtmlView: false,
					alertCode: undefined,
				});
				this._reportViewSvc.selectedAlert$.next(null);
				this._reportViewSvc.selectedCustomTabContent$.next(null);
				break;
			default:
				break;
		}
	}

	ngOnDestroy(): void {}
}
