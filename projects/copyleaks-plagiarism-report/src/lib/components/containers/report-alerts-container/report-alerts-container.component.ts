import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
	selector: 'copyleaks-report-alerts-container',
	templateUrl: './report-alerts-container.component.html',
	styleUrls: ['./report-alerts-container.component.scss'],
})
export class ReportAlertsContainerComponent implements OnInit {
	@HostBinding('style.display')
	display = 'flex';

	@HostBinding('style.flex-grow')
	flexGrowProp: number;

	@Input() flexGrow: number;

	ngOnInit(): void {
		if (this.flexGrow !== undefined && this.flexGrow !== null) this.flexGrowProp = this.flexGrow;
	}

	hideAlertsContainer() {
		this.display = 'none';
	}
}
