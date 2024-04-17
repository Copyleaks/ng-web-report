import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { EFilterResultForm } from '../models/filter-result-dailog.enum';
import { ITagItem } from '../components/included-tags-filter-result/models/included-tags-filter-result.models';
import { ICompleteResults } from '../../../models/report-data.models';
import { ISourceRepositoryType } from '../components/source-type-filter-result/models/source-type-filter-result.models';

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

	get excludedDomainsFormControl() {
		return this._filterResultForm?.get(EFilterResultForm.fcExcludedDomains) as FormControl;
	}

	get repositoriesFormGroup() {
		return this.sourceTypeFormGroup.get(EFilterResultForm.fgRepositories) as FormGroup;
	}

	get reposIds() {
		if (!this._completeResults || !this._completeResults.results?.repositories) return [];

		const reposMap = new Map<string, ISourceRepositoryType>();

		this._completeResults.results.repositories.forEach(r => {
			// Only add the repository if it doesn't already exist in the map
			if (!reposMap.has(r.repositoryId)) {
				reposMap.set(r.repositoryId, { id: r.repositoryId, title: r.title });
			}
		});

		return Array.from(reposMap.values());
	}

	constructor(private _formBuilder: FormBuilder) {}

	public initForm(completeResults: ICompleteResults) {
		this._completeResults = completeResults;

		this.initTags();

		this._filterResultForm = this._formBuilder.group({
			sourceType: this._formBuilder.group({
				internet: new FormControl(this.getFormControlValue(EFilterResultForm.fcInternet)),
				internalDatabase: new FormControl(this.getFormControlValue(EFilterResultForm.fcInternalDatabase)),
				yourResults: new FormControl(this.getFormControlValue(EFilterResultForm.fcYourResults)),
				othersResults: new FormControl(this.getFormControlValue(EFilterResultForm.fcOthersResults)),
				batch: new FormControl(this.getFormControlValue(EFilterResultForm.fcBatch)),
				repositories: this._formBuilder.group({}),
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
			excludedDomains: new FormControl(this.getFormControlValue(EFilterResultForm.fcExcludedDomains)),
		});

		this.addRepositoriesToForm(this.reposIds);
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
			filteredTags.forEach(tagTitle => {
				this.selectedTagItem.forEach(tag => {
					if (tag.title === tagTitle) tag.selected = true;
				});
			});
		}
	}

	clearForm() {
		this.initTags();
		this.selectedTagItem?.forEach(tag => {
			tag.selected = false;
		});

		this._filterResultForm.patchValue({
			sourceType: {
				internet: true,
				internalDatabase: true,
				batch: true,
				repositories: {},
			},
			resultsMeta: {
				wordLimit: {
					wordLimitEnabled: false,
					totalWordlimt: 0,
				},
				publicationDate: {
					publicationEnabled: false,
					startDate: null,
					resultsWithNoDates: true,
				},
			},
			matchTypes: {
				identicalText: true,
				minorChanges: true,
				paraphrased: true,
			},
			generalFilters: {
				topResult: false,
				alerts: true,
				authorSubmissions: true,
			},
			includedTags: this.selectedTagItem ?? ([] as ITagItem[]),
			excludedDomains: [],
		});

		this.initFormRepositories();
	}

	public getFormControlValue(eFilterResultForm: EFilterResultForm) {
		switch (eFilterResultForm) {
			// Source Type
			case EFilterResultForm.fcInternet:
				return this._completeResults.filters?.sourceType?.internet != undefined
					? this._completeResults.filters?.sourceType?.internet
					: true;
			case EFilterResultForm.fcInternalDatabase:
				return this._completeResults.filters?.sourceType?.othersResults != undefined &&
					this._completeResults.filters?.sourceType?.yourResults != undefined
					? this._completeResults.filters?.sourceType?.othersResults ||
							this._completeResults.filters?.sourceType?.yourResults
					: true;
			case EFilterResultForm.fcYourResults:
				return this._completeResults.filters?.sourceType?.yourResults != undefined
					? this._completeResults.filters?.sourceType?.yourResults
					: true;
			case EFilterResultForm.fcOthersResults:
				return this._completeResults.filters?.sourceType?.othersResults != undefined
					? this._completeResults.filters?.sourceType?.othersResults
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
				return this._completeResults.filters?.resultsMetaData?.wordLimit?.totalWordLimit != undefined
					? this._completeResults.filters?.resultsMetaData?.wordLimit?.totalWordLimit
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
			case EFilterResultForm.fcExcludedDomains:
				return this._completeResults.filters?.excludedDomains != undefined
					? this._completeResults.filters?.excludedDomains
					: [];
			default:
				return null;
		}
	}

	public getRepositoryValueById() {
		return true;
	}

	addRepositoriesToForm(repositories: ISourceRepositoryType[], clear: boolean = false): void {
		repositories.forEach(repo => {
			// Add a new FormControl for each repository
			// Using the repo id as the form control name and setting the initial value to false

			this.repositoriesFormGroup?.addControl(
				repo.id,
				new FormControl(
					clear
						? true
						: !this._completeResults.filters?.sourceType?.repositories
						? true
						: this._completeResults.filters?.sourceType?.repositories?.find(id => id === repo.id) === undefined
						? true
						: false
				)
			);
		});
	}

	getSelectedRepositoryIds(): string[] {
		// This will hold the IDs of the repositories with a value of true
		const selectedRepoIds: string[] = [];

		// Iterate over the keys of the form group controls
		Object.keys(this.repositoriesFormGroup?.controls).forEach(key => {
			const control = this.repositoriesFormGroup?.controls[key];

			// Check if the control's value is true
			if (control.value === false) {
				selectedRepoIds.push(key);
			}
		});

		return selectedRepoIds;
	}

	initFormRepositories(): void {
		// Iterate over the keys of the form group controls
		Object.keys(this.repositoriesFormGroup?.controls).forEach(key => {
			const control = this.repositoriesFormGroup?.controls[key];
			control?.setValue(true);
		});
	}
}
