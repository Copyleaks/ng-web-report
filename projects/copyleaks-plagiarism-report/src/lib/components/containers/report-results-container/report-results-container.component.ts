import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
	selector: 'copyleaks-report-results-container',
	templateUrl: './report-results-container.component.html',
	styleUrls: ['./report-results-container.component.scss'],
})
export class ReportResultsContainerComponent implements OnInit {
	@HostBinding('style.flex-grow')
	flexGrowProp: number;

	@HostBinding('style.display')
	display = 'flex';

	/**
	 * @Input {number} Flex grow property - flex-grow
	 */
	@Input() flexGrow: number;

	ngOnInit(): void {
		if (this.flexGrow !== undefined && this.flexGrow !== null) this.flexGrowProp = this.flexGrow;
	}

	hideResultsContainer() {
		this.display = 'none';
	}
}
