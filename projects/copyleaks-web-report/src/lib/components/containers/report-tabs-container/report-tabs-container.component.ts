import {
	ChangeDetectorRef,
	Component,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	SimpleChanges,
	TemplateRef,
} from '@angular/core';
import { EReportScoreTooltipPosition, EReportViewType } from '../../../enums/copyleaks-web-report.enums';
import { ReportViewService } from '../../../services/report-view.service';
import { ALERTS } from '../../../constants/report-alerts.constants';
import { ReportNgTemplatesService } from '../../../services/report-ng-templates.service';
import { untilDestroy } from '../../../utils/until-destroy';
import { ReportMatchHighlightService } from '../../../services/report-match-highlight.service';
import { ReportDataService } from '../../../services/report-data.service';
import { trigger, state, transition, animate, style } from '@angular/animations';

@Component({
	selector: 'copyleaks-report-tabs-container',
	templateUrl: './report-tabs-container.component.html',
	styleUrls: ['./report-tabs-container.component.scss'],
	animations: [
		trigger('fadeIn', [
			state('void', style({ opacity: 0 })),
			transition(':enter', [animate('0.5s ease-in', style({ opacity: 1 }))]),
		]),
	],
})
export class ReportTabsContainerComponent implements OnInit, OnDestroy, OnChanges {
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
	 * @Input {boolean} Flag indicating whether to show the report AI tab or not.
	 */
	@Input() excludedTotal: number = 0;

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

	/**
	 * @Input {boolean} Flag indicating whether to show the loading view or not.
	 */
	@Input() showLoadingView = false;

	/**
	 * @Input {boolean} - Flag indicating whether to still show the disabled products tabs.
	 */
	@Input() showDisabledProducts: boolean = false;

	/**
	 * @Input {boolean} - Flag indicating whether to still show the disabled products tabs.
	 */
	@Input() loadingProgressPct: number = 0;

	EReportViewType = EReportViewType;
	EReportScoreTooltipPosition = EReportScoreTooltipPosition;
	customTabsTemplateRef: TemplateRef<any>[] | undefined = undefined;

	// constants
	DISABLED: string = $localize`Disabled`;

	constructor(
		private _reportViewSvc: ReportViewService,
		public reportDataSvc: ReportDataService,
		private _reportNgTemplatesSvc: ReportNgTemplatesService,
		private cdr: ChangeDetectorRef,
		private _matchSvc: ReportMatchHighlightService
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

	ngOnChanges(changes: SimpleChanges): void {
		if (
			'showDisabledProducts' in changes ||
			'hidePlagarismTap' in changes ||
			'hideAiTap' in changes ||
			('showLoadingView' in changes && changes['showLoadingView'].currentValue === false)
		) {
			if (!this.showLoadingView && this.showDisabledProducts && this.hideAiTap) {
				this.selectedTap = EReportViewType.PlagiarismView;
				this._reportViewSvc.selectedAlert$.next(null);
				this._reportViewSvc.reportViewMode$.next({ ...this._reportViewSvc.reportViewMode, alertCode: undefined });
			}
			if (!this.showLoadingView && this.hidePlagarismTap && !this.hideAiTap) {
				this.selectedTap = EReportViewType.AIView;
				this._reportViewSvc.selectedAlert$.next(ALERTS.SUSPECTED_AI_TEXT_DETECTED);
				this._reportViewSvc.reportViewMode$.next({
					...this._reportViewSvc.reportViewMode,
					viewMode: this.showDisabledProducts ? 'one-to-many' : 'only-ai',
					alertCode: ALERTS.SUSPECTED_AI_TEXT_DETECTED,
				});
			}
		}
	}

	selectTap(selectedTab: EReportViewType) {
		if (
			selectedTab == this.selectedTap ||
			(selectedTab === EReportViewType.PlagiarismView && this.hidePlagarismTap && this.showDisabledProducts) ||
			(selectedTab === EReportViewType.AIView && this.hideAiTap && this.showDisabledProducts) ||
			this.loadingProgressPct != 100
		)
			return;

		this.selectedTap = selectedTab;
		this._matchSvc.clear();

		switch (selectedTab) {
			case EReportViewType.AIView:
				this._reportViewSvc.reportViewMode$.next({
					...this._reportViewSvc.reportViewMode,
					viewMode: !this.reportDataSvc.isPlagiarismEnabled() && !this.showDisabledProducts ? 'only-ai' : 'one-to-many',
					isHtmlView: false,
					alertCode: ALERTS.SUSPECTED_AI_TEXT_DETECTED,
					sourcePageIndex: 1,
					suspectPageIndex: 1,
				});
				this._reportViewSvc.selectedAlert$.next(ALERTS.SUSPECTED_AI_TEXT_DETECTED);
				this._reportViewSvc.selectedCustomTabContent$.next(null);

				break;
			case EReportViewType.PlagiarismView:
				this._reportViewSvc.reportViewMode$.next({
					...this._reportViewSvc.reportViewMode,
					viewMode: 'one-to-many',
					alertCode: undefined,
					sourcePageIndex: 1,
					suspectPageIndex: 1,
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
