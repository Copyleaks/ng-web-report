import { Component, Input, OnInit } from '@angular/core';
import { ALERTS } from 'projects/copyleaks-web-report/src/lib/enums/copyleaks-web-report.consts';
import { ECompleteResultNotificationAlertSeverity } from 'projects/copyleaks-web-report/src/lib/enums/copyleaks-web-report.enums';
import { ReportAlertsService } from '../../service/report-alerts.service';
import { ICompleteResultNotificationAlert } from 'projects/copyleaks-web-report/src/lib/models/report-data.models';

@Component({
	selector: 'cr-alert-card',
	templateUrl: './alert-card.component.html',
	styleUrls: ['./alert-card.component.scss'],
})
export class AlertCardComponent implements OnInit {
	@Input() alert: ICompleteResultNotificationAlert;
	severity = ECompleteResultNotificationAlertSeverity;

	matChipList: string[] = ['Late', 'Late'];
	showMatChipList: boolean = true;

	get displayPreviewButton() {
		return (
			this.alert?.helpLink &&
			(this.alert?.code == ALERTS.SUSPECTED_CHARACTER_REPLACEMENT_CODE ||
				this.alert?.code == ALERTS.SUSPECTED_AI_TEXT_DETECTED)
		);
	}

	get selecteAlert() {
		// return this._reportAlertsService?.showAlertPreview$.value;
		return true;
	}
	constructor(private _reportAlertsService: ReportAlertsService) {}

	ngOnInit(): void {}

	showAlertPreview() {
		this._reportAlertsService.setShowAlertPreview$(!this.selecteAlert);
	}
}
