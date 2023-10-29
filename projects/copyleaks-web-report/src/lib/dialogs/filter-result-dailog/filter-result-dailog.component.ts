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

@Component({
	selector: 'cr-filter-result-dailog',
	templateUrl: './filter-result-dailog.component.html',
	styleUrls: ['./filter-result-dailog.component.scss'],
})
export class FilterResultDailogComponent implements OnInit {
	resultsActions: IResultsActions = {
		totalResults: 30,
		totalExcluded: 30,
		totalFiltered: 30,
	};

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

	minWordLimit: number = 0;
	maxWordLimit: number = 1023;
	publicationDates: string[] = ['May 2023', 'June 2023', 'July 2023'];

	totalSourceType: ITotalSourceType;
	allResultsItem: IResultItem[] = [];
	loading: boolean = true;
	////
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
	///

	showExcludedDailog: boolean = false;
	constructor(private filterService: FilterResultDailogService, private _reportDataSvc: ReportDataService) {}

	ngOnInit() {
		this.filterService.initForm();
		this.initResultItem();
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
