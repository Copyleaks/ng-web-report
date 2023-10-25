import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { EFilterResultForm } from '../models/filter-result-dailog.enum';
import { ITagItem } from '../components/included-tags-filter-result/models/included-tags-filter-result.models';

@Injectable()
export class FilterResultDailogService {
	private _filterResultForm: FormGroup;

	selectedTagItem: ITagItem[] = [
		{
			code: '0',
			title: 'Menu item1',
			description: 'string',
			selected: true,
		},
		{
			code: '1',
			title: 'Menu item2',
			description: 'string',
			selected: true,
		},
		{
			code: '2',
			title: 'Menu item12',
			description: 'string',
			selected: true,
		},
	];

	get filterResultFormGroup() {
		return this._filterResultForm;
	}

	get sourceTypeFormGroup() {
		return this._filterResultForm?.get(EFilterResultForm.fgSourceType) as FormGroup;
	}

	get matchTypeFormGroup() {
		return this._filterResultForm?.get(EFilterResultForm.fgMatchTypes) as FormGroup;
	}

	get generalFiltersFormGroup() {
		return this._filterResultForm?.get(EFilterResultForm.fgGeneralFilters) as FormGroup;
	}

	get IncludedTagsFormControl() {
		return this._filterResultForm?.get(EFilterResultForm.fcIncludedTags) as FormControl;
	}

	constructor(private _formBuilder: FormBuilder) {}

	initForm() {
		this._filterResultForm = this._formBuilder.group({
			sourceType: this._formBuilder.group({
				internet: new FormControl(this.getFormControlValue(EFilterResultForm.fcInternet)),
				internalDatabase: new FormControl(this.getFormControlValue(EFilterResultForm.fcInternalDatabase)),
				batch: new FormControl(this.getFormControlValue(EFilterResultForm.fcBatch)),
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
				identicalText: new FormControl(this.getFormControlValue(EFilterResultForm.fcIdenticalText)),
				minorChanges: new FormControl(this.getFormControlValue(EFilterResultForm.fcMinorChanges)),
				paraphrased: new FormControl(this.getFormControlValue(EFilterResultForm.fcParaphrased)),
			}),
			generalFilters: this._formBuilder.group({
				topResult: new FormControl(this.getFormControlValue(EFilterResultForm.fcTopResult)),
				alerts: new FormControl(this.getFormControlValue(EFilterResultForm.fcAlerts)),
				authorSubmissions: new FormControl(this.getFormControlValue(EFilterResultForm.fcAuthorSubmissions)),
			}),
			includedTags: new FormControl(this.getFormControlValue(EFilterResultForm.fcIncludedTags)),
		});
	}

	getFormControlValue(eFilterResultForm: EFilterResultForm) {
		switch (eFilterResultForm) {
			//Source Type
			case EFilterResultForm.fcInternet:
				return true;
			case EFilterResultForm.fcInternalDatabase:
				return false;
			case EFilterResultForm.fcBatch:
				return false;
			//case EFilterResultForm.fgRepositories:

			//Match Type
			case EFilterResultForm.fcIdenticalText:
				return true;
			case EFilterResultForm.fcMinorChanges:
				return false;
			case EFilterResultForm.fcParaphrased:
				return false;

			//General Filters
			case EFilterResultForm.fcTopResult:
				return true;
			case EFilterResultForm.fcAlerts:
				return false;
			case EFilterResultForm.fcAuthorSubmissions:
				return true;

			case EFilterResultForm.fcIncludedTags:
				return this.selectedTagItem ?? ([] as ITagItem[]);
			default:
				return null;
		}
	}
}
