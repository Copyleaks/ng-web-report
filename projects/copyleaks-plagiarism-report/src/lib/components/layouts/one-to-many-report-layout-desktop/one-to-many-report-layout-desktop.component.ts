import { AfterViewInit, Component, ContentChild, ElementRef, OnInit, Renderer2, TemplateRef } from '@angular/core';
import { ReportNgTemplatesService } from '../../../services/report-ng-templates.service';

@Component({
	selector: 'copyleaks-one-to-many-report-layout-desktop',
	templateUrl: './one-to-many-report-layout-desktop.component.html',
	styleUrls: ['./one-to-many-report-layout-desktop.component.scss'],
})
export class OneToManyReportLayoutDesktopComponent implements OnInit, AfterViewInit {
	hideRightSection = false;

	constructor(private _renderer: Renderer2, private _el: ElementRef) {}

	ngOnInit(): void {}

	ngAfterViewInit(): void {
		this._setResultsContainerHeight();
	}

	private _setResultsContainerHeight() {
		// Get the results container & also its container
		const resultsAndAlertsContainer = this._el?.nativeElement?.querySelector('#results-alerts-container');
		const rightSectionContainer = this._el?.nativeElement?.querySelector('#one-to-many-report-right-section');

		if (!resultsAndAlertsContainer || !rightSectionContainer) return;

		// Set the containers height to its distance from the top section (right section)
		const offsetTop =
			resultsAndAlertsContainer.getBoundingClientRect().top - rightSectionContainer.getBoundingClientRect().top;

		// Set the element height to `calc(100% - offsetTop)`
		this._renderer.setStyle(resultsAndAlertsContainer, 'height', `calc(100% - ${offsetTop}px)`);
	}
}
