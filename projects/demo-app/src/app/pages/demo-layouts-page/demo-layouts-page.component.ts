import { Component } from '@angular/core';
import {
  ReportLayoutType,
  ResponsiveLayoutType,
} from 'projects/copyleaks-plagiarism-report/src/lib/models/copyleaks-plagiarism-report.enums';

@Component({
  selector: 'app-demo-layouts-page',
  templateUrl: './demo-layouts-page.component.html',
  styleUrls: ['./demo-layouts-page.component.scss'],
})
export class DemoLayoutsPageComponent {
  ReportLayoutType = ReportLayoutType;
  ResponsiveLayoutType = ResponsiveLayoutType;
}
