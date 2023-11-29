import { Component, Inject, OnInit } from '@angular/core';
import { IResultsActions } from '../../components/containers/report-results-container/components/results-actions/models/results-actions.models';
import { IResultItem } from '../../components/containers/report-results-item-container/components/models/report-result-item.models';
import { ITotalSourceType } from './components/source-type-filter-result/models/source-type-filter-result.models';
import { FilterResultDailogService } from './services/filter-result-dailog.service';
import { ITagItem } from './components/included-tags-filter-result/models/included-tags-filter-result.models';
import { EFilterResultForm, IFilterResultDailogData } from './models/filter-result-dailog.enum';
import { FormGroup } from '@angular/forms';
import { untilDestroy } from '../../utils/until-destroy';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { combineLatest } from 'rxjs';
import { ALERTS } from '../../constants/report-alerts.constants';
import { ICompleteResults } from '../../models/report-data.models';
import { ResultDetailItem } from '../../models/report-matches.models';
import { ICopyleaksReportOptions } from '../../models/report-options.models';
import { trigger, transition, animate, keyframes, style } from '@angular/animations';

@Component({
	selector: 'cr-filter-result-dailog',
	templateUrl: './filter-result-dailog.component.html',
	styleUrls: ['./filter-result-dailog.component.scss'],
	providers: [FilterResultDailogService],
	animations: [
		trigger('errorAnimation', [
			transition(':enter', [
				animate(
					'0.5s ease-in',
					keyframes([
						style({ transform: 'translateY(-10px)', offset: 0.1 }),
						style({ transform: 'translateY(0px)', offset: 0.2 }),
						style({ transform: 'translateY(-10px)', offset: 0.3 }),
						style({ transform: 'translateY(0px)', offset: 0.4 }),
						style({ transform: 'translateY(-10px)', offset: 0.5 }),
						style({ transform: 'translateY(0px)', offset: 1.0 }),
					])
				),
			]),
		]),
	],
})
export class FilterResultDailogComponent implements OnInit {
	allTagItem: ITagItem[] = [];
	isMobile: boolean = false;
	resultsActions: IResultsActions = {
		totalResults: 0,
		totalExcluded: 0,
		totalFiltered: 0,
		selectedResults: 0,
	};

	totalSourceType: ITotalSourceType;
	allResultsItem: IResultItem[] = [];
	excludedResults: IResultItem[] = [];
	minWordLimit: number = 0;
	maxWordLimit: number = 0;
	publicationDates: string[] = [];
	loading: boolean = true;

	totalIdentical: number = 0;
	totalMinorChanges: number = 0;
	totalParaphrased: number = 0;

	totalSameAuthor: number = 0;
	totalAlerts: number = 0;

	completeResults: ICompleteResults;
	sourceTypeErrorMessage: string | null;
	matchTypeErrorMessage: string | null;

	get totalFiltered() {
		return this.totalSourceType ? this.getTotalFilterdResult() : 0;
	}

	get sourceTypeFormGroup() {
		return this._filterResultsSvc.sourceTypeFormGroup;
	}

	constructor(
		private _filterResultsSvc: FilterResultDailogService,
		private _dialogRef: MatDialogRef<FilterResultDailogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: IFilterResultDailogData
	) {}

	ngOnInit() {
		this.initResultItem();
		this.isMobile = this.data?.isMobile;

		this._filterResultsSvc.filterResultFormGroup.valueChanges.pipe(untilDestroy(this)).subscribe(vc => {
			const formData = this.getFilterCurrentData();
			if (
				!formData.showInternetResults &&
				!formData.showBatchResults &&
				!formData.showInternalDatabaseResults &&
				(!formData.showRepositoriesResults || formData.showRepositoriesResults.length === 0)
			) {
				setTimeout(() => {
					if (this.totalSourceType.totalInternet > 0)
						this._filterResultsSvc.filterResultFormGroup
							?.get(EFilterResultForm.fgSourceType)
							?.get(EFilterResultForm.fcInternet)
							?.setValue(true, { emitEvent: false });
					else if (this.totalSourceType.totalInternalDatabase > 0)
						this._filterResultsSvc.filterResultFormGroup
							?.get(EFilterResultForm.fgSourceType)
							?.get(EFilterResultForm.fcInternalDatabase)
							?.setValue(true, { emitEvent: false });
					else if (this.totalSourceType.totalbatch > 0)
						this._filterResultsSvc.filterResultFormGroup
							?.get(EFilterResultForm.fgSourceType)
							?.get(EFilterResultForm.fcBatch)
							?.setValue(true, { emitEvent: false });
				});

				this.sourceTypeErrorMessage = $localize`At least one match Source type needs to be activated.`;
			} else if (!formData.showIdentical && !formData.showMinorChanges && !formData.showRelated) {
				setTimeout(() => {
					if (this.totalIdentical > 0)
						this._filterResultsSvc.filterResultFormGroup
							?.get(EFilterResultForm.fgMatchTypes)
							?.get(EFilterResultForm.fcIdenticalText)
							?.setValue(true, { emitEvent: false });
					else if (this.totalMinorChanges > 0)
						this._filterResultsSvc.filterResultFormGroup
							?.get(EFilterResultForm.fgMatchTypes)
							?.get(EFilterResultForm.fcMinorChanges)
							?.setValue(true, { emitEvent: false });
					else if (this.totalParaphrased > 0)
						this._filterResultsSvc.filterResultFormGroup
							?.get(EFilterResultForm.fgMatchTypes)
							?.get(EFilterResultForm.fcParaphrased)
							?.setValue(true, { emitEvent: false });
				});
				this.matchTypeErrorMessage = $localize`At least one match type needs to be activated.`;
			} else this.matchTypeErrorMessage = this.sourceTypeErrorMessage = null;
		});
	}

	getTotalFilterdResult() {
		let totalEnabledSource = 0;
		for (const controlName in this.sourceTypeFormGroup.controls) {
			if (this.sourceTypeFormGroup.get(controlName)?.value) {
				totalEnabledSource += this.getTotalForEchSourceType(controlName);
			}
		}
		return totalEnabledSource;
	}

	getTotalForEchSourceType(eFilterResultForm: string) {
		switch (eFilterResultForm) {
			case EFilterResultForm.fcInternet:
				return this.totalSourceType.totalInternet;
			case EFilterResultForm.fcInternalDatabase:
				return this.totalSourceType.totalInternalDatabase;
			case EFilterResultForm.fcBatch:
				return this.totalSourceType.totalbatch;
			case EFilterResultForm.fgRepositories:
				return this.getTotalEnabledRepositories();
			default:
				return 0;
		}
	}

	getTotalEnabledRepositories() {
		let countRepo = 0;
		var repositories = this.sourceTypeFormGroup.get(EFilterResultForm.fgRepositories) as FormGroup;
		for (const controlName in repositories.controls) {
			if (repositories.get(controlName)?.value) {
				countRepo += 1;
			}
		}
		return countRepo;
	}

	setTotalMatchTypesStatistics() {
		this.allResultsItem.forEach(result => {
			if (result.iStatisticsResult.identical && result.iStatisticsResult.identical > 0) this.totalIdentical++;
			if (result.iStatisticsResult.minorChanges && result.iStatisticsResult.minorChanges > 0) this.totalMinorChanges++;
			if (result.iStatisticsResult.relatedMeaning && result.iStatisticsResult.relatedMeaning > 0)
				this.totalParaphrased++;
		});
	}

	setExcludedResultsStats() {
		const excludedResultsIds = this.data.reportDataSvc.excludedResultsIds;
		const filteredResults = this.data.reportDataSvc.filterResults(
			this.allResultsItem.map(result => result.resultDetails) as ResultDetailItem[],
			this.getFilterCurrentData(),
			excludedResultsIds ?? []
		);
		this.excludedResults = this.allResultsItem.filter(
			result => !!excludedResultsIds?.find(id => result.resultDetails?.id === id)
		);
		this.resultsActions = {
			...this.resultsActions,
			totalExcluded: this.excludedResults.length,
			totalFiltered:
				(this.data.reportDataSvc.scanResultsDetails?.length ?? 0) - filteredResults.length <= 0
					? 0
					: (this.data.reportDataSvc.scanResultsDetails?.length ?? 0) -
					  filteredResults.length -
					  (excludedResultsIds?.length ?? 0),
			totalResults: this.allResultsItem.length,
		};
	}

	setResultsPublicationDate() {
		const dates = new Set<string>(); // Use a Set to store unique month-year strings
		this.allResultsItem.forEach(result => {
			if (result.resultPreview?.metadata?.publishDate) {
				// Create a new Date object from the publish date
				const date = new Date(result.resultPreview.metadata.publishDate);
				// Convert the date to a locale string with options for month and year
				const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
				dates.add(monthYear); // Add the resulting string to the Set
			}
		});
		this.publicationDates = [...dates];
		if (this.publicationDates.length === 0)
			this._filterResultsSvc.resultsMetaFormGroup
				.get(EFilterResultForm.fgPublicationDate)
				?.get(EFilterResultForm.fcPublicationEnabled)
				?.disable();
	}

	setResultsWordsLimit() {
		this.maxWordLimit = 0;
		const allResults = [
			...(this.completeResults.results?.internet ?? []),
			...(this.completeResults.results?.database ?? []),
			...(this.completeResults.results?.batch ?? []),
			...(this.completeResults.results?.repositories ?? []),
		];
		allResults.forEach(r => {
			if (r.matchedWords >= this.maxWordLimit) this.maxWordLimit = r.matchedWords;
		});
	}

	initResultItem() {
		combineLatest([this.data.reportDataSvc.scanResultsPreviews$, this.data.reportDataSvc.scanResultsDetails$])
			.pipe(untilDestroy(this))
			.subscribe(([completeResults, resultsDetails]) => {
				if (completeResults) {
					this.completeResults = completeResults;

					const results = completeResults.results;
					this.totalSourceType = {
						totalInternet: results.internet.length,
						totalInternalDatabase: results.database.length,
						totalbatch: results.batch.length,
						// TODO: Load the repos
					};

					const allResults = [
						...(results?.internet ?? []),
						...(results?.database ?? []),
						...(results?.batch ?? []),
						...(results?.repositories ?? []),
					];

					this.resultsActions.totalResults = allResults.length;
					this.allResultsItem = allResults.map(result => {
						const resultDetail = resultsDetails?.find(r => r.id === result.id);
						return {
							resultPreview: result,
							resultDetails: resultDetail,
							iStatisticsResult: {
								identical: resultDetail?.result?.statistics.identical,
								minorChanges: resultDetail?.result?.statistics.minorChanges,
								relatedMeaning: resultDetail?.result?.statistics.relatedMeaning,
							},
							metadataSource: {
								words: completeResults?.scannedDocument.totalWords ?? 0,
								excluded: completeResults?.scannedDocument.totalExcluded ?? 0,
							},
						} as IResultItem;
					});

					this.setTotalMatchTypesStatistics();

					this.totalAlerts =
						completeResults?.notifications?.alerts?.filter(a => a.code != ALERTS.SUSPECTED_AI_TEXT_DETECTED)?.length ??
						0;

					this._filterResultsSvc.initForm(completeResults);

					this.setExcludedResultsStats();
					this.setResultsPublicationDate();
					this.setResultsWordsLimit();

					this.allTagItem = this._filterResultsSvc.selectedTagItem;

					this.loading = false;
				}
			});
	}

	onClearFilter() {
		this._filterResultsSvc.clearForm();
	}

	onDiscardChanges() {
		this._dialogRef.close();
	}

	onSaveChanges() {
		this.data.reportDataSvc.filterOptions$.next(this.getFilterCurrentData());

		this._dialogRef.close();
	}

	getFilterCurrentData(): ICopyleaksReportOptions {
		return {
			// Tags
			includedTags: this._filterResultsSvc.selectedTagItem.filter(a => a.selected).map(a => a.code) ?? [],

			// Matches
			showIdentical:
				this.totalIdentical === 0
					? false
					: this._filterResultsSvc.matchTypeFormGroup.get(EFilterResultForm.fcIdenticalText)?.value,
			showMinorChanges:
				this.totalMinorChanges === 0
					? false
					: this._filterResultsSvc.matchTypeFormGroup.get(EFilterResultForm.fcMinorChanges)?.value,
			showRelated:
				this.totalParaphrased === 0
					? false
					: this._filterResultsSvc.matchTypeFormGroup.get(EFilterResultForm.fcParaphrased)?.value,

			// General
			showAlerts: this._filterResultsSvc.generalFiltersFormGroup.get(EFilterResultForm.fcAlerts)?.value,
			showSameAuthorSubmissions: this._filterResultsSvc.generalFiltersFormGroup.get(
				EFilterResultForm.fcAuthorSubmissions
			)?.value,
			showTop100Results: this._filterResultsSvc.generalFiltersFormGroup.get(EFilterResultForm.fcTopResult)?.value,

			// Source
			showInternetResults:
				this.totalSourceType.totalInternet === 0
					? false
					: this._filterResultsSvc.sourceTypeFormGroup.get(EFilterResultForm.fcInternet)?.value,
			showInternalDatabaseResults:
				this.totalSourceType.totalInternalDatabase === 0
					? false
					: this._filterResultsSvc.sourceTypeFormGroup.get(EFilterResultForm.fcInternalDatabase)?.value,
			showBatchResults:
				this.totalSourceType.totalbatch === 0
					? false
					: this._filterResultsSvc.sourceTypeFormGroup.get(EFilterResultForm.fcBatch)?.value,
			// TODO: Repos ids list
			// showRepositoriesResults:  this._filterResultsSvc.sourceTypeFormGroup.get(EFilterResultForm.).value,

			// Metadata
			wordLimit: this._filterResultsSvc.resultsMetaFormGroup
				.get(EFilterResultForm.fgWordLimit)
				?.get(EFilterResultForm.fcWordLimitEnabled)?.value
				? this._filterResultsSvc.resultsMetaFormGroup
						.get(EFilterResultForm.fgWordLimit)
						?.get(EFilterResultForm.fcWordLimitTotalWordlimt)?.value
				: undefined,
			includeResultsWithoutDate: this._filterResultsSvc.resultsMetaFormGroup
				.get(EFilterResultForm.fgPublicationDate)
				?.get(EFilterResultForm.fcResultsWithNoDates)?.value,
			publicationDate: this._filterResultsSvc.resultsMetaFormGroup
				.get(EFilterResultForm.fgPublicationDate)
				?.get(EFilterResultForm.fcPublicationStartDate)?.value,
		} as ICopyleaksReportOptions;
	}

	ngOnDestroy() {}
}
