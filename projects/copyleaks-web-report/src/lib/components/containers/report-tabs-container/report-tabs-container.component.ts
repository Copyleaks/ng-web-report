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
import { EReportMode, EReportScoreTooltipPosition, EReportViewType } from '../../../enums/copyleaks-web-report.enums';
import { ReportViewService } from '../../../services/report-view.service';
import { ALERTS } from '../../../constants/report-alerts.constants';
import { ReportNgTemplatesService } from '../../../services/report-ng-templates.service';
import { untilDestroy } from '../../../utils/until-destroy';
import { ReportMatchHighlightService } from '../../../services/report-match-highlight.service';
import { ReportDataService } from '../../../services/report-data.service';
import { trigger, state, transition, animate, style } from '@angular/animations';
import { ECustomResultsReportView } from '../../core/cr-custom-results/models/cr-custom-results.enums';
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
	 * @Input {boolean} Flag indicating whether to show the report Plagiarism tab or not.
	 */
	@Input() hidePlagarismTap = false;

	/**
	 * @Input {boolean} Flag indicating whether to show the report AI tab or not.
	 */
	@Input() hideAiTap = false;

	/**
	 * @Input {boolean} Flag indicating whether to show the report Writing Feedback tab or not.
	 */
	@Input() hideWritingFeedbackTap = false;

	/**
	 * @Input {boolean} Flag indicating whether to show the loading view or not.
	 */
	@Input() showLoadingView = false;

	/**
	 * @Input {boolean} - Flag indicating whether to still show the disabled products tabs.
	 */
	@Input() showDisabledProducts: boolean = false;

	/**
	 * @Input {number} - The current scan progress percentage.
	 */
	@Input() loadingProgressPct: number = 0;

	/**
	 * @Input {string} - Link for the company logo image to display in the tabs panel.
	 */
	@Input() companyLogo: string = null;

	/**
	 * @Input {string} - Flag indicating whether to show the Writing Feedback tab with total number of issues or not (with score percentage).
	 */
	@Input() showWritingFeedbackIssues: boolean = true;

	@Input() isMobile: boolean = false;

	/**
	 * @Input {boolean} Flag indicating whether to force the Writing Feedback tab to hide or not.
	 */
	@Input() forceWritingFeedbackTapHide = false;

	@Input() reportMode: EReportMode;
	EReportMode = EReportMode;

	EReportViewType = EReportViewType;
	EReportScoreTooltipPosition = EReportScoreTooltipPosition;
	customTabsTemplateRef: TemplateRef<any>[] | undefined = undefined;

	// constants
	DISABLED: string = $localize`Disabled`;

	totalAiWords: number = 0;
	totalHumanWords: number = 0;

	plagarismScoreChartColorScheme = {
		domain: ['#fd7366', '#ffb1b1', '#fed5a9', '#EBF3F5'],
	};

	aiScoreChartColorScheme = {
		domain: ['#c1addc', '#EBF3F5'],
	};

	plagarismScoreChartData = [];

	aiScoreChartData = [];

	constructor(
		public reportViewSvc: ReportViewService,
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

		this.reportViewSvc.selectedCustomTabContent$.pipe(untilDestroy(this)).subscribe(content => {
			this.selectedTap = content ? EReportViewType.CustomTabView : this.selectedTap;
		});
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (
			'showDisabledProducts' in changes ||
			'hidePlagarismTap' in changes ||
			'hideAiTap' in changes ||
			'hideWritingFeedbackTap' in changes ||
			('showLoadingView' in changes && changes['showLoadingView'].currentValue === false)
		) {
			if (
				(!this.showLoadingView &&
					this.showDisabledProducts &&
					!this.hidePlagarismTap &&
					this.hideAiTap &&
					this.hideWritingFeedbackTap) ||
				(!this.showLoadingView && !this.hidePlagarismTap && this.hideAiTap && this.hideWritingFeedbackTap)
			) {
				this.selectedTap = EReportViewType.PlagiarismView;
				this.reportViewSvc.selectedAlert$.next(null);
				this.reportViewSvc.reportViewMode$.next({ ...this.reportViewSvc.reportViewMode, alertCode: undefined });
			}

			if (
				!this.showLoadingView &&
				this.hidePlagarismTap &&
				!this.hideAiTap &&
				!(this.selectedTap === EReportViewType.WritingFeedbackTabView && !this.hideWritingFeedbackTap)
			) {
				this.selectedTap = EReportViewType.AIView;
				this.reportViewSvc.selectedAlert$.next(ALERTS.SUSPECTED_AI_TEXT_DETECTED);
				this.reportViewSvc.reportViewMode$.next({
					...this.reportViewSvc.reportViewMode,
					viewMode:
						this._reportNgTemplatesSvc.reportTemplatesMode$.value != ECustomResultsReportView.Full &&
						this._reportNgTemplatesSvc.reportTemplatesMode$.value != ECustomResultsReportView.Partial &&
						this.hideWritingFeedbackTap
							? 'only-ai'
							: 'one-to-many',
					alertCode: ALERTS.SUSPECTED_AI_TEXT_DETECTED,
				});
			}

			if (!this.showLoadingView && this.hidePlagarismTap && this.hideAiTap && !this.hideWritingFeedbackTap) {
				this.selectedTap = EReportViewType.WritingFeedbackTabView;
				this.reportViewSvc.selectedAlert$.next(null);

				this.reportViewSvc.reportViewMode$.next({
					...this.reportViewSvc.reportViewMode,
					alertCode: undefined,
					viewMode: 'writing-feedback',
				});
			}

			if (
				!this.showLoadingView &&
				this.hideWritingFeedbackTap &&
				this.selectedTap === EReportViewType.WritingFeedbackTabView
			) {
				this.selectedTap = !this.hidePlagarismTap
					? EReportViewType.PlagiarismView
					: !this.hideAiTap
					? EReportViewType.AIView
					: null;

				this.reportViewSvc.reportViewMode$.next({
					...this.reportViewSvc.reportViewMode,
					viewMode:
						this._reportNgTemplatesSvc.reportTemplatesMode$.value != ECustomResultsReportView.Full &&
						this._reportNgTemplatesSvc.reportTemplatesMode$.value != ECustomResultsReportView.Partial &&
						this.hidePlagarismTap
							? 'only-ai'
							: 'one-to-many',
					alertCode: !this.hidePlagarismTap
						? undefined
						: !this.hideAiTap
						? ALERTS.SUSPECTED_AI_TEXT_DETECTED
						: undefined,
				});
				this.reportViewSvc.selectedAlert$.next(
					!this.hidePlagarismTap ? null : !this.hideAiTap ? ALERTS.SUSPECTED_AI_TEXT_DETECTED : null
				);
			}
		}

		if (this.isMobile && 'selectedTap' in changes) this._updateSelectedTabColors();

		this.totalAiWords = Math.ceil(this.aiScore * ((this.wordsTotal ?? 0) - (this.excludedTotal ?? 0)));
		this.totalHumanWords = Math.ceil((this.wordsTotal ?? 0) - (this.excludedTotal ?? 0) - (this.totalAiWords ?? 0));

		if (
			this.isMobile &&
			('aiScore' in changes ||
				'paraphrasedTotal' in changes ||
				'minorChangesTotal' in changes ||
				'identicalTotal' in changes ||
				'wordsTotal' in changes ||
				('showLoadingView' in changes && changes['showLoadingView'].currentValue === false))
		) {
			setTimeout(() => {
				this.plagarismScoreChartData = [
					{
						name: 'Identical',
						value: this.identicalTotal,
					},
					{
						name: 'Minor Changes',
						value: this.minorChangesTotal,
					},
					{
						name: 'Paraphrased',
						value: this.paraphrasedTotal,
					},
					{
						name: 'Left',
						value:
							this.wordsTotal -
							this.excludedTotal -
							this.identicalTotal -
							this.minorChangesTotal -
							this.paraphrasedTotal,
					},
				];

				this.aiScoreChartData = [
					{
						name: 'AI',
						value: this.totalAiWords,
					},
					{
						name: 'Human',
						value: this.wordsTotal - this.totalAiWords,
					},
				];
			});
		}
	}

	selectTap(selectedTab: EReportViewType) {
		if (
			selectedTab == this.selectedTap ||
			(selectedTab === EReportViewType.PlagiarismView && this.hidePlagarismTap && this.showDisabledProducts) ||
			(selectedTab === EReportViewType.AIView && this.hideAiTap && this.showDisabledProducts) ||
			(selectedTab === EReportViewType.WritingFeedbackTabView &&
				this.hideWritingFeedbackTap &&
				this.showDisabledProducts) ||
			this.loadingProgressPct != 100
		)
			return;

		this.selectedTap = selectedTab;
		this._matchSvc.clear();

		switch (selectedTab) {
			case EReportViewType.AIView:
				this.reportViewSvc.reportViewMode$.next({
					...this.reportViewSvc.reportViewMode,
					viewMode:
						!this.reportDataSvc.isPlagiarismEnabled() &&
						!this.reportDataSvc.isWritingFeedbackEnabled() &&
						!this.showDisabledProducts &&
						this._reportNgTemplatesSvc.reportTemplatesMode$.value != ECustomResultsReportView.Full &&
						this._reportNgTemplatesSvc.reportTemplatesMode$.value != ECustomResultsReportView.Partial
							? 'only-ai'
							: 'one-to-many',
					isHtmlView: false,
					alertCode: ALERTS.SUSPECTED_AI_TEXT_DETECTED,
					sourcePageIndex: 1,
					suspectPageIndex: 1,
				});
				this.reportViewSvc.selectedAlert$.next(ALERTS.SUSPECTED_AI_TEXT_DETECTED);
				this.reportViewSvc.selectedCustomTabContent$.next(null);
				this.reportViewSvc.selectedCustomTabResultSectionContent$.next(null);

				break;
			case EReportViewType.PlagiarismView:
				this.reportViewSvc.reportViewMode$.next({
					...this.reportViewSvc.reportViewMode,
					viewMode: 'one-to-many',
					alertCode: undefined,
					sourcePageIndex: 1,
					suspectPageIndex: 1,
				});
				this.reportViewSvc.selectedAlert$.next(null);
				this.reportViewSvc.selectedCustomTabContent$.next(null);
				this.reportViewSvc.selectedCustomTabResultSectionContent$.next(null);
				break;
			case EReportViewType.WritingFeedbackTabView:
				this.reportViewSvc.reportViewMode$.next({
					...this.reportViewSvc.reportViewMode,
					viewMode: 'writing-feedback',
					alertCode: undefined,
					sourcePageIndex: 1,
					suspectPageIndex: 1,
				});
				this.reportViewSvc.selectedAlert$.next(null);
				this.reportViewSvc.selectedCustomTabContent$.next(null);
				this.reportViewSvc.selectedCustomTabResultSectionContent$.next(null);
				break;
			default:
				break;
		}
	}

	private _updateSelectedTabColors() {
		switch (this.selectedTap) {
			case EReportViewType.AIView:
				this.plagarismScoreChartColorScheme = {
					domain: ['#fd7366', '#ffb1b1', '#fed5a9', '#FBFFFF'],
				};
				this.aiScoreChartColorScheme = {
					domain: ['#c1addc', '#EBF3F5'],
				};
				break;
			case EReportViewType.PlagiarismView:
				this.plagarismScoreChartColorScheme = {
					domain: ['#fd7366', '#ffb1b1', '#fed5a9', '#EBF3F5'],
				};
				this.aiScoreChartColorScheme = {
					domain: ['#c1addc', '#FBFFFF'],
				};
				break;
			case EReportViewType.WritingFeedbackTabView:
				this.plagarismScoreChartColorScheme = {
					domain: ['#fd7366', '#ffb1b1', '#fed5a9', '#FBFFFF'],
				};
				this.aiScoreChartColorScheme = {
					domain: ['#c1addc', '#FBFFFF'],
				};
				break;
			default:
				break;
		}
	}

	ngOnDestroy(): void {}
}
