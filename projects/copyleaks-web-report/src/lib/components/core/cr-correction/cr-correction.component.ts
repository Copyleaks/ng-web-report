import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { IWritingFeedbackCorrectionViewModel } from '../../../models/report-data.models';
import { EWritingFeedbackCategories } from '../../../enums/copyleaks-web-report.enums';
import { getCorrectionCategoryTitle, getCorrectionCategoryDescription } from '../../../utils/enums-helpers';

@Component({
	selector: 'cr-correction',
	templateUrl: './cr-correction.component.html',
	styleUrls: ['./cr-correction.component.scss'],
})
export class CrCorrectionComponent implements OnInit {
	@Input() correction: IWritingFeedbackCorrectionViewModel;

	/**
	 * @Input {boolean} Flag indicating whether the view is for the execluded correction dialog view.
	 */
	@Input() isExcludeView: boolean = false;

	/**
	 * @Input {boolean} Flag indicating whether the view is for the execluded correction dialog view.
	 */
	@Input() hideDescription: boolean = false;

	isExcluded: boolean = false;

	get getCorrectionType(): string {
		return getCorrectionCategoryTitle(this.correction?.type);
	}

	get getCorrectionDescription(): string {
		return getCorrectionCategoryDescription(this.correction?.type);
	}

	EWritingFeedbackTypes = EWritingFeedbackCategories;
	correctionDescription: string;
	correctionType: string;
	constructor() {}

	ngOnInit(): void {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['correction']) {
			this.correctionType = this.getCorrectionType;
			this.correctionDescription = this.getCorrectionDescription;
		}
	}
}
