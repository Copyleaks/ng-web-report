import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { FilterResultDailogService } from '../../services/filter-result-dailog.service';
import { EFilterResultForm } from '../../models/filter-result-dailog.enum';

@Component({
	selector: 'cr-meta-filter-result',
	templateUrl: './meta-filter-result.component.html',
	styleUrls: ['./meta-filter-result.component.scss'],
})
export class MetaFilterResultComponent implements OnInit {
	@Input() minWordLimit: number = 0;
	@Input() maxWordLimit: number = 1023;
	@Input() publicationDates: string[] = ['May 2023', 'June 2023', 'July 2023'];

	form: FormGroup;
	wordLimitform: FormGroup;
	publicationDateForm: FormGroup;
	publicationDate: FormControl;
	eFilterResultForm = EFilterResultForm;

	constructor(private filterService: FilterResultDailogService) {}

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

	ngOnInit(): void {
		this.form = this.filterService.resultsMetaFormGroup;
		if (this.form) {
			this.wordLimitform = this.getFormGroup(EFilterResultForm.fgWordLimit);
			this.publicationDateForm = this.getFormGroup(EFilterResultForm.fgPublicationDate);
			this.publicationDate = this.publicationDateForm.get(EFilterResultForm.fcPublicationStartDate) as FormControl;
		}
	}

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
