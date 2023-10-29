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
	 * @Input {boolean} Flag indicating whether the view is a mobile or not.
	 */
	@Input() isMobile: boolean;

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
			if (this.firstAlert && this.alerts?.length === 1) {
				this.containerHeight = this.firstAlert.nativeElement.offsetHeight;
				this.minHeight = `${this.containerHeight + 30}px`;
			}
		});
	}

	hideAlertsClick() {
		this.hideAlerts = true;
		setTimeout(() => {
			this.minHeight = '';
		});
	}

	showAlertsClick() {
		this.hideAlerts = false;
		setTimeout(() => {
			this.minHeight = `${this.containerHeight + 30}px`;
		});
	}
}
