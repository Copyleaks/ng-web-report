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
			authToken:
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlVzZXJOYW1lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c', // optional
			crawledVersion: {
				url: `assets/scans/bundle/${scanId}/source.json`,
				headers: { 'Content-Type': 'application/json' },
			},
			completeResults: {
				url: `assets/scans/bundle/${scanId}/complete.json`,
				headers: { 'Content-Type': 'application/json' },
			},
			result: {
				url: `assets/scans/bundle/${scanId}/results/{RESULT_ID}`,
				headers: { 'Content-Type': 'application/json' },
			},
			progress: {
				url: `assets/scans/bundle/${scanId}/progress`,
				headers: { 'Content-Type': 'application/json' },
			},
		};
	}
}
