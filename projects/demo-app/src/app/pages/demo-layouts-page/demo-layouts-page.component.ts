import { Component } from '@angular/core';
import {
	EReportLayoutType,
	EResponsiveLayoutType,
} from 'projects/copyleaks-plagiarism-report/src/lib/enums/copyleaks-plagiarism-report.enums';

@Component({
	selector: 'app-demo-layouts-page',
	templateUrl: './demo-layouts-page.component.html',
	styleUrls: ['./demo-layouts-page.component.scss'],
})
export class DemoLayoutsPageComponent {
	ReportLayoutType = EReportLayoutType;
	ResponsiveLayoutType = EResponsiveLayoutType;
}
