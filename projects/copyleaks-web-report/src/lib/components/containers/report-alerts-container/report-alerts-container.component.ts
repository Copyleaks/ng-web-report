import { AfterViewInit, Component, ElementRef, HostBinding, Input, OnInit, ViewChild } from '@angular/core';
import { ICompleteResultNotificationAlert } from '../../../models/report-data.models';

@Component({
	selector: 'copyleaks-report-alerts-container',
	templateUrl: './report-alerts-container.component.html',
	styleUrls: ['./report-alerts-container.component.scss'],
})
export class ReportAlertsContainerComponent implements OnInit, AfterViewInit {
	@HostBinding('style.display')
	display = 'flex';

	@HostBinding('style.flex-grow')
	flexGrowProp: number;

	@HostBinding('style.min-height')
	minHeight: string;

	@ViewChild('firstAlert', { static: false }) firstAlert: ElementRef;

	/**
	 * @Input {number} Flex grow property - flex-grow
	 */
	@Input() flexGrow: number;

	/**
	 * @Input Alerts list.
	 */
	@Input() alerts: ICompleteResultNotificationAlert[];

	hideAlerts: boolean = false;
	containerHeight: number;

	ngOnInit(): void {
		if (this.flexGrow !== undefined && this.flexGrow !== null) this.flexGrowProp = this.flexGrow;
	}

	ngAfterViewInit() {
		setTimeout(() => {
			if (this.firstAlert) {
				this.containerHeight = this.firstAlert.nativeElement.offsetHeight;
				this.minHeight = `${this.containerHeight + 50}px`;
			}
		});
	}

	hideAlertsClick() {
		this.hideAlerts = !this.hideAlerts;

		if (this.hideAlerts) this.minHeight = '0px';
		else this.minHeight = `${this.containerHeight + 50}px`;
	}
}
