import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ILockResultItem } from 'projects/copyleaks-web-report/src/lib/components/containers/report-results-item-container/components/lock-result-item/models/lock-result-item.models';
import { ECustomResultsReportView } from 'projects/copyleaks-web-report/src/lib/components/core/cr-custom-results/models/cr-custom-results.enums';
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

	id: string | null;
	type: string | null;

	viewDisabledProduct: boolean;
	showCustomPlagiairsmTab: boolean;
	showCustomAiTab: boolean;
	showCustomEmptyResults: boolean = true;
	showCustomResults: boolean = true;
	reportView: ECustomResultsReportView;

	constructor(private _route: ActivatedRoute) {}

	ngOnInit(): void {
		this.id = this._route.snapshot.paramMap.get('id');
		this.type = this._route.snapshot.paramMap.get('type');
		this.endpointsConfig = {
			authToken: '', // optional
			crawledVersion: `assets/scans/${this.type}/${this.id}/source.json`,
			completeResults: `assets/scans/${this.type}/${this.id}/complete.json`,
			result: `assets/scans/${this.type}/${this.id}/results/{RESULT_ID}.json`, // inside the package, we will be assignment the RESULT_ID
			filter: {
				get: '', // optional
				update: '', // optional
			},
		};
		this._handleCustomComponentsView(this.id, this.type);

		this.paramSub = this._route.paramMap.subscribe(params => {
			const id = params.get('id');
			const type = params.get('type');

			if (this.id == id && this.type == type) {
				return;
			}

			this.id = id;
			this.type = type;
			this.endpointsConfig = {
				authToken: '', // optional
				crawledVersion: `assets/scans/${this.type}/${this.id}/source.json`,
				completeResults: `assets/scans/${this.type}/${this.id}/complete.json`,
				result: `assets/scans/${this.type}/${this.id}/results/{RESULT_ID}.json`, // inside the package, we will be assignment the RESULT_ID
				filter: {
					get: '', // optional
					update: '', // optional
				},
			};

			this._handleCustomComponentsView(id, type);
		});
	}

	private _handleCustomComponentsView(id: string | null, type: string | null) {
		this.showCustomPlagiairsmTab = type === 'plagiairsm-only';
		this.showCustomAiTab = type === 'ai-only';
		this.showCustomEmptyResults = id === 'custom-empty-state';
		this.showCustomResults = id === 'partial-report' || type === 'all-disabled';
		this.reportView = type === 'all-disabled' ? ECustomResultsReportView.Full : ECustomResultsReportView.Partial;

		switch (this.reportView) {
			case ECustomResultsReportView.Full:
				this.lockResultItem = {
					title: 'Report unavailable',
					titleIcon: 'lock',
					description: 'Enable Auto Refill to ensure you never run out of credits mid-scan.',
					buttonDescription: 'To show results',
					buttonText: 'Auto refill',
					buttonIcon: 'all_inclusive',
				};
				break;
			case ECustomResultsReportView.Partial:
				this.lockResultItem = {
					title: 'This is a partial report',
					titleIcon: 'lock',
					description: "You don't have enough credits to complete the scan.",
					buttonDescription: 'To continue this scan',
					buttonText: 'Upgrade',
					buttonIcon: 'all_inclusive',
				};
				break;
			default:
				break;
		}
	}

	onCompleteResultUpdate($event: any) {
		console.log($event);
	}

	ngOnDestroy(): void {
		this.paramSub.unsubscribe();
	}
}
