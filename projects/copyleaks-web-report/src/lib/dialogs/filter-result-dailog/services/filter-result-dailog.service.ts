import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Injectable()
export class FilterResultDailogService {
	filterResultForm: FormGroup;
	constructor(private _formBuilder: FormBuilder) {}

	initForm() {
		this.filterResultForm = this._formBuilder.group({
			sourceType: this._formBuilder.group({
				internet: new FormControl({
					value: true,
				}),
				database: new FormControl({
					value: true,
				}),
				batch: new FormControl({
					value: true,
				}),
				repositories: this._formBuilder.group([]),
			}),
			resultsMeta: this._formBuilder.group({
				wordLimit: this._formBuilder.group({
					enabled: new FormControl({
						value: true,
					}),
					totalWordlimt: new FormControl({
						value: 51,
					}),
				}),
				publicationDate: this._formBuilder.group({
					enabled: new FormControl({
						value: true,
					}),
					startDate: new FormControl({
						value: '',
					}),
				}),
			}),
			matchTypes: this._formBuilder.group({
				identicalText: new FormControl({
					value: true,
				}),
				minorChanges: new FormControl({
					value: true,
				}),
				paraphrased: new FormControl({
					value: true,
				}),
			}),
			generalFilters: this._formBuilder.group({
				topResult: new FormControl({
					value: true,
				}),
				alerts: new FormControl({
					value: true,
				}),
				authorSubmissions: new FormControl({
					value: true,
				}),
			}),
			includedTags: new FormControl({
				value: ['true', 'true', 'true', 'true', 'true', 'true'],
			}),
		});
	}

	getFormControlValue() {}
}
