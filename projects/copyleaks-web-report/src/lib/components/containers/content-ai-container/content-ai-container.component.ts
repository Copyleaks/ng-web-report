import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { ExplainableAIResults } from '../../../models/report-matches.models';
import { ReportMatchHighlightService } from '../../../services/report-match-highlight.service';
import { ReportMatchesService } from '../../../services/report-matches.service';
import { IResultItem } from '../report-results-item-container/components/models/report-result-item.models';
import { ReportNgTemplatesService } from '../../../services/report-ng-templates.service';
import { untilDestroy } from '../../../utils/until-destroy';
import { ReportViewService } from '../../../services/report-view.service';
import { ReportDataService } from '../../../services/report-data.service';

@Component({
	selector: 'copyleaks-content-ai-container',
	templateUrl: './content-ai-container.component.html',
	styleUrls: ['./content-ai-container.component.scss'],
	standalone: false,
})
export class ContentAiContainerComponent implements OnInit, OnChanges {
	/**
	 * @Input {boolean} A flag indicating if the component is in mobile view
	 */
	@Input() isMobile: boolean = false;

	/**
	 * @Input {boolean} A flag indicating if the component is in loading state
	 */
	@Input() isLoading: boolean = false;

	/**
	 * @Input {boolean} A flag indicating if the plagiarism tab is hidden or disabled
	 */
	@Input() hidePlagarismTap: boolean = false;

	/**
	 * @Input {boolean} A flag indicating if the results are locked
	 */
	@Input() lockedResults: boolean = false;

	/**
	 * @Input {number} The total number of words in this scan
	 */
	@Input() wordsTotal: number = 0;

	/**
	 * @Input {number} The AI probability
	 */
	@Input() aiScore: number = 0;

	/**
	 * @Input {number} The total number of omitted words matched in this scan
	 */
	@Input() excludedTotal: number = 0;

	/**
	 * @Input {ExplainableAIResults} The explainable AI results
	 */
	@Input() explainableAIResults: ExplainableAIResults;

	/**
	 * @Input {(IInternetResultPreview | IDatabaseResultPreview | IRepositoryResultPreview)[]} The AI source match results
	 */
	@Input() aiSourceMatchResults: IResultItem[];

	/**
	 * @Input {boolean} A flag indicating if the AI phrases are shown
	 */
	@Input() showAIPhrases: boolean;

	/**
	 * @Input {number} The minimum AI proportion
	 */
	@Input() minAIProportion: number;

	/**
	 * {number} The AI percentage result
	 */
	aiPercentageResult: number = 0;

	customAISourceMatchUpgradeTemplate: TemplateRef<any> | undefined = undefined;

	constructor(
		private _cdr: ChangeDetectorRef,
		private _reportDataSvc: ReportDataService,
		public highlightService: ReportMatchHighlightService,
		public reportMatchesSvc: ReportMatchesService,
		public reportNgTemplatesSvc: ReportNgTemplatesService,
		public reportViewSvc: ReportViewService
	) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isLoading']?.currentValue == false) {
			this._updateAiPercentageResult();
		}
	}

	ngOnInit(): void {
		this._updateAiPercentageResult();

		this.reportNgTemplatesSvc.reportTemplatesSubject$.pipe(untilDestroy(this)).subscribe(refs => {
			if (
				refs?.customAISourceMatchUpgradeTemplate !== undefined &&
				this.customAISourceMatchUpgradeTemplate === undefined
			) {
				this.customAISourceMatchUpgradeTemplate = refs?.customAISourceMatchUpgradeTemplate;
				this._cdr.detectChanges();
			}
		});
	}

	public isAiSourceMatchEnabled(): boolean {
		return this._reportDataSvc.isAiSourceMatchEnabled();
	}

	/**
	 * Update the AI percentage result
	 */
	private _updateAiPercentageResult() {
		this.aiPercentageResult =
			this.wordsTotal - this.excludedTotal === 0
				? 0
				: Math.ceil(this.aiScore * ((this.wordsTotal ?? 0) - (this.excludedTotal ?? 0))) /
				  (this.wordsTotal - this.excludedTotal);
	}

	/**
	 * Clear the selected result
	 */
	clearSelectResult() {
		this.highlightService.clearAllMatchs();
	}

	onNavigateToPhrasesClick() {
		this.showAIPhrases = true;
	}

	onNavigateToDefaultClick() {
		this.showAIPhrases = false;
	}

	ngOnDestroy(): void {}
}
