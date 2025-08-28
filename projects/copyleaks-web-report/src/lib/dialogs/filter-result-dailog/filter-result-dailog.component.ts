import { Component, Inject, OnInit } from '@angular/core';
import { IResultsActions } from '../../components/containers/report-results-container/components/results-actions/models/results-actions.models';
import { IResultItem } from '../../components/containers/report-results-item-container/components/models/report-result-item.models';
import { ITotalSourceType } from './components/source-type-filter-result/models/source-type-filter-result.models';
import { FilterResultDailogService } from './services/filter-result-dailog.service';
import { ITagItem } from './components/included-tags-filter-result/models/included-tags-filter-result.models';
import { EFilterResultForm, EFilterResultSection, IFilterResultDailogData } from './models/filter-result-dailog.enum';
import { UntypedFormGroup } from '@angular/forms';
import { untilDestroy } from '../../utils/until-destroy';
import {
	MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
	MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { combineLatest } from 'rxjs';
import { ALERTS } from '../../constants/report-alerts.constants';
import { ICompleteResults } from '../../models/report-data.models';
import { ICopyleaksReportOptions } from '../../models/report-options.models';
import { trigger, transition, animate, keyframes, style } from '@angular/animations';
import { EResponsiveLayoutType } from '../../enums/copyleaks-web-report.enums';
import { distinctUntilChanged } from 'rxjs/operators';
import { PercentPipe } from '@angular/common';
import { RESULT_TAGS_CODES } from '../../constants/report-result-tags.constants';

@Component({
	selector: 'cr-filter-result-dailog',
	templateUrl: './filter-result-dailog.component.html',
	styleUrls: ['./filter-result-dailog.component.scss'],
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
	allExcludedDomains: string[] = [];
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
	initFormData: boolean = false;
	totalResultsWithoutDate: number;

	EFilterResultSection = EFilterResultSection;
	selectedFilter: EFilterResultSection;
	docDirection: 'ltr' | 'rtl';

	get totalFiltered() {
		return this.totalSourceType ? this.getTotalFilterdResult() : 0;
	}

	get sourceTypeFormGroup() {
		return this._filterResultsSvc.sourceTypeFormGroup;
	}

	constructor(
		private _filterResultsSvc: FilterResultDailogService,
		private _percentPipe: PercentPipe,
		private _dialogRef: MatDialogRef<FilterResultDailogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: IFilterResultDailogData
	) {}

	ngOnInit() {
		this.initResultItem();

		this.data.reportViewSvc?.reportResponsiveMode$.pipe(untilDestroy(this)).subscribe(view => {
			this.isMobile = view.mode === EResponsiveLayoutType.Mobile;
		});

		this.data.reportViewSvc?.documentDirection$.pipe(untilDestroy(this)).subscribe(dir => {
			this.docDirection = dir;
		});

		this._filterResultsSvc.filterResultFormGroup.valueChanges.pipe(untilDestroy(this)).subscribe(_ => {
			const formData = this.getFilterCurrentData();
			if (
				!formData.showInternetResults &&
				!formData.showBatchResults &&
				!formData.showYourResults &&
				!formData.showOthersResults &&
				!formData.showInternalDatabaseResults &&
				!formData.showAISourceMatch &&
				formData.hiddenRepositories &&
				formData.hiddenRepositories.length === this._filterResultsSvc.reposIds.length &&
				!(
					this.totalSourceType.totalInternet === 0 &&
					this.totalSourceType.totalInternalDatabase === 0 &&
					this.totalSourceType.totalbatch === 0 &&
					this.totalSourceType.totalAISourceMatch === 0 &&
					!(this.totalSourceType.repository && this.totalSourceType.repository?.length > 0)
				)
			) {
				setTimeout(() => {
					if (this.totalSourceType.totalInternet > 0)
						this._filterResultsSvc.filterResultFormGroup
							?.get(EFilterResultForm.fgSourceType)
							?.get(EFilterResultForm.fcInternet)
							?.setValue(true, { emitEvent: false });
					else if (this.totalSourceType.totalInternalDatabase > 0) {
						this._filterResultsSvc.filterResultFormGroup
							?.get(EFilterResultForm.fgSourceType)
							?.get(EFilterResultForm.fcInternalDatabase)
							?.setValue(true, { emitEvent: false });
						if (this.totalSourceType.totalYourFiles > 0)
							this._filterResultsSvc.sourceTypeFormGroup
								.get(EFilterResultForm.fcYourResults)
								?.setValue(true, { emitEvent: false });

						if (this.totalSourceType.totalOthersFiles > 0)
							this._filterResultsSvc.sourceTypeFormGroup
								.get(EFilterResultForm.fcOthersResults)
								?.setValue(true, { emitEvent: false });
					} else if (this.totalSourceType.totalbatch > 0)
						this._filterResultsSvc.filterResultFormGroup
							?.get(EFilterResultForm.fgSourceType)
							?.get(EFilterResultForm.fcBatch)
							?.setValue(true, { emitEvent: false });
					else if (this.totalSourceType.repository && this.totalSourceType.repository?.length > 0) {
						this._filterResultsSvc.filterResultFormGroup
							?.get(EFilterResultForm.fgSourceType)
							?.get(EFilterResultForm.fgRepositories)
							?.get(this._filterResultsSvc.reposIds[0].id)
							?.setValue(true, { emitEvent: false });
					} else if (this.totalSourceType.totalAISourceMatch > 0) {
						this._filterResultsSvc.filterResultFormGroup
							?.get(EFilterResultForm.fgSourceType)
							?.get(EFilterResultForm.fgAISourceMatch)
							?.setValue(true, { emitEvent: false });
					}
				});

				this.sourceTypeErrorMessage = $localize`At least one match Source type needs to be activated.`;
			} else if (
				!formData.showIdentical &&
				!formData.showMinorChanges &&
				!formData.showRelated &&
				!(this.totalParaphrased === 0 && this.totalMinorChanges === 0 && this.totalIdentical === 0)
			) {
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

		this._filterResultsSvc.sourceTypeFormGroup
			.get(EFilterResultForm.fcInternalDatabase)
			.valueChanges.pipe(untilDestroy(this))
			.subscribe(value => {
				// If the internal database is selected, then the your results and others results should be selected
				if (
					value &&
					!this._filterResultsSvc.sourceTypeFormGroup.get(EFilterResultForm.fcYourResults).value &&
					!this._filterResultsSvc.sourceTypeFormGroup.get(EFilterResultForm.fcOthersResults).value
				) {
					if (this.totalSourceType.totalYourFiles > 0)
						this._filterResultsSvc.sourceTypeFormGroup
							.get(EFilterResultForm.fcYourResults)
							?.setValue(true, { emitEvent: false });

					if (this.totalSourceType.totalOthersFiles > 0)
						this._filterResultsSvc.sourceTypeFormGroup
							.get(EFilterResultForm.fcOthersResults)
							?.setValue(true, { emitEvent: false });
				}

				// If the internal database is unselected, then the your results and others results should be unselected
				if (
					!value &&
					(this._filterResultsSvc.sourceTypeFormGroup.get(EFilterResultForm.fcYourResults).value ||
						this._filterResultsSvc.sourceTypeFormGroup.get(EFilterResultForm.fcOthersResults).value)
				) {
					this._filterResultsSvc.sourceTypeFormGroup
						.get(EFilterResultForm.fcYourResults)
						?.setValue(false, { emitEvent: false });
					this._filterResultsSvc.sourceTypeFormGroup
						.get(EFilterResultForm.fcOthersResults)
						?.setValue(false, { emitEvent: false });
				}
			});

		this._filterResultsSvc.sourceTypeFormGroup
			.get(EFilterResultForm.fcYourResults)
			.valueChanges.pipe(untilDestroy(this))
			.subscribe(value => {
				// If the your results is selected, then the internal database should be selected
				if (value && !this._filterResultsSvc.sourceTypeFormGroup.get(EFilterResultForm.fcInternalDatabase).value)
					this._filterResultsSvc.sourceTypeFormGroup
						.get(EFilterResultForm.fcInternalDatabase)
						?.setValue(true, { emitEvent: false });

				if (value && this.totalSourceType.totalYourFiles <= 0)
					this._filterResultsSvc.sourceTypeFormGroup
						.get(EFilterResultForm.fcYourResults)
						?.setValue(false, { emitEvent: false });

				// If both your results and others results are unselected, then the internal database should be unselected
				if (!value && !this._filterResultsSvc.sourceTypeFormGroup.get(EFilterResultForm.fcOthersResults).value)
					this._filterResultsSvc.sourceTypeFormGroup.get(EFilterResultForm.fcInternalDatabase)?.setValue(false);
			});

		this._filterResultsSvc.sourceTypeFormGroup
			.get(EFilterResultForm.fcOthersResults)
			.valueChanges.pipe(untilDestroy(this))
			.subscribe(value => {
				// If the your results is selected, then the internal database should be selected
				if (value && !this._filterResultsSvc.sourceTypeFormGroup.get(EFilterResultForm.fcInternalDatabase).value)
					this._filterResultsSvc.sourceTypeFormGroup
						.get(EFilterResultForm.fcInternalDatabase)
						?.setValue(true, { emitEvent: false });

				if (value && this.totalSourceType.totalOthersFiles <= 0)
					this._filterResultsSvc.sourceTypeFormGroup
						.get(EFilterResultForm.fcOthersResults)
						?.setValue(false, { emitEvent: false });

				// If both your results and others results are unselected, then the internal database should be unselected
				if (!value && !this._filterResultsSvc.sourceTypeFormGroup.get(EFilterResultForm.fcYourResults).value)
					this._filterResultsSvc.sourceTypeFormGroup.get(EFilterResultForm.fcInternalDatabase)?.setValue(false);
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
		var repositories = this.sourceTypeFormGroup.get(EFilterResultForm.fgRepositories) as UntypedFormGroup;
		for (const controlName in repositories.controls) {
			if (repositories.get(controlName)?.value) {
				countRepo += 1;
			}
		}
		return countRepo;
	}

	setTotalMatchTypesStatistics() {
		this.totalParaphrased = this.totalMinorChanges = this.totalIdentical = 0;

		const totalWords =
			(this.data?.reportDataSvc?.scanResultsPreviews$?.value?.scannedDocument?.totalWords ?? 0) -
			(this.data?.reportDataSvc?.scanResultsPreviews$?.value?.scannedDocument?.totalExcluded ?? 0);

		if (totalWords <= 0) {
			return;
		}

		const calculatePercentage = value => {
			const percentage = this._percentPipe.transform(value / totalWords, '1.0-1');
			return percentage !== '0%';
		};

		this.allResultsItem.forEach(result => {
			const stats = result.iStatisticsResult;

			if (stats.identical > 0 && calculatePercentage(stats.identical)) {
				this.totalIdentical++;
			}

			if (stats.minorChanges > 0 && calculatePercentage(stats.minorChanges)) {
				this.totalMinorChanges++;
			}

			if (stats.relatedMeaning > 0 && calculatePercentage(stats.relatedMeaning)) {
				this.totalParaphrased++;
			}
		});
	}

	setExcludedResultsStats() {
		const excludedResultsIds = this.data.reportDataSvc.excludedResultsIds;
		let filterData = this.getFilterCurrentData();
		if (!filterData.showIdentical && !filterData.showMinorChanges && !filterData.showRelated)
			filterData.showIdentical = filterData.showMinorChanges = filterData.showRelated = true;
		const filteredResults = this.data.reportDataSvc.filterResults(filterData, excludedResultsIds ?? []);
		this.excludedResults = this.allResultsItem.filter(
			result => !!excludedResultsIds?.find(id => result.resultPreview?.id === id)
		);

		this.resultsActions = {
			...this.resultsActions,
			totalExcluded: this.excludedResults.length,
			totalFiltered:
				(this.data.reportDataSvc.totalCompleteResults ?? 0) - filteredResults.length <= 0
					? 0
					: (this.data.reportDataSvc.totalCompleteResults ?? 0) -
					  filteredResults.length -
					  (excludedResultsIds?.length ?? 0),
			totalResults: this.data.reportDataSvc.totalCompleteResults,
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
		this.totalResultsWithoutDate = this.allResultsItem.filter(
			result => !result.resultPreview?.metadata?.publishDate
		).length;
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
		combineLatest([
			this.data.reportDataSvc.scanResultsPreviews$.pipe(distinctUntilChanged()),
			this.data.reportDataSvc.scanResultsDetails$.pipe(distinctUntilChanged()),
		])
			.pipe(untilDestroy(this))
			.subscribe(([completeResults, resultsDetails]) => {
				if (completeResults) {
					this.completeResults = completeResults;

					const results = completeResults.results;
					this.totalSourceType = {
						totalInternet: results.internet.length,
						totalInternalDatabase: results.database.length,
						totalbatch: results.batch.length,
						repository: this._filterResultsSvc.reposIds,
						totalYourFiles: results.database.filter(r => !!r.scanId).length,
						totalOthersFiles: results.database.filter(r => !r.scanId).length,
						totalAISourceMatch: 0,
					};

					const allResults = [
						...(results?.internet ?? []),
						...(results?.database ?? []),
						...(results?.batch ?? []),
						...(results?.repositories ?? []),
					];

					this.resultsActions.totalResults = allResults.length;
					this.totalSourceType.totalAISourceMatch =
						allResults?.filter(i => i.tags?.find(t => t.code === RESULT_TAGS_CODES.AI_SOURCE_MATCH))?.length ?? 0;

					this.allResultsItem = allResults.map(result => {
						const resultDetail = resultsDetails?.find(r => r.id === result.id);
						return {
							resultPreview: result,
							resultDetails: resultDetail,
							iStatisticsResult: {
								identical: resultDetail ? resultDetail?.result?.statistics.identical : result.identicalWords,
								minorChanges: resultDetail ? resultDetail?.result?.statistics.minorChanges : result.similarWords,
								relatedMeaning: resultDetail
									? resultDetail?.result?.statistics.relatedMeaning
									: result.paraphrasedWords,
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

					if (this.initFormData === false) this._filterResultsSvc.initForm(completeResults);

					this.totalSourceType.repository = this._filterResultsSvc.reposIds;

					this.setExcludedResultsStats();
					this.setResultsPublicationDate();
					this.setResultsWordsLimit();

					this.allTagItem = this._filterResultsSvc.selectedTagItem;

					this.allExcludedDomains = this._filterResultsSvc.excludedDomainsFormControl.value;
					this._filterResultsSvc.excludedDomainsFormControl.valueChanges.pipe(untilDestroy(this)).subscribe(value => {
						this.allExcludedDomains = value;
					});

					if (this.totalSourceType.totalYourFiles == 0) {
						this._filterResultsSvc.sourceTypeFormGroup
							.get(EFilterResultForm.fcYourResults)
							?.setValue(false, { emitEvent: false });
						this._filterResultsSvc.sourceTypeFormGroup.get(EFilterResultForm.fcYourResults)?.disable();
					}
					if (this.totalSourceType.totalOthersFiles == 0) {
						this._filterResultsSvc.sourceTypeFormGroup
							.get(EFilterResultForm.fcOthersResults)
							?.setValue(false, { emitEvent: false });
						this._filterResultsSvc.sourceTypeFormGroup.get(EFilterResultForm.fcOthersResults)?.disable();
					}

					this.loading = false;
					this.initFormData = true;
				}
			});
	}

	onClearFilter() {
		this._filterResultsSvc.clearForm();
		this.allTagItem = this._filterResultsSvc.selectedTagItem;
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
			includedTags: this._filterResultsSvc.selectedTagItem.filter(a => a.selected).map(a => a.title) ?? [],

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
					: this._filterResultsSvc.sourceTypeFormGroup.get(EFilterResultForm.fcYourResults)?.value ||
					  this._filterResultsSvc.sourceTypeFormGroup.get(EFilterResultForm.fcOthersResults)?.value,
			showYourResults:
				this.totalSourceType.totalInternalDatabase === 0
					? false
					: this._filterResultsSvc.sourceTypeFormGroup.get(EFilterResultForm.fcYourResults)?.value,
			showOthersResults:
				this.totalSourceType.totalInternalDatabase === 0
					? false
					: this._filterResultsSvc.sourceTypeFormGroup.get(EFilterResultForm.fcOthersResults)?.value,
			showBatchResults:
				this.totalSourceType.totalbatch === 0
					? false
					: this._filterResultsSvc.sourceTypeFormGroup.get(EFilterResultForm.fcBatch)?.value,
			hiddenRepositories: !this.totalSourceType.repository?.length
				? []
				: this._filterResultsSvc.getSelectedRepositoryIds(),
			showAISourceMatch:
				this.totalSourceType.totalAISourceMatch === 0
					? false
					: this._filterResultsSvc.sourceTypeFormGroup.get(EFilterResultForm.fgAISourceMatch)?.value,

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

			writingFeedback: {
				hiddenCategories: this.data.reportDataSvc.filterOptions.writingFeedback?.hiddenCategories ?? [],
			},
			excludedDomains: this._filterResultsSvc.excludedDomainsFormControl?.value ?? [],
		} as ICopyleaksReportOptions;
	}

	expandSettings(selectedFilter?: EFilterResultSection) {
		this.selectedFilter = selectedFilter;
	}

	ngOnDestroy() {}
}
