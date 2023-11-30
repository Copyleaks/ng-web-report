import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { EFilterResultForm } from '../models/filter-result-dailog.enum';
import { ITagItem } from '../components/included-tags-filter-result/models/included-tags-filter-result.models';
import { ICompleteResults } from '../../../models/report-data.models';

@Injectable()
export class FilterResultDailogService {
	private _filterResultForm: FormGroup;
	private _completeResults: ICompleteResults;

	selectedTagItem: ITagItem[] = [];

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

	get resultsMetaFormGroup() {
		return this._filterResultForm?.get(EFilterResultForm.fgResultsMeta) as FormGroup;
	}

	get includedTagsFormControl() {
		return this._filterResultForm?.get(EFilterResultForm.fcIncludedTags) as FormControl;
	}

	constructor(private _formBuilder: FormBuilder) {}

	public initForm(completeResults: ICompleteResults) {
		this._completeResults = completeResults;

		this.initTags();

		this._filterResultForm = this._formBuilder.group({
			sourceType: this._formBuilder.group({
				internet: new FormControl(this.getFormControlValue(EFilterResultForm.fcInternet)),
				internalDatabase: new FormControl(this.getFormControlValue(EFilterResultForm.fcInternalDatabase)),
				batch: new FormControl(this.getFormControlValue(EFilterResultForm.fcBatch)),
				repositories: this._formBuilder.group([]),
			}),
			resultsMeta: this._formBuilder.group({
				wordLimit: this._formBuilder.group({
					wordLimitEnabled: new FormControl(this.getFormControlValue(EFilterResultForm.fcWordLimitEnabled)),
					totalWordlimt: new FormControl(this.getFormControlValue(EFilterResultForm.fcWordLimitTotalWordlimt)),
				}),
				publicationDate: this._formBuilder.group({
					publicationEnabled: new FormControl(this.getFormControlValue(EFilterResultForm.fcPublicationEnabled)),
					startDate: new FormControl(this.getFormControlValue(EFilterResultForm.fcPublicationStartDate)),
					resultsWithNoDates: new FormControl(this.getFormControlValue(EFilterResultForm.fcResultsWithNoDates)),
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

	public initTags() {
		const allResults = [
			...(this._completeResults.results.internet ?? []),
			...(this._completeResults.results.database ?? []),
			...(this._completeResults.results.repositories ?? []),
			...(this._completeResults.results.batch ?? []),
		];
		this.selectedTagItem = [];
		const tagSet = new Set();
		allResults.forEach(result => {
			result.tags?.forEach(tag => {
				const tagKey = `${tag.code}-${tag.description}-${tag.title}`;

				if (!tagSet.has(tagKey)) {
					tagSet.add(tagKey);

					this.selectedTagItem.push({
						selected: false,
						code: tag.code,
						description: tag.description,
						title: tag.title,
					});
				}
			});
		});

		// Select all tags that are provided in the filter options in the complete results response
		const filteredTags = this._completeResults.filters?.includedTags;
		if (filteredTags && filteredTags.length > 0) {
			filteredTags.forEach(tagCode => {
				const foundTag = this.selectedTagItem.find(t => tagCode === t.code);
				if (foundTag) foundTag.selected = true;
			});
		}
	}

	clearForm() {
		this.selectedTagItem?.forEach(t => (t.selected = false));

		this._filterResultForm = this._formBuilder.group({
			sourceType: this._formBuilder.group({
				internet: new FormControl(true),
				internalDatabase: new FormControl(true),
				batch: new FormControl(true),
				repositories: this._formBuilder.group([]), // TODO: put repost list
			}),
			resultsMeta: this._formBuilder.group({
				wordLimit: this._formBuilder.group({
					wordLimitEnabled: new FormControl(false),
					totalWordlimt: new FormControl(0),
				}),
				publicationDate: this._formBuilder.group({
					publicationEnabled: new FormControl(false),
					startDate: new FormControl(null),
					resultsWithNoDates: new FormControl(true),
				}),
			}),
			matchTypes: this._formBuilder.group({
				identicalText: new FormControl(true),
				minorChanges: new FormControl(true),
				paraphrased: new FormControl(true),
			}),
			generalFilters: this._formBuilder.group({
				topResult: new FormControl(false),
				alerts: new FormControl(true),
				authorSubmissions: new FormControl(true),
			}),
			includedTags: new FormControl(this.selectedTagItem ?? ([] as ITagItem[])),
		});
	}

	public getFormControlValue(eFilterResultForm: EFilterResultForm) {
		switch (eFilterResultForm) {
			// Source Type
			case EFilterResultForm.fcInternet:
				return this._completeResults.filters?.sourceType?.internet != undefined
					? this._completeResults.filters?.sourceType?.internet
					: true;
			case EFilterResultForm.fcInternalDatabase:
				return this._completeResults.filters?.sourceType?.internalDatabase != undefined
					? this._completeResults.filters?.sourceType?.internalDatabase
					: true;
			case EFilterResultForm.fcBatch:
				return this._completeResults.filters?.sourceType?.batch != undefined
					? this._completeResults.filters?.sourceType?.batch
					: true;
			//Results Meta
			case EFilterResultForm.fcWordLimitEnabled:
				return this._completeResults.filters?.resultsMetaData?.wordLimit?.wordLimitEnabled != undefined
					? this._completeResults.filters?.resultsMetaData?.wordLimit?.wordLimitEnabled
					: false;
			case EFilterResultForm.fcWordLimitTotalWordlimt:
				return this._completeResults.filters?.resultsMetaData?.wordLimit?.totalWordlimt != undefined
					? this._completeResults.filters?.resultsMetaData?.wordLimit?.totalWordlimt
					: 0;
			case EFilterResultForm.fcPublicationEnabled:
				return this._completeResults.filters?.resultsMetaData?.publicationDate?.publicationEnabled != undefined
					? this._completeResults.filters?.resultsMetaData?.publicationDate?.publicationEnabled
					: false;
			case EFilterResultForm.fcPublicationStartDate:
				return this._completeResults.filters?.resultsMetaData?.publicationDate?.startDate != undefined
					? this._completeResults.filters?.resultsMetaData?.publicationDate?.startDate
					: null;
			case EFilterResultForm.fcResultsWithNoDates:
				return this._completeResults.filters?.resultsMetaData?.publicationDate?.resultsWithNoDates != undefined
					? this._completeResults.filters?.resultsMetaData?.publicationDate?.resultsWithNoDates
					: true;
			//Match Type
			case EFilterResultForm.fcIdenticalText:
				return this._completeResults.filters?.matchType?.identicalText != undefined
					? this._completeResults.filters?.matchType?.identicalText
					: true;
			case EFilterResultForm.fcMinorChanges:
				return this._completeResults.filters?.matchType?.minorChanges != undefined
					? this._completeResults.filters?.matchType?.minorChanges
					: true;
			case EFilterResultForm.fcParaphrased:
				return this._completeResults.filters?.matchType?.paraphrased != undefined
					? this._completeResults.filters?.matchType?.paraphrased
					: true;
			//General Filters
			case EFilterResultForm.fcTopResult:
				return this._completeResults.filters?.general?.topResult != undefined
					? this._completeResults.filters?.general?.topResult
					: true;
			case EFilterResultForm.fcAlerts:
				return this._completeResults.filters?.general?.alerts != undefined
					? this._completeResults.filters?.general?.alerts
					: true;
			case EFilterResultForm.fcAuthorSubmissions:
				return this._completeResults.filters?.general?.authorSubmissions != undefined
					? this._completeResults.filters?.general?.authorSubmissions
					: true;
			case EFilterResultForm.fcIncludedTags:
				return this.selectedTagItem ?? ([] as ITagItem[]);
			default:
				return null;
		}
	}

	public getRepositoryValueById(repoId: string) {
		return true;
	}
}
