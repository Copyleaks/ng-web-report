import { Component, Input } from '@angular/core';

@Component({
	selector: 'copyleaks-report-tabs-container',
	templateUrl: './report-tabs-container.component.html',
	styleUrls: ['./report-tabs-container.component.scss'],
})
export class ReportTabsContainerComponent {
	@Input() hidePlagarismTap = false;
	@Input() hideAiTap = false;
}
