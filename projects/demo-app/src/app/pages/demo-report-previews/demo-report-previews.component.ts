import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ILockResultItem } from 'projects/copyleaks-web-report/src/lib/components/containers/report-results-item-container/components/lock-result-item/models/lock-result-item.models';
import { EReportLayoutType } from 'projects/copyleaks-web-report/src/lib/enums/copyleaks-web-report.enums';
import { IClsReportEndpointConfigModel } from 'projects/copyleaks-web-report/src/lib/models/report-config.models';

@Component({
	selector: 'app-demo-report-previews',
	templateUrl: './demo-report-previews.component.html',
	styleUrls: ['./demo-report-previews.component.scss'],
})
export class DemoReportPreviewsComponent implements OnInit {
	ReportLayoutType = EReportLayoutType;
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
	paramSub: any;

	lockResultItem: ILockResultItem = {
		title: 'This is a partial report',
		titleIcon: 'lock',
		description: "You don't have enough credits to complete the scan.",
		buttonDescription: 'To continue this scan',
		buttonText: 'Upgrade',
		buttonIcon: 'all_inclusive',
	};

	showCustomResults: boolean = false;

	constructor(private _route: ActivatedRoute) {}

	ngOnInit(): void {
		this.paramSub = this._route.paramMap.subscribe(params => {
			const id = params.get('id');
			this.endpointsConfig = {
				authToken: '', // optional
				crawledVersion: `assets/scans/bundle/${id}/source.json`,
				completeResults: `assets/scans/bundle/${id}/complete.json`,
				result: `assets/scans/bundle/${id}/results/{RESULT_ID}.json`, // inside the package, we will be assignment the RESULT_ID
				filter: {
					get: '', // optional
					update: '', // optional
				},
			};
		});

		setInterval(() => {
			this.showCustomResults = !this.showCustomResults;
		}, 5000);
	}

	ngOnDestroy(): void {
		this.paramSub.unsubscribe();
	}
}
