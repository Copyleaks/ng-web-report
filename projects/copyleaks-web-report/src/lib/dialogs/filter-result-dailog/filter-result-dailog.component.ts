import { Component, OnInit } from '@angular/core';
import { FilterResultDailogService } from './services/filter-result-dailog.service';
import { IResultsActions } from '../../components/containers/report-results-container/components/results-actions/models/results-actions.models';
import { IClsReportEndpointConfigModel } from '../../models/report-config.models';
import { ReportDataService } from '../../services/report-data.service';
import { ITotalSourceType } from './components/source-type-filter-result/models/source-type-filter-result.models';
import { IResultItem } from '../../components/containers/report-results-item-container/components/models/report-result-item.models';
import { untilDestroy } from '../../utils/until-destroy';
import { combineLatest } from 'rxjs';

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
		this._reportDataSvc.initReportData(this.endpointsConfig);

		this._reportDataSvc.scanResultsPreviews$.subscribe(completeResults => {
			if (completeResults) {
				this.loading = false;
				const results = completeResults.results;
				this.totalSourceType = {
					totalInternet: results.internet.length,
					totalInternalDatabase: results.database.length,
					totalbatch: results.batch.length,
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
