import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ECustomResultsReportView } from 'projects/copyleaks-web-report/src/lib/components/core/cr-custom-results/models/cr-custom-results.enums';
import {
	EReportLayoutType,
	EResultPreviewType,
} from 'projects/copyleaks-web-report/src/lib/enums/copyleaks-web-report.enums';
import { IClsReportEndpointConfigModel } from 'projects/copyleaks-web-report/src/lib/models/report-config.models';
import {
	ICompleteResults,
	ReportHttpRequestErrorModel,
	ReportRealtimeResultsService,
} from 'projects/copyleaks-web-report/src/public-api';
import { IDemoCustomResultsBoxItem } from '../../components/demo-custom-results-box-item/models/demo-custom-results-box-item.models';
import { IResultItem } from 'projects/copyleaks-web-report/src/lib/components/containers/report-results-item-container/components/models/report-result-item.models';

@Component({
	selector: 'app-demo-report-previews',
	templateUrl: './demo-report-previews.component.html',
	styleUrls: ['./demo-report-previews.component.scss'],
})
export class DemoReportPreviewsComponent implements OnInit {
	ReportLayoutType = EReportLayoutType;
	endpointsConfig: IClsReportEndpointConfigModel;
	paramSub: any;

	lockResultItem: IDemoCustomResultsBoxItem = {
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

	constructor(private _route: ActivatedRoute, private _reportRealtimeSvc: ReportRealtimeResultsService) {}

	ngOnInit(): void {
		this.id = this._route.snapshot.paramMap.get('id');
		this.type = this._route.snapshot.paramMap.get('type');
		this.endpointsConfig = {
			crawledVersion: { url: `assets/scans/${this.type}/${this.id}/source.json`, headers: {} },
			completeResults: { url: `assets/scans/${this.type}/${this.id}/complete.json`, headers: {} },
			result: { url: `assets/scans/${this.type}/${this.id}/results/{RESULT_ID}.json`, headers: {} },
			deleteResult: { url: `assets/delete/delete.json`, headers: {} },
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
				crawledVersion: { url: `assets/scans/${this.type}/${this.id}/source.json`, headers: {} },
				completeResults: { url: `assets/scans/${this.type}/${this.id}/complete.json`, headers: {} },
				result: { url: `assets/scans/${this.type}/${this.id}/results/{RESULT_ID}.json`, headers: {} },
				deleteResult: { url: `assets/delete/delete.json`, headers: {} },
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

		if (this.type === 'real-time') {
			this.endpointsConfig.progress = {
				url: `assets/scans/${this.type}/${this.id}/progress.json`,
				headers: {},
			};

			this._pushRealTimeResults();
		}
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

	private _pushRealTimeResults() {
		setTimeout(() => {
			this._reportRealtimeSvc.pushNewResults([
				{
					repositoryId: '',
					url: 'https://medium.com/@dschoenenberger/list/b37a02e2ee0c',
					id: '5738a169ae',
					type: EResultPreviewType.Internet,
					title: 'List: angular | Curated by Dominique Schoenenberger | Medium',
					introduction: 'Open in appSign up Sign In Write Sign up Sign In Follow Nov 12 ·10 stories angular Sha...',
					matchedWords: 59,
					metadata: {
						finalUrl: undefined,
						canonicalUrl: undefined,
						author: 'Dominique Schoenenberger',
						organization: 'Medium',
						filename: 'b37a02e2ee0c',
						publishDate: undefined,
						creationDate: '2023-06-09T14:49:44Z',
						lastModificationDate: '2023-11-12T05:53:07Z',
						submissionDate: undefined,
						submittedBy: undefined,
						customMetadata: undefined,
					},
					tags: [],
				},
			]);

			setTimeout(() => {
				this._reportRealtimeSvc.pushNewResults([
					{
						repositoryId: '',
						url: 'https://blog.stackademic.com/read-text-aloud-in-simple-javascript-9528a8457904?gi=6b81cd0f325a',
						id: '3b0edab479',
						type: EResultPreviewType.Internet,
						title: 'Read Text Aloud in Simple JavaScript | Stackademic',
						introduction:
							'Open in appSign up Sign In Write Sign up Sign In Read text aloud in simple JavaScript Anirudh Muni...',
						matchedWords: 32,
						metadata: {
							finalUrl: undefined,
							canonicalUrl: undefined,
							author: 'Anirudh Munipalli',
							organization: 'Stackademic',
							filename: 'read-text-aloud-in-simple-javascript-9528a8457904',
							publishDate: '2023-08-08T10:28:46Z',
							creationDate: '2023-08-08T10:28:46Z',
							lastModificationDate: '2023-08-10T12:06:52Z',
							submissionDate: undefined,
							submittedBy: undefined,
							customMetadata: undefined,
						},
						tags: [],
					},
					{
						repositoryId: '',
						url: 'https://blog.stackademic.com/kotlin-code-smells-010-undefined-9162b60b252c',
						id: '5aebdddb2e',
						type: EResultPreviewType.Internet,
						title: 'Kotlin Code Smells 10— undefined | Stackademic',
						introduction:
							'Open in appSign up Sign In Write Sign up Sign In Kotlin Code Smells 10— undefined Yonatan Karp-Rudin ...',
						matchedWords: 32,
						metadata: {
							finalUrl: undefined,
							canonicalUrl: undefined,
							author: 'Yonatan Karp-Rudin',
							organization: 'Stackademic',
							filename: 'kotlin-code-smells-010-undefined-9162b60b252c',
							publishDate: '2022-12-16T05:45:04Z',
							creationDate: '2022-12-16T05:45:04Z',
							lastModificationDate: '2023-08-05T20:07:31Z',
							submissionDate: undefined,
							submittedBy: undefined,
							customMetadata: undefined,
						},
						tags: [],
					},
				]);
			}, 7000);
		}, 10000);
	}

	onCompleteResultUpdate(event: ICompleteResults) {
		console.log(event);
	}

	onReportRequestError(event: ReportHttpRequestErrorModel) {
		console.log('error:', event);
	}

	lockedResultClick(result: IResultItem) {
		console.log(`----locked-result----`);
		console.log(result);
		console.log(`---------------------`);

		alert(`The 'Save Report' button was clicked for the result with the ID '${result.resultPreview.id}'.`);
	}

	ngOnDestroy(): void {
		this.paramSub.unsubscribe();
	}
}
