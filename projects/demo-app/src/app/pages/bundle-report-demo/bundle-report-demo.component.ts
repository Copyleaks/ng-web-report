import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-bundle-report-demo',
	templateUrl: './bundle-report-demo.component.html',
	styleUrls: ['./bundle-report-demo.component.scss'],
})
export class BundleReportDemoComponent implements OnInit {
	reportEndPoints = {};

	constructor(private _activeRoute: ActivatedRoute) {}

	ngOnInit(): void {
		var scanId = this._activeRoute.snapshot.paramMap.get('scanId');

		if (!scanId) throw 'scanId is missing';

		this.reportEndPoints = {
			authToken: '', // optional
			crawledVersion: `assets/scans/bundle/${scanId}/source.json`,
			completeResults: `assets/scans/bundle/${scanId}/complete.json`,
			result: `assets/scans/bundle/${scanId}/results/{RESULT_ID}`, // inside the package, we will be assignment the RESULT_ID
			filter: {
				get: '', // optional
				update: '', // optional
			},
		};
	}
}
