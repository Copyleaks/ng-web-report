import { Component } from '@angular/core';

@Component({
  selector: 'copyleaks-plagiarism-report',
  templateUrl: './copyleaks-plagiarism-report.component.html',
  styleUrls: ['./copyleaks-plagiarism-report.component.scss'],
})
export class CopyleaksPlagiarismReportComponent {
  hidePlagarismTap = false;
  hideAiTap = false;
  hideRightSection = false;
  hideReportActions = false;
  hideAlertsContainer = false;
  hideTitleContainer = false;
  hidePaginatorContainer = false;
}
