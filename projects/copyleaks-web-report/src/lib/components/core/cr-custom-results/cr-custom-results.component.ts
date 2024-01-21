import {
	AfterViewInit,
	Component,
	ElementRef,
	HostListener,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	SimpleChanges,
} from '@angular/core';
import { EResponsiveLayoutType } from '../../../enums/copyleaks-web-report.enums';
import { ReportNgTemplatesService } from '../../../services/report-ng-templates.service';
import { ReportViewService } from '../../../services/report-view.service';
import { untilDestroy } from '../../../utils/until-destroy';
import { IResultsActions } from '../../containers/report-results-container/components/results-actions/models/results-actions.models';
import { ECustomResultsReportView } from './models/cr-custom-results.enums';

@Component({
	selector: 'cr-custom-results',
	templateUrl: './cr-custom-results.component.html',
	styleUrls: ['./cr-custom-results.component.scss'],
})
export class CrCustomResultsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
	@Input() reportView: ECustomResultsReportView = ECustomResultsReportView.Partial;

	resultsActionsMock: IResultsActions = {
		totalResults: 0,
		totalExcluded: 0,
		totalFiltered: 0,
		selectedResults: 0,
	};
	responsiveMode: EResponsiveLayoutType;

	ECustomResultsReportView = ECustomResultsReportView;
	EResponsiveLayoutType = EResponsiveLayoutType;

	@HostListener('window:resize', ['$event'])
	onResize() {}

	constructor(
		private _reportTemplatesSvc: ReportNgTemplatesService,
		public reportViewSvc: ReportViewService,
		private _el: ElementRef
	) {}

	ngOnInit(): void {
		setTimeout(() => {
			this._reportTemplatesSvc.reportTemplatesMode$.next(this.reportView);
			this.responsiveMode = this.reportViewSvc.reportResponsiveMode$.value?.mode ?? EResponsiveLayoutType.Desktop;
			this.reportViewSvc.reportResponsiveMode$.pipe(untilDestroy(this)).subscribe(data => {
				if (!data) return;
				this.responsiveMode = data.mode;
			});
		});
	}

	ngOnChanges(changes: SimpleChanges): void {
		if ('reportView' in changes) this._reportTemplatesSvc.reportTemplatesMode$.next(this.reportView);
	}

	ngAfterViewInit() {}

	get listOfLoadingResults(): number[] {
		let numberOfLoadingResults = this.hostHeight / 145;
		return Array.from({ length: Math.round(numberOfLoadingResults) + 1 }, (_, k) => k + 1);
	}

	get hostHeight(): number {
		return this._el.nativeElement.offsetHeight - (this.reportView === ECustomResultsReportView.Full ? 38 : 0);
	}

	ngOnDestroy(): void {}
}
