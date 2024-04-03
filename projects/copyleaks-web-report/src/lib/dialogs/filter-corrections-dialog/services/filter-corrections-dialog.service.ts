import { Injectable } from '@angular/core';
import { EWritingFeedbackCategories } from '../../../enums/copyleaks-web-report.enums';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { IWritingFeedbackTypeStatistics } from '../../../models/report-data.models';
import { getSelectedCategoryStats } from '../../../utils/enums-helpers';

@Injectable()
export class FilterCorrectionsDialogService {
	private _filterCorrectionsForm: FormGroup;

	get filterCorrectionsForm(): FormGroup {
		return this._filterCorrectionsForm;
	}

	constructor(private _formBuilder: FormBuilder) {}

	public initForm(
		hiddenCategories: EWritingFeedbackCategories[],
		writingFeedbackStats: IWritingFeedbackTypeStatistics[]
	): void {
		const controls = Object.keys(EWritingFeedbackCategories)
			.filter(key => !isNaN(Number(EWritingFeedbackCategories[key])))
			.reduce((acc, key) => {
				const isHidden = hiddenCategories.includes(Number(EWritingFeedbackCategories[key]));

				const categoryStat = getSelectedCategoryStats(Number(EWritingFeedbackCategories[key]), writingFeedbackStats);
				const isDisabled: boolean = !categoryStat || categoryStat.totalIssues === 0;

				const control = new FormControl({ value: !isHidden, disabled: isDisabled });
				acc[key] = control;
				return acc;
			}, {});

		this._filterCorrectionsForm = this._formBuilder.group(controls);
	}

	public onSubmit(): EWritingFeedbackCategories[] {
		const selectedCategories: EWritingFeedbackCategories[] = [];

		Object.keys(this._filterCorrectionsForm.value).forEach(key => {
			if (this._filterCorrectionsForm.value[key] == false) {
				// If the category checkbox is checked
				// Convert the string key back to the enum value
				const enumValue = EWritingFeedbackCategories[key as keyof typeof EWritingFeedbackCategories];
				if (enumValue !== undefined) {
					selectedCategories.push(enumValue);
				}
			}
		});
		return selectedCategories;
	}

	public clearFilter(): void {
		const controls = this._filterCorrectionsForm.controls;

		// Set all the categories checkboxes to be checked
		const newValues = {};
		Object.keys(controls).forEach(key => {
			newValues[key] = true;
		});

		this._filterCorrectionsForm.patchValue(newValues);
	}
}
