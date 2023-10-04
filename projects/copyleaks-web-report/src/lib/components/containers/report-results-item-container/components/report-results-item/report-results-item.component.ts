import { Component, Input, OnInit } from '@angular/core';
import { IResultPreviewBase } from 'projects/copyleaks-web-report/src/lib/models/copyleaks-report-data.models';

@Component({
	selector: 'cr-report-results-item',
	templateUrl: './report-results-item.component.html',
	styleUrls: ['./report-results-item.component.scss'],
})
export class ReportResultsItemComponent implements OnInit {
	@Input() resultPreview: IResultPreviewBase;
	constructor() {}

	ngOnInit(): void {}
}
