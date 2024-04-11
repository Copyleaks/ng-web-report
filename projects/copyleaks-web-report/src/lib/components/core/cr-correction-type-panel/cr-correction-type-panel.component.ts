import { Component, EventEmitter, HostBinding, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { IWritingFeedbackTypeStatistics } from '../../../models/report-data.models';
import { getCorrectionCategoryTitle, getCorrectionTypeTitle } from '../../../utils/enums-helpers';
import { EWritingFeedbackCategories, EWritingFeedbackTypes } from '../../../enums/copyleaks-web-report.enums';

@Component({
	selector: 'cr-correction-type-panel',
	templateUrl: './cr-correction-type-panel.component.html',
	styleUrls: ['./cr-correction-type-panel.component.scss'],
})
export class CrCorrectionTypePanelComponent implements OnInit, OnChanges {
	@HostBinding('style.display')
	displayProp: string;

	/**
	 * Flag indicating whether the view is a mobile or not.
	 */
	@Input() isMobile: boolean;

	/**
	 * The statistics for the writing feedback type.
	 */
	@Input() stats: IWritingFeedbackTypeStatistics;

	/**
	 * Event emitted when a category is selected.
	 */
	@Output() selectCategory = new EventEmitter<EWritingFeedbackCategories>();

	/**
	 * The total number of corrections.
	 */
	totalCorrections: number = 0;

	EXPEND_TOOLTIP = $localize`Expend`;
	COLLAPSE_TOOLTIP = $localize`Collapse`;

	constructor() {}

	/**
	 * Lifecycle hook that is called when any data-bound property of the component changes.
	 * @param changes - The changed properties.
	 */
	ngOnChanges(changes: SimpleChanges): void {
		if (changes['stats']) {
			this.totalCorrections = 0;
			this.stats.categories.forEach(c => {
				this.totalCorrections += c?.totalIssues ?? 0;
			});
			if (this.totalCorrections === 0) this.displayProp = 'none';
			else this.displayProp = 'flex';
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
	 * Handles the selection of a category.
	 * @param type - The selected category type.
	 */
	onSelectCategory(type: EWritingFeedbackCategories): void {
		this.selectCategory.emit(type);
	}
}
