import { Component } from '@angular/core';
import { EReportLayoutType } from 'projects/copyleaks-web-report/src/lib/enums/copyleaks-web-report.enums';
import { IClsReportEndpointConfigModel } from 'projects/copyleaks-web-report/src/lib/models/report-data.models';

@Component({
	selector: 'app-demo-report-previews',
	templateUrl: './demo-report-previews.component.html',
	styleUrls: ['./demo-report-previews.component.scss'],
})
export class DemoReportPreviewsComponent {
	ReportLayoutType = EReportLayoutType;
	endpointsConfig: IClsReportEndpointConfigModel = {
		authToken: '', // optional
		crawledVersion: `assets/scans/bundle/default/source.json`,
		completeResults: `assets/scans/bundle/default/complete.json`,
		result: `assets/scans/bundle/default/results/{RESULT_ID}`, // inside the package, we will be assignment the RESULT_ID
		filter: {
			get: '', // optional
			update: '', // optional
		},
	};
}
