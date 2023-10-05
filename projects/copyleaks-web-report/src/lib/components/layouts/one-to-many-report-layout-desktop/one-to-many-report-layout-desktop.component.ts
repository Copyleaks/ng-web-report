import { Component, OnInit } from '@angular/core';
import { ReportDataService } from '../../../services/report-data.service';
import iframeScript from '../../../utils/one-to-many-iframe-logic';
import { COPYLEAKS_REPORT_IFRAME_STYLES } from '../../../constants/iframe-styles.constants';

@Component({
	selector: 'copyleaks-one-to-many-report-layout-desktop',
	templateUrl: './one-to-many-report-layout-desktop.component.html',
	styleUrls: ['./one-to-many-report-layout-desktop.component.scss'],
})
export class OneToManyReportLayoutDesktopComponent implements OnInit {
	hideRightSection = false;

	scanContentHtml: string;
	iframeStyle = COPYLEAKS_REPORT_IFRAME_STYLES;
	iframeScript = iframeScript;

	constructor(private _reportDataSvc: ReportDataService) {}

	ngOnInit(): void {
		this._reportDataSvc.crawledVersion$.subscribe(data => {
			if (data) this.scanContentHtml = data?.html.value;
		});
	}
}
