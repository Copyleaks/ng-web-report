import { Component, OnInit } from '@angular/core';
import { IResultsActions } from '../../components/containers/report-results-container/components/results-actions/models/results-actions.models';
import { IResultItem } from '../../components/containers/report-results-item-container/components/models/report-result-item.models';
import { IClsReportEndpointConfigModel } from '../../models/report-config.models';
import { ReportDataService } from '../../services/report-data.service';
import {
	ITotalSourceType,
	REPOSITORIES,
} from './components/source-type-filter-result/models/source-type-filter-result.models';
import { FilterResultDailogService } from './services/filter-result-dailog.service';
import { ITagItem } from './components/included-tags-filter-result/models/included-tags-filter-result.models';
import { EFilterResultForm } from './models/filter-result-dailog.enum';
import { FormGroup } from '@angular/forms';

@Component({
	selector: 'cr-filter-result-dailog',
	templateUrl: './filter-result-dailog.component.html',
	styleUrls: ['./filter-result-dailog.component.scss'],
})
export class FilterResultDailogComponent implements OnInit {
	allTagItem: ITagItem[] = [
		{
			code: '0',
			title: 'Menu item1',
			description: 'string',
		},
		{
			code: '1',
			title: 'Menu item2',
			description: 'string',
		},
		{
			code: '2',
			title: 'Menu item12',
			description: 'string',
		},
		{
			code: '3',
			title: 'Menu item13',
			description: 'string',
		},
		{
			code: '4',
			title: 'Menu item14',
			description: 'string',
		},
		{
			code: '5',
			title: 'Menu item15',
			description: 'string',
		},
		{
			code: '10',
			title: 'Menu item1',
			description: 'string',
		},
		{
			code: '11',
			title: 'Menu item2',
			description: 'string',
		},
		{
			code: '12',
			title: 'Menu item12',
			description: 'string',
		},
		{
			code: '13',
			title: 'Menu item13',
			description: 'string',
		},
		{
			code: '14',
			title: 'Menu item14',
			description: 'string',
		},
		{
			code: '15',
			title: 'Menu item15',
			description: 'string',
		},
	];

	endpointsConfig: IClsReportEndpointConfigModel = {
		authToken: '', // optional
		crawledVersion: `assets/scans/bundle/Filter/source.json`,
		completeResults: `assets/scans/bundle/Filter/complete.json`,
		result: `assets/scans/bundle/Filter/results/{RESULT_ID}`, // inside the package, we will be assignment the RESULT_ID
		filter: {
			get: '', // optional
			update: '', // optional
		},
	};

	resultsActions: IResultsActions = {
		totalResults: 0,
		totalExcluded: 0,
		totalFiltered: 0,
	};
	totalSourceType: ITotalSourceType;
	allResultsItem: IResultItem[] = [];
	minWordLimit: number = 0;
	maxWordLimit: number = 1023;
	publicationDates: string[] = ['May 2023', 'June 2023', 'July 2023'];
	loading: boolean = true;
	showExcludedDailog: boolean = false;

	get totalFiltered() {
		return this.totalSourceType ? this.getTotalFilterdResult() : 0;
	}

	get sourceTypeFormGroup() {
		return this.filterService.sourceTypeFormGroup;
	}

	constructor(private filterService: FilterResultDailogService, private _reportDataSvc: ReportDataService) {}

	ngOnInit() {
		this.filterService.initForm();

		this.initResultItem();
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

	initResultItem() {
		this._reportDataSvc.initReportData(this.endpointsConfig);

		this._reportDataSvc.scanResultsPreviews$.subscribe(completeResults => {
			if (completeResults) {
				this.loading = false;
				const results = completeResults.results;
				this.totalSourceType = {
					totalInternet: results.internet.length,
					totalInternalDatabase: results.database.length,
					totalbatch: results.batch.length,
					repository: REPOSITORIES,
				};

				const allResults = [
					...(results?.internet ?? []),
					...(results?.database ?? []),
					...(results?.batch ?? []),
					...(results?.repositories ?? []),
				];

				this.resultsActions.totalResults = allResults.length;
				//this.resultsActions.totalFiltered = this.filterService.gettotalFilterd(this.totalSourceType);
				this.allResultsItem = allResults.map(result => {
					return {
						resultPreview: result,
						iStatisticsResult: {
							identical: 12,
							minorChanges: 12,
							relatedMeaning: 12,
						},
						metadataSource: {
							words: 0,
							excluded: 0,
						},
					} as IResultItem;
				});
			}
		});
	}

	clearFilterButton() {}
}
