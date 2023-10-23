import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
	selector: 'cr-meta-filter-result',
	templateUrl: './meta-filter-result.component.html',
	styleUrls: ['./meta-filter-result.component.scss'],
})
export class MetaFilterResultComponent implements OnInit {
	form: FormGroup;

	limitWord: boolean = false;
	WordLimitNumber: number = 0;
	minWordLimit: number = 0;
	maxWordLimit: number = 1023;
	//show more menu item
	showMoreMenu: boolean = true;
	constructor(private _formBuilder: FormBuilder) {}

	get wordLimitValue() {
		return this.form.get('wordLimitForm')?.value;
	}

	get publicationDateValue() {
		return this.form.get('publicationDateForm')?.value;
	}
	ngOnInit(): void {
		this.form = this._formBuilder.group({
			wordLimitForm: new FormControl(false),
			publicationDateForm: new FormControl(true),
		});
	}
}
