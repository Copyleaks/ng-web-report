import { Component, Input, OnInit } from '@angular/core';
import { EResultPreviewType } from 'projects/copyleaks-web-report/src/lib/enums/copyleaks-web-report.enums';
import {
	IResultDetailResponse,
	IResultPreviewBase,
	IScanSource,
} from 'projects/copyleaks-web-report/src/lib/models/report-data.models';

@Component({
	selector: 'cr-report-results-item',
	templateUrl: './report-results-item.component.html',
	styleUrls: ['./report-results-item.component.scss'],
})
export class ReportResultsItemComponent implements OnInit {
	@Input() previewResult: IResultPreviewBase = {
		id: '00fe0c8338',
		introduction: 'No introduction available.',
		matchedWords: 400,
		tags: [],
		title: 'Copyleaks Internal Database',
		type: 3,
		url: 'url.com/slug/slug/123xyz..',
	};
	@Input() source: IScanSource;
	@Input() showLoader: boolean = false;

	identicalResult: number = 88;
	minorChangesResult: number = 2;
	paraphrasedResult: number = 2;
	eResultPreviewType = EResultPreviewType;

	get authorName() {
		if (this.previewResult) {
			switch (this.previewResult.type) {
				case EResultPreviewType.Internet:
					return 'Internet Result';
				case EResultPreviewType.Database:
					return 'Internal Database Result';
				case EResultPreviewType.Batch:
					return 'Batch Result';
				case EResultPreviewType.Repositroy:
					return 'Repository Result';
				default:
					return '';
			}
		}
		return '';
	}
	constructor() {}

	ngOnInit(): void {}
}
