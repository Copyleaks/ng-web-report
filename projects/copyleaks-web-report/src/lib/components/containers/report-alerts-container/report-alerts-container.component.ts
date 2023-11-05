import { AfterViewInit, Component, ElementRef, HostBinding, Input, OnInit, ViewChild } from '@angular/core';
import { ICompleteResultNotificationAlert } from '../../../models/report-data.models';

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

	@ViewChild('alertsContainer') alertsContainerRef: ElementRef<HTMLDivElement>;
	@ViewChild('expansionPanel') expansionPanelRef: ElementRef;

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
	addPaddingToContainer: boolean;
	stopPaddingCheck: boolean;

	ngOnInit(): void {
		if (this.flexGrow !== undefined && this.flexGrow !== null) this.flexGrowProp = this.flexGrow;
	}

	hideAlertsClick() {
		this.hideAlerts = true;
	}

	showAlertsClick() {
		this.hideAlerts = false;
	}

	ngAfterViewInit() {
		this.checkForScrollbar();
	}

	private checkForScrollbar() {
		if (this.stopPaddingCheck) return;

		setTimeout(() => {
			const alertsContainer = this.alertsContainerRef.nativeElement;
			const expansionPanel = this.expansionPanelRef.nativeElement;

			const contentHeight = alertsContainer.scrollHeight;
			const hostHeight = expansionPanel.clientHeight;

			this.addPaddingToContainer = contentHeight > hostHeight - 24; // 24 is the title panel height
		});
		this.stopPaddingCheck = false;
	}
}
