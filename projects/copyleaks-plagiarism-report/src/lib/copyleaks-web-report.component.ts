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

	/**
	 * @Input {ReportLayoutType} - The copyleaks report layout type.
	 * @Default value: ReportLayoutType.OneToMany
	 */
	@Input() reportLayoutType: ReportLayoutType = ReportLayoutType.OneToMany;

	/**
	 * @Input {ReportLayoutType} - The copyleaks report reposive type.
	 */
	@Input() responsiveLayoutType: ResponsiveLayoutType | null = null;

	// Layout realated properties
	ReportLayoutType = ReportLayoutType;
	ResponsiveLayoutType = ResponsiveLayoutType;
	layoutChangesSub: any;

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

	/**
	 * Reads the report custom components templates references & saves them in the templates service.
	 */
	private _initCustomTemplatesRefs() {
		// Read the report custom actions template reference.
		if (this.customActionsTemplate)
			this._reportNgTemplatesSvc.setReportCustomActionsTemplateRef(this.customActionsTemplate);

		// Read the report custom results template reference.
		if (this.customResultsTemplate)
			this._reportNgTemplatesSvc.setReportCustomResultsTemplateRef(this.customResultsTemplate);
	}

	/**
	 * Starts a subscription for the screen size changes & updates the layout & responsive view accordingly.
	 */
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

		this.layoutChangesSub = layoutChanges
			.pipe(
				map(result => {
					if (result.matches) {
						// Desktop view
						if (
							result.breakpoints[Breakpoints.Web] ||
							result.breakpoints[Breakpoints.Large] ||
							result.breakpoints[Breakpoints.XLarge]
						) {
							return ResponsiveLayoutType.Desktop;
						}
						// Tablet view
						if (
							result.breakpoints[Breakpoints.Tablet] ||
							result.breakpoints[Breakpoints.TabletLandscape] ||
							result.breakpoints[Breakpoints.Medium]
						) {
							return ResponsiveLayoutType.Tablet;
						}
						// Mobile view
						else return ResponsiveLayoutType.Mobile;
					}
					return null;
				})
			)
			.subscribe((layout: ResponsiveLayoutType | null) => {
				this.responsiveLayoutType = layout;
			});
	}

	ngOnDestroy() {
		if (this.layoutChangesSub) this.layoutChangesSub.unsubscribe();
	}
}
