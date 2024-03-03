import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { trigger, state, transition, animate, style } from '@angular/animations';
import {
	IWritingFeedbackCorrectionViewModel,
	IWritingFeedbackTypeStatistics,
} from '../../../models/report-data.models';
import { EWritingFeedbackCategories } from '../../../enums/copyleaks-web-report.enums';
import {
	getCorrectionCategoryDescription,
	getCorrectionCategoryTitle,
	getSelectedCategoryType,
} from '../../../utils/enums-helpers';
import { ReportDataService } from '../../../services/report-data.service';

@Component({
	selector: 'copyleaks-report-corrections-container',
	templateUrl: './report-corrections-container.component.html',
	styleUrls: ['./report-corrections-container.component.scss'],
	animations: [
		trigger('fadeIn', [
			state('void', style({ opacity: 0 })),
			transition(':enter', [animate('0.5s ease-in', style({ opacity: 1 }))]),
		]),
	],
})
export class ReportCorrectionsContainerComponent implements OnInit, OnDestroy, OnChanges {
	/**
	 * @Input {number} The report Writing Feedback total issues.
	 */
	@Input() totalWritingFeedbackIssues: number = 0;

	@Input() writingFeedbackStats: IWritingFeedbackTypeStatistics[];

	@Input() displayedScanCorrectionsView: IWritingFeedbackCorrectionViewModel[];

	@Input() allScanCorrectionsView: IWritingFeedbackCorrectionViewModel[];

	@Input() selectedCategroy: EWritingFeedbackCategories | undefined = undefined;

	selectedCategroyTotal: number = 0;
	selectedCategroyTitle: string;
	selectedCategroyDescription: string;
	selectedCategroyCorrections: IWritingFeedbackCorrectionViewModel[];
	emptyCorrectionsMessage: string = $localize`No Grammar corrections were found!`;
	totalFilteredWritingFeedbackIssues: number = 0;
	totalIgnoredWritingFeedbackIssues: number = 0;

	constructor(public reportDataSvc: ReportDataService) {}

	ngOnInit(): void {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['displayedScanCorrectionsView'] || changes['allScanCorrectionsView']) {
			this.totalFilteredWritingFeedbackIssues =
				(this.allScanCorrectionsView ?? []).length -
				(this.displayedScanCorrectionsView ?? []).length -
				(this.reportDataSvc.excludedCorrections ?? []).length;

			this.totalIgnoredWritingFeedbackIssues = (this.reportDataSvc.excludedCorrections ?? []).length;
		}
	}

	onSelectCategory(category: EWritingFeedbackCategories) {
		this.selectedCategroy = category;
		this.selectedCategroyTitle = this.getCorrectionCategoryTitle(category);
		this.selectedCategroyDescription = this.getCorrectionCategoryDescription(category);
		this.selectedCategroyCorrections = this.allScanCorrectionsView.filter(c => c.type === category);

		const selectedType = getSelectedCategoryType(category);
		if (this.writingFeedbackStats && this.writingFeedbackStats[selectedType]) {
			const selectedCategoryStats = this.writingFeedbackStats[selectedType].categories?.find(c => c.type === category);
			if (selectedCategoryStats) this.selectedCategroyTotal = selectedCategoryStats.totalIssues;
			else this.selectedCategroyTotal = 0;
		}
	}

	goToAllCorrectionsView() {
		this.selectedCategroy = undefined;
	}

	getCorrectionCategoryTitle(type: EWritingFeedbackCategories): string {
		return getCorrectionCategoryTitle(type);
	}

	getCorrectionCategoryDescription(type: EWritingFeedbackCategories): string {
		return getCorrectionCategoryDescription(type);
	}

	ngOnDestroy(): void {}
}
