import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ALERTS } from 'projects/copyleaks-web-report/src/lib/constants/report-alerts.constants';
import { ECompleteResultNotificationAlertSeverity } from 'projects/copyleaks-web-report/src/lib/enums/copyleaks-web-report.enums';
import { ICompleteResultNotificationAlert } from 'projects/copyleaks-web-report/src/lib/models/report-data.models';
import { ReportMatchHighlightService } from 'projects/copyleaks-web-report/src/lib/services/report-match-highlight.service';
import { ReportViewService } from 'projects/copyleaks-web-report/src/lib/services/report-view.service';
import { untilDestroy } from 'projects/copyleaks-web-report/src/lib/utils/until-destroy';

@Component({
	selector: 'cr-alert-card',
	templateUrl: './alert-card.component.html',
	styleUrls: ['./alert-card.component.scss'],
})
export class AlertCardComponent implements OnInit, OnDestroy {
	@Input() alert: ICompleteResultNotificationAlert;
	@Input() isSelected: boolean = false;

	severity = ECompleteResultNotificationAlertSeverity;

	matChipList: string[] = [];
	showMatChipList: boolean = true;

	get displayPreviewButton() {
		return (
			(this.alert?.helpLink && this.alert?.code == ALERTS.SUSPECTED_CHARACTER_REPLACEMENT_CODE) ||
			this.alert?.code == ALERTS.SUSPECTED_AI_TEXT_DETECTED
		);
	}

	constructor(private _reportView: ReportViewService, private _reportMatchSvc: ReportMatchHighlightService) {}

	ngOnInit(): void {
		if (this._reportView.reportViewMode.alertCode == this.alert.code) this.isSelected = true;
		this._reportView.selectedAlert$.pipe(untilDestroy(this)).subscribe(data => {
			this.isSelected = data === this.alert.code;
		});
	}

	toggleAlertPreview() {
		this.isSelected = !this.isSelected;

		this._reportView.selectedAlert$.next(!this.isSelected ? null : this.alert?.code);
		this._reportView.reportViewMode$.next({
			...this._reportView.reportViewMode,
			isHtmlView: !this.isSelected ? this._reportView.reportViewMode.isHtmlView : false,
			alertCode: !this.isSelected ? undefined : this.alert.code,
			sourcePageIndex: 1,
			suspectPageIndex: 1,
		});

		if (!this.isSelected) this._reportMatchSvc.clear();
	}

	ngOnDestroy(): void {}
}
