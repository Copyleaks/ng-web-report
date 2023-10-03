import { Component, OnInit } from '@angular/core';
import { CopyleaksReportDataService } from '../../../services/copyleaks-report-data.service';

@Component({
	selector: 'copyleaks-one-to-many-report-layout-desktop',
	templateUrl: './one-to-many-report-layout-desktop.component.html',
	styleUrls: ['./one-to-many-report-layout-desktop.component.scss'],
})
export class OneToManyReportLayoutDesktopComponent implements OnInit {
	hideRightSection = false;

	scanContentHtml: string;

	constructor(private _reportDataSvc: CopyleaksReportDataService) {}

	ngOnInit(): void {
		this._reportDataSvc.crawledVersionSubject$.subscribe(data => {
			if (data) this.scanContentHtml = data?.html.value;
		});
	}
}
