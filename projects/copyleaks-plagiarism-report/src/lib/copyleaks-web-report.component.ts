import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ReportLayoutType, ResponsiveLayoutType } from './models/copyleaks-plagiarism-report.enums';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { ReportNgTemplatesService } from './services/report-ng-templates.service';

@Component({
	selector: 'copyleaks-web-report',
	templateUrl: './copyleaks-web-report.component.html',
	styleUrls: ['./copyleaks-web-report.component.scss'],
	providers: [ReportNgTemplatesService],
})
export class CopyleaksWebReportComponent implements OnInit, OnDestroy {
	@ViewChild('customActionsTemplate', { static: true }) customActionsTemplate: TemplateRef<any>;
	@ViewChild('customResultsTemplate', { static: true }) customResultsTemplate: TemplateRef<any>;

	@Input() reportLayoutType: ReportLayoutType = ReportLayoutType.OneToMany;
	@Input() responsiveLayoutType: ResponsiveLayoutType | null = null;

	// Layout realated properties
	ReportLayoutType = ReportLayoutType;
	ResponsiveLayoutType = ResponsiveLayoutType;
	layoutSub: any;

	// Template references related properties
	customActionsTemplateRef: TemplateRef<any>;
	customResultsTemplateRef: TemplateRef<any>;

	constructor(
		private _breakpointObserver: BreakpointObserver,
		private _reportNgTemplatesSvc: ReportNgTemplatesService
	) {}

	ngOnInit(): void {
		if (this.responsiveLayoutType == null) this._initResponsiveLayoutType();
	}

	ngAfterViewInit() {
		this._initCustomTemplatesRefs();
	}

	private _initCustomTemplatesRefs() {
		if (this.customActionsTemplate)
			this._reportNgTemplatesSvc.setReportCustomActionsTemplateRef(this.customActionsTemplate);

		if (this.customResultsTemplate)
			this._reportNgTemplatesSvc.setReportCustomResultsTemplateRef(this.customResultsTemplate);
	}

	private _initResponsiveLayoutType() {
		const layoutChanges = this._breakpointObserver.observe([
			Breakpoints.Handset,
			Breakpoints.Tablet,
			Breakpoints.Web,
			Breakpoints.Large,
			Breakpoints.XLarge,
			Breakpoints.TabletLandscape,
			Breakpoints.Medium,
			Breakpoints.Small,
			Breakpoints.XSmall,
			Breakpoints.HandsetPortrait,
			Breakpoints.HandsetLandscape,
			Breakpoints.TabletPortrait,
		]);

		this.layoutSub = layoutChanges
			.pipe(
				map(result => {
					if (result.matches) {
						if (
							result.breakpoints[Breakpoints.Web] ||
							result.breakpoints[Breakpoints.Large] ||
							result.breakpoints[Breakpoints.XLarge]
						) {
							return ResponsiveLayoutType.Desktop;
						}
						if (
							result.breakpoints[Breakpoints.Tablet] ||
							result.breakpoints[Breakpoints.TabletLandscape] ||
							result.breakpoints[Breakpoints.Medium]
						) {
							return ResponsiveLayoutType.Tablet;
						} else return ResponsiveLayoutType.Mobile;
					}
					return null;
				})
			)
			.subscribe((layout: ResponsiveLayoutType | null) => {
				this.responsiveLayoutType = layout;
			});
	}

	ngOnDestroy() {
		if (this.layoutSub) this.layoutSub.unsubscribe();
	}
}
