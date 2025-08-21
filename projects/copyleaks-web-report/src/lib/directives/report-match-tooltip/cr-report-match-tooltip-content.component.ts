import { Component, OnInit } from '@angular/core';
import { trigger, state, transition, animate, style } from '@angular/animations';
import { IWritingFeedbackCorrectionViewModel } from '../../models/report-data.models';
import { ReportViewService } from '../../services/report-view.service';
import { untilDestroy } from '../../utils/until-destroy';

@Component({
	selector: 'cr-report-match-tooltip-content',
	templateUrl: './cr-report-match-tooltip-content.component.html',
	styleUrls: ['./cr-report-match-tooltip-content.component.scss'],
	animations: [trigger('fade', [state('void', style({ opacity: 0 })), transition('void <=> *', animate(300))])],
	standalone: false,
})
export class CrReportMatchTooltipContentComponent implements OnInit {
	correctionData: IWritingFeedbackCorrectionViewModel;
	docDirection: 'ltr' | 'rtl';

	constructor(private _reportViewSvc: ReportViewService) {}

	ngOnInit(): void {
		if (this._reportViewSvc)
			this._reportViewSvc.documentDirection$.pipe(untilDestroy(this)).subscribe(dir => {
				this.docDirection = dir;
			});
	}

	ngOnDestroy(): void {}
}
