import {
	Component,
	ElementRef,
	EventEmitter,
	HostBinding,
	Input,
	OnChanges,
	OnInit,
	Output,
	SimpleChanges,
	TemplateRef,
	ViewChild,
} from '@angular/core';
import { getCorrectionCategoryTitle, getCorrectionTypeTitle, getResultsTypeTitle } from '../../../utils/enums-helpers';
import {
	EPlatformType,
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
import { ReportViewService } from '../../../services/report-view.service';

@Component({
	selector: 'cr-categories-analysis-panel',
	templateUrl: './cr-categories-analysis-panel.component.html',
	styleUrls: ['./cr-categories-analysis-panel.component.scss'],
	standalone: false,
})
export class CrCategoriesAnalysisTypePanelComponent implements OnInit, OnChanges {
	@HostBinding('style.display')
	displayProp: string;

	@ViewChild('actionsContainer', { static: false }) actionsContainer: ElementRef;

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
	EPlatformType = EPlatformType;

	EXPAND_TOOLTIP = $localize`Expand`;
	COLLAPSE_TOOLTIP = $localize`Collapse`;
	AI_SOURCE_MATCH_TOOLTIP = $localize`AI Source Match blends plagiarism and AI detection to identify reused or repurposed AI-generated content from other sources.`;

	private mutationObserver!: MutationObserver;

	constructor(public reportViewSvc: ReportViewService) {}

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

		if (changes['customAISourceMatchUpgradeTemplate'] && this.customAISourceMatchUpgradeTemplate) {
			this.refreshDisplayState();
		}
	}

	ngOnInit(): void {}

	ngAfterViewInit(): void {
		if (this.actionsContainer) {
			this.mutationObserver = new MutationObserver(mutations => {
				for (const mutation of mutations) {
					if (mutation.type === 'childList') {
						if (this.customAISourceMatchUpgradeTemplate) this.refreshDisplayState();
					}
				}
			});

			this.mutationObserver.observe(this.actionsContainer.nativeElement, {
				childList: true,
				subtree: true,
			});
		}
	}

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

	get isCustomTemplateNotEmpty() {
		const containerDiv = this.actionsContainer?.nativeElement;
		return containerDiv?.children?.length > 0;
	}

	refreshDisplayState() {
		setTimeout(() => {
			if (this.isCustomTemplateNotEmpty) this.displayProp = 'flex';
			else this.displayProp = 'none';
		});
	}
}
