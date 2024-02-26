import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IWritingFeedbackTypeStatistics } from '../../../models/report-data.models';
import { getCorrectionCategoryTitle, getCorrectionTypeTitle } from '../../../utils/enums-helpers';
import { EWritingFeedbackCategories, EWritingFeedbackTypes } from '../../../enums/copyleaks-web-report.enums';

@Component({
	selector: 'cr-correction-type-panel',
	templateUrl: './cr-correction-type-panel.component.html',
	styleUrls: ['./cr-correction-type-panel.component.scss'],
})
export class CrCorrectionTypePanelComponent implements OnInit, OnChanges {
	/**
	 * @Input {boolean} Flag indicating whether the view is a mobile or not.
	 */
	@Input() isMobile: boolean;

	@Input() stats: IWritingFeedbackTypeStatistics;

	totalCorrections: number = 0;

	getCorrectionCategoryTitle(type: EWritingFeedbackCategories): string {
		return getCorrectionCategoryTitle(type);
	}

	getCorrectionTypeTitle(type: EWritingFeedbackTypes): string {
		return getCorrectionTypeTitle(type);
	}

	constructor() {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['stats']) {
			this.totalCorrections = 0;
			this.stats.categories.forEach(c => {
				this.totalCorrections += c?.totalIssues ?? 0;
			});
		}
	}

	ngOnInit(): void {}
}
