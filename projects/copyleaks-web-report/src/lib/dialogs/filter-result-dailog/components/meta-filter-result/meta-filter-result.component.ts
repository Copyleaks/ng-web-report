import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { EFilterResultForm } from '../../models/filter-result-dailog.enum';
import { FilterResultDailogService } from '../../services/filter-result-dailog.service';

@Component({
    selector: 'cr-meta-filter-result',
    templateUrl: './meta-filter-result.component.html',
    styleUrls: ['./meta-filter-result.component.scss'],
    standalone: false
})
export class MetaFilterResultComponent implements OnInit {
	/**
	 * @Input {number} Minimum word limit filter applied to the results
	 */
	@Input() minWordLimit: number;

	/**
	 * @Input {number} Maximum word limit filter applied to the results
	 */
	@Input() maxWordLimit: number;

	/**
	 * @Input {string[]} List of publication dates available for the results
	 */
	@Input() publicationDates: string[];

	/**
	 * @Input {number} Total number of results that do not have a publication date
	 */
	@Input() totalResultsWithoutDate: number;

	eFilterResultForm = EFilterResultForm;

	RESULT_WORD_LIMIT = $localize`Minimum words per result:`;
	RESULT_PUBLISH_DATE = $localize`Publication date:`;

	constructor(public filterService: FilterResultDailogService) {}

	get form(): UntypedFormGroup {
		return this.filterService.resultsMetaFormGroup;
	}

	get wordLimitform(): UntypedFormGroup {
		return this.filterService.resultsMetaFormGroup.get(EFilterResultForm.fgWordLimit) as UntypedFormGroup;
	}

	get publicationDateForm(): UntypedFormGroup {
		return this.filterService.resultsMetaFormGroup.get(EFilterResultForm.fgPublicationDate) as UntypedFormGroup;
	}

	get publicationDate(): UntypedFormControl {
		return this.publicationDateForm.get(EFilterResultForm.fcPublicationStartDate) as UntypedFormControl;
	}

	get wordLimitTotalWord() {
		return this.wordLimitform.get(EFilterResultForm.fcWordLimitTotalWordlimt)?.value;
	}

	get wordLimitTotalWordFc() {
		return this.wordLimitform.get(EFilterResultForm.fcWordLimitTotalWordlimt) as UntypedFormControl;
	}

	get maxSliderDates() {
		return this.publicationDates?.length > 1 ? this.publicationDates?.length - 1 : 1;
	}

	get valueSliderDate() {
		if (this.publicationDates?.length == 1) return 1;
		else return this.publicationDates?.indexOf(this.publicationDateValue) ?? 0;
	}

	get publicationDateValue() {
		const date = new Date(this.publicationDateForm.get(EFilterResultForm.fcPublicationStartDate)?.value);
		const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
		return monthYear;
	}

	ngOnInit(): void {
		if (
			!this.publicationDateForm.get(EFilterResultForm.fcPublicationStartDate)?.value &&
			this.publicationDateForm.get(EFilterResultForm.fcPublicationEnabled)?.value == true
		) {
			this.publicationDateForm
				.get(EFilterResultForm.fcPublicationStartDate)
				?.setValue(new Date(this.publicationDates[0]));
		}
	}

	getFormGroup(eFilterResultForm: EFilterResultForm) {
		return this.filterService.resultsMetaFormGroup.get(eFilterResultForm) as UntypedFormGroup;
	}

	getEnabledValue(eFilterResultForm: EFilterResultForm) {
		switch (eFilterResultForm) {
			case EFilterResultForm.fcPublicationEnabled:
				return this.publicationDateForm.get(EFilterResultForm.fcPublicationEnabled)?.value;
			case EFilterResultForm.fcWordLimitEnabled:
				return this.wordLimitform.get(EFilterResultForm.fcWordLimitEnabled)?.value;
			default:
				return false;
		}
	}

	changeSliderDate($event: any) {
		this.publicationDate?.setValue(new Date(this.publicationDates[$event.value]));
	}

	onPublicationEnabledChange(enabled: boolean) {
		if (!enabled) this.publicationDate?.setValue(null);
		else this.publicationDate?.setValue(new Date(this.publicationDates[0]));
	}

	onSliderChange(event: any) {
		// Check if the slider is at or near its maximum position (within one step)
		if (event.value >= this.maxWordLimit - 10 && event.value < this.maxWordLimit) {
			this.wordLimitTotalWordFc.setValue(Number(this.maxWordLimit));
		} else {
			this.wordLimitTotalWordFc.setValue(Number(event.value));
		}
	}
}
