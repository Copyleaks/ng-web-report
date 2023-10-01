import { Component, Input } from '@angular/core';

@Component({
	selector: 'copyleaks-report-tabs-container',
	templateUrl: './report-tabs-container.component.html',
	styleUrls: ['./report-tabs-container.component.scss'],
})
export class ReportTabsContainerComponent {
	/**
	 * @Input {boolean} Flag indicating whether to show the report Plagiarism tab or not.
	 */
	@Input() hidePlagarismTap = false;

	/**
	 * @Input {boolean} Flag indicating whether to show the report AI tab or not.
	 */
	@Input() hideAiTap = false;
}
