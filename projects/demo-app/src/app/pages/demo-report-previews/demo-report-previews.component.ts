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
	endpointsConfig: IClsReportEndpointConfigModel;
	paramSub: any;

	lockResultItem: ILockResultItem = {
		title: 'This is a partial report',
		titleIcon: 'lock',
		description: "You don't have enough credits to complete the scan.",
		buttonDescription: 'To continue this scan',
		buttonText: 'Upgrade',
		buttonIcon: 'all_inclusive',
	};

	constructor(private _route: ActivatedRoute) {}

	ngOnInit(): void {
		const id = this._route.snapshot.paramMap.get('id');
		const type = this._route.snapshot.paramMap.get('type');
		this.endpointsConfig = {
			authToken: '', // optional
			crawledVersion: `assets/scans/${type}/${id}/source.json`,
			completeResults: `assets/scans/${type}/${id}/complete.json`,
			result: `assets/scans/${type}/${id}/results/{RESULT_ID}`, // inside the package, we will be assignment the RESULT_ID
			filter: {
				get: '', // optional
				update: '', // optional
			},
		};
		this.paramSub = this._route.paramMap.subscribe(params => {
			const id = params.get('id');
			const type = params.get('type');
			this.endpointsConfig = {
				authToken: '', // optional
				crawledVersion: `assets/scans/${type}/${id}/source.json`,
				completeResults: `assets/scans/${type}/${id}/complete.json`,
				result: `assets/scans/${type}/${id}/results/{RESULT_ID}.json`, // inside the package, we will be assignment the RESULT_ID
				filter: {
					get: '', // optional
					update: '', // optional
				},
			};
		});
	}

	ngOnDestroy(): void {
		this.paramSub.unsubscribe();
	}
}
