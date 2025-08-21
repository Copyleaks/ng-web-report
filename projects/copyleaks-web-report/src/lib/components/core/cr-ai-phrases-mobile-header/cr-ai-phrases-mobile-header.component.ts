import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ReportMatchesService } from '../../../services/report-matches.service';
import { AIExplainResultItem, EProportionType, ExplainableAIResults } from '../../../models/report-matches.models';
import { ReportViewService } from '../../../services/report-view.service';
import { ReportDataService } from '../../../services/report-data.service';

@Component({
	selector: 'cr-ai-phrases-mobile-header',
	templateUrl: './cr-ai-phrases-mobile-header.component.html',
	styleUrls: ['./cr-ai-phrases-mobile-header.component.scss'],
	standalone: false,
})
export class CrAiPhrasesMobileHeaderComponent implements OnInit, OnChanges {
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

	explainResults: AIExplainResultItem[] = [];
	explainItemResults: AIExplainResultItem[] = [];

	barTooltipText: string = '';
	minProportion: number = 0;
	maxProportion: number = 0;
	minGradeBar: number = 0;
	maxGradeBar: number = 0;
	midGradeBar: number = 0;
	hasInfinityResult: boolean = false;
	proportions: number[] = [];
	emptyView: boolean = false;
	aiInsightAlert: boolean = false;
	alertTitle: string;
	alertMessage: string;
	title: string;
	infoTooltipText: string;
	proportionTooltipText: string;
	resultTooltipText: string;
	updateResult: boolean = false;

	constructor(
		private _reportMatchesSvc: ReportMatchesService,
		public reportViewSvc: ReportViewService,
		private _reportDataSvc: ReportDataService
	) {}

	ngOnInit(): void {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isLoading']?.currentValue == false) {
			this._initResults();
		}
	}

	onBackClick() {
		this._reportMatchesSvc.showAIPhrases$.next(false);
		this.reportViewSvc.reportViewMode$.next({
			...this.reportViewSvc.reportViewMode,
			showAIPhrases: false,
		});
	}

	public isPlagiarismEnabled(): boolean {
		return this._reportDataSvc.isPlagiarismEnabled();
	}

	public isAiSourceMatchEnabled(): boolean {
		return this._reportDataSvc.isAiSourceMatchEnabled();
	}

	private _initResults() {
		if (!this.updateResult) {
			this._updateTooltipText();
			if (this.explainableAIResults?.explain && this.explainableAIResults?.slicedMatch.length > 0) {
				this.title = $localize`AI Insights`;
				this._mapingtoResultItem();
				this._updateProportionRange();
			} else if (!this.lockedResults) {
				this.emptyView = true;
				// If the AI insights are empty, check if there is an AI alert
				this.aiInsightAlert = !!this.explainableAIResults?.aiScanAlert;
				if (this.aiInsightAlert) {
					this.alertTitle = this.explainableAIResults?.aiScanAlert?.title;
					this.alertMessage = this.explainableAIResults?.aiScanAlert?.message;
				}
			}
			this.updateResult = true;
		}
	}

	/**
	 * Update the tooltip text
	 */
	private _updateTooltipText() {
		this.infoTooltipText = $localize`Learn more about AI Insights`;
		this.proportionTooltipText = $localize`The ratio represents how many times on average AI would use the phrase compared to how many times on average a human would use this phrase.`;
		this.resultTooltipText = $localize`Our dataset consists of millions of documents containing both AI and human written text. Here, we are showing the results normalized per 1M texts for an easier interpretation of the data shown.`;
		this.barTooltipText = $localize`The darker the color, the more frequently the phrase is used by AI compared to a human.`;
	}

	/**
	 * Update the bar score
	 */
	private _updateProportionRange(): void {
		this.proportions = this.explainResults?.map(result => result.proportion) ?? [];
		const proportionsFiltered = this.proportions.filter(p => p > 0);
		this.minProportion = Number(Math.min(...proportionsFiltered).toFixed(0));
		this.maxProportion = Number(Math.max(...proportionsFiltered).toFixed(0));
		this.hasInfinityResult = this.proportions.some(p => p == -1);
		this.minGradeBar = this._getGradePercentByPropoType(EProportionType.Low);
		this.midGradeBar = this._getGradePercentByPropoType(EProportionType.Medium);
		this.maxGradeBar = this._getGradePercentByPropoType(EProportionType.High);
	}

	/**
	 * Get the grade percent in bar score by proportion type
	 * @param type
	 * @returns Number
	 */
	private _getGradePercentByPropoType(type: EProportionType): number {
		const grade =
			(this.explainResults?.filter(result => result.proportionType == type)?.length / this.proportions.length) * 100;
		return Number(grade.toFixed(0));
	}

	/**
	 * Mapping the result to AIExplainResultItem
	 */
	private _mapingtoResultItem() {
		this.explainableAIResults.explain.patterns.statistics.proportion.forEach((item, index) => {
			const wordStart = this.explainableAIResults?.explain?.patterns?.text?.chars.starts[index];
			const wordEnd = this.explainableAIResults?.explain?.patterns?.text?.chars.lengths[index] + wordStart;
			const content = this.explainableAIResults?.sourceText.substring(wordStart, wordEnd);
			const slicedMatchResult = this.explainableAIResults.slicedMatch.find(result => result.match.start === wordStart);

			if (slicedMatchResult?.content) {
				this.explainResults.push({
					content: content,
					proportionType: slicedMatchResult.match.proportionType,
					aiCount: Number(this.explainableAIResults.explain.patterns.statistics.aiCount[index]),
					humanCount: Number(this.explainableAIResults.explain.patterns.statistics.humanCount[index]),
					proportion: Number(item.toFixed(0)),
					isInfinity: item == -1,
					start: this.explainableAIResults.explain.patterns.text.chars.starts[index],
					end: this.explainableAIResults.explain.patterns.text.chars.lengths[index] + wordStart,
				});
			}
		});
		this.explainItemResults = this.explainResults.sort((a, b) => {
			if (a.proportion === -1) return -1;
			if (b.proportion === -1) return 1;
			return b.proportion - a.proportion;
		});
		this.explainItemResults = [...this.explainResults];
	}
}
