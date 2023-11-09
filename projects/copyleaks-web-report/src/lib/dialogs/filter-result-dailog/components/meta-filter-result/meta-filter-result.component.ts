import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EFilterResultForm } from '../../models/filter-result-dailog.enum';
import { FilterResultDailogService } from '../../services/filter-result-dailog.service';

@Component({
	selector: 'cr-meta-filter-result',
	templateUrl: './meta-filter-result.component.html',
	styleUrls: ['./meta-filter-result.component.scss'],
})
export class MetaFilterResultComponent implements OnInit {
	@Input() minWordLimit: number;
	@Input() maxWordLimit: number;
	@Input() publicationDates: string[];

	eFilterResultForm = EFilterResultForm;

	constructor(private filterService: FilterResultDailogService) {}

	get form(): FormGroup {
		return this.filterService.resultsMetaFormGroup;
	}

	get wordLimitform(): FormGroup {
		return this.getFormGroup(EFilterResultForm.fgWordLimit);
	}

	get publicationDateForm(): FormGroup {
		return this.getFormGroup(EFilterResultForm.fgPublicationDate);
	}

	get publicationDate(): FormControl {
		return this.publicationDateForm.get(EFilterResultForm.fcPublicationStartDate) as FormControl;
	}

	get wordLimitTotalWord() {
		return this.wordLimitform.get(EFilterResultForm.fcWordLimitTotalWordlimt)?.value;
	}

	get maxSliderDates() {
		return this.publicationDates?.length > 1 ? this.publicationDates?.length - 1 : 1;
	}

	get valueSliderDate() {
		if (this.publicationDates?.length == 1) return 1;
		else return this.publicationDates?.indexOf(this.publicationDateValue) ?? 0;
	}

	get publicationDateValue() {
		return this.publicationDateForm.get(EFilterResultForm.fcPublicationStartDate)?.value;
	}

	ngOnInit(): void {}

	getFormGroup(eFilterResultForm: EFilterResultForm) {
		return this.filterService.resultsMetaFormGroup.get(eFilterResultForm) as FormGroup;
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
		this.publicationDate?.setValue(this.publicationDates[$event.value]);
	}
}
