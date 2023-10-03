import { Component } from '@angular/core';
import {
	EReportLayoutType,
	EResponsiveLayoutType,
} from 'projects/copyleaks-web-report/src/lib/enums/copyleaks-web-report.enums';

@Component({
	selector: 'app-demo-layouts-page',
	templateUrl: './demo-layouts-page.component.html',
	styleUrls: ['./demo-layouts-page.component.scss'],
})
export class DemoLayoutsPageComponent {
	ReportLayoutType = EReportLayoutType;
	ResponsiveLayoutType = EResponsiveLayoutType;
}
