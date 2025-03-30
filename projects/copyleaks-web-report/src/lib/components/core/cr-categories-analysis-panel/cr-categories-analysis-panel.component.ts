import {
	Component,
	EventEmitter,
	HostBinding,
	Input,
	OnChanges,
	OnInit,
	Output,
	SimpleChanges,
	TemplateRef,
} from '@angular/core';
import { getCorrectionCategoryTitle, getCorrectionTypeTitle, getResultsTypeTitle } from '../../../utils/enums-helpers';
import {
	EReportViewType,
	EResultPreviewType,
	EWritingFeedbackCategories,
	EWritingFeedbackTypes,
} from '../../../enums/copyleaks-web-report.enums';
import {
	IMatchesCategoryStatistics,
	IMatchesTypeStatistics,
	IWritingFeedbackTypeStatistics,
} from '../../../models/report-statistics.models';

@Component({
	selector: 'cr-categories-analysis-panel',
	templateUrl: './cr-categories-analysis-panel.component.html',
	styleUrls: ['./cr-categories-analysis-panel.component.scss'],
})
export class CrCategoriesAnalysisTypePanelComponent implements OnInit, OnChanges {
	@HostBinding('style.display')
	displayProp: string;

	/**
	 * Flag indicating whether the view is a mobile or not.
	 */
	@Input() isMobile: boolean;

	/**
	 * The selected view type.
	 */
	@Input() selectedView: EReportViewType;

	/**
	 * The statistics for the writing feedback type.
	 */
	@Input() writingFeedbackStats: IWritingFeedbackTypeStatistics;

	/**
	 * The statistics for the writing feedback type.
	 */
	@Input() matchesStats: IMatchesTypeStatistics;

	/**
	 * The template for the custom AI source match upgrade.
	 */
	@Input() customAISourceMatchUpgradeTemplate: TemplateRef<any> | undefined = undefined;

	/**
	 * Event emitted when a category is selected.
	 */
	@Output() selectCategory = new EventEmitter<EWritingFeedbackCategories | IMatchesCategoryStatistics>();

	/**
	 * The total number of corrections.
	 */
	totalCorrections: number = 0;

	expanded: boolean = false;

	EReportViewType = EReportViewType;
	EResultPreviewType = EResultPreviewType;

	EXPAND_TOOLTIP = $localize`Expand`;
	COLLAPSE_TOOLTIP = $localize`Collapse`;

	constructor() {}

	/**
	 * Lifecycle hook that is called when any data-bound property of the component changes.
	 * @param changes - The changed properties.
	 */
	ngOnChanges(changes: SimpleChanges): void {
		if (changes['writingFeedbackStats']) {
			this.totalCorrections = 0;
			this.writingFeedbackStats.categories.forEach(c => {
				this.totalCorrections += c?.totalIssues ?? 0;
			});
			if (this.totalCorrections === 0) this.displayProp = 'none';
			else this.displayProp = 'flex';

			// sort the writingFeedbackStats categories by the number of issues
			this.writingFeedbackStats.categories.sort((a, b) => b.totalIssues - a.totalIssues);
		}
		if (changes['matchesStats']) {
			if (
				(this.matchesStats?.totalResults === 0 || this.matchesStats?.categories?.length === 0) &&
				this.matchesStats.type !== EResultPreviewType.AISourceMatchUpgrade
			)
				this.displayProp = 'none';
			else this.displayProp = 'flex';

			// sort the matchesStats categories by the number of issues
			this.matchesStats.categories.sort((a, b) => b.totalResults - a.totalResults);
		}
	}

	ngOnInit(): void {}

	/**
	 * Gets the title for the correction category.
	 * @param type - The correction category type.
	 * @returns The title of the correction category.
	 */
	getCorrectionCategoryTitle(type: EWritingFeedbackCategories): string {
		return getCorrectionCategoryTitle(type);
	}

	/**
	 * Gets the title for the correction type.
	 * @param type - The correction type.
	 * @returns The title of the correction type.
	 */
	getCorrectionTypeTitle(type: EWritingFeedbackTypes): string {
		return getCorrectionTypeTitle(type);
	}

	/**
	 * Gets the title for the result type.
	 * @param type - The resul type.
	 * @returns The title of the result type.
	 */
	getResultsTypeTitle(type: EResultPreviewType): string {
		return getResultsTypeTitle(type);
	}

	/**
	 * Handles the selection of a category.
	 * @param type - The selected category type.
	 */
	onSelectCategory(type: EWritingFeedbackCategories | IMatchesCategoryStatistics, event?: KeyboardEvent): void {
		if (!event || event.key === 'Enter') this.selectCategory.emit(type);
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
