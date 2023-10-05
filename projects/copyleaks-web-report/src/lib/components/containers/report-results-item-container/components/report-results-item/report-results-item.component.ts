import { Component, Input, OnInit } from '@angular/core';
import { EResultPreviewType } from 'projects/copyleaks-web-report/src/lib/enums/copyleaks-web-report.enums';
import { IResultPreviewBase } from 'projects/copyleaks-web-report/src/lib/models/copyleaks-report-data.models';

@Component({
	selector: 'cr-report-results-item',
	templateUrl: './report-results-item.component.html',
	styleUrls: ['./report-results-item.component.scss'],
})
export class ReportResultsItemComponent implements OnInit {
	eResultPreviewType = EResultPreviewType;
	@Input() previewResult: IResultPreviewBase = {
		id: '00fe0c8338',
		introduction: 'No introduction available.',
		matchedWords: 400,
		tags: [],
		title: 'Copyleaks Internal Database',
		type: 3,
	};
	constructor() {}

	ngOnInit(): void {}
}
