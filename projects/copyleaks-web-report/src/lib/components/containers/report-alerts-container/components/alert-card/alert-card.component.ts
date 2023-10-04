import { Component, Input, OnInit } from '@angular/core';
import { ALERTS } from 'projects/copyleaks-web-report/src/lib/enums/copyleaks-web-report.consts';
import { ECompleteResultNotificationAlertSeverity } from 'projects/copyleaks-web-report/src/lib/enums/copyleaks-web-report.enums';
import { ICompleteResultNotificationAlert } from 'projects/copyleaks-web-report/src/lib/models/copyleaks-report-data.models';
import { ReportAlertsService } from '../../service/report-alerts.service';

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
		return this._reportAlertsService?.showAlertPreview$.value;
	}
	constructor(private _reportAlertsService: ReportAlertsService) {}

	ngOnInit(): void {
		this.alert = {
			additionalData:
				'\'{"results":[{"classification":2,"probability":0.91045016,"matches":[{"text":{"chars":{"starts":[0],"lengths":[4005]},"words":{"starts":[0],"lengths":[661]}}}]}],"summary":{"human":0.0,"ai":1.0},"modelVersion":"v3","translationProvider":0,"scannedDocument":{}}',
			code: 'suspected-ai-text',
			helpLink: '',
			message: 'We are unable to verify that the text was written by a human.',
			severity: ECompleteResultNotificationAlertSeverity.VeryHigh,
			title: 'Suspected Cheating: AI Text detected',
		};
	}

	showAlertPreview() {
		this._reportAlertsService.setShowAlertPreview$(!this.selecteAlert);
	}
}
