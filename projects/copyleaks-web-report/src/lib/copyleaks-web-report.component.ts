import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { EReportLayoutType, EResponsiveLayoutType } from './enums/copyleaks-web-report.enums';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { ReportNgTemplatesService } from './services/report-ng-templates.service';
import { ReportDataService } from './services/report-data.service';
import { ReportMatchesService } from './services/report-matches.service';
import { ReportViewService } from './services/report-view.service';
import { IClsReportEndpointConfigModel, ViewMode } from './models/report-config.models';
import { ReportMatchHighlightService } from './services/report-match-highlight.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IReportViewEvent, IReportViewQueryParams } from './models/report-view.models';

@Component({
	selector: 'copyleaks-web-report',
	templateUrl: './copyleaks-web-report.component.html',
	styleUrls: ['./copyleaks-web-report.component.scss'],
	providers: [
		ReportNgTemplatesService,
		ReportDataService,
		ReportMatchesService,
		ReportViewService,
		ReportMatchHighlightService,
	],
})
export class CopyleaksWebReportComponent implements OnInit, OnDestroy {
	@ViewChild('customActionsTemplate', { static: true }) customActionsTemplate: TemplateRef<any>;
	@ViewChild('customResultsTemplate', { static: true }) customResultsTemplate: TemplateRef<any>;

	/**
	 * @Input {ReportLayoutType} - The copyleaks report layout type.
	 * @Default value: ReportLayoutType.OneToMany
	 */
	@Input() reportLayoutType: EReportLayoutType;

	/**
	 * @Input {ReportLayoutType} - The copyleaks report reposive type.
	 */
	@Input() responsiveLayoutType: EResponsiveLayoutType | null = null;

	/**
	 * @Input {IClsReportEndpointConfigModel} - The copyleaks report data endpoints configuration model.
	 */
	@Input() reportEndpointConfig: IClsReportEndpointConfigModel;

	// Layout realated properties
	ReportLayoutType = EReportLayoutType;
	ResponsiveLayoutType = EResponsiveLayoutType;
	layoutChangesSub: any;
	queryParamsSub: any;

	// Template references related properties
	customActionsTemplateRef: TemplateRef<any>;
	customResultsTemplateRef: TemplateRef<any>;
	viewChangesSub: any;

	constructor(
		private _breakpointObserver: BreakpointObserver,
		private _reportNgTemplatesSvc: ReportNgTemplatesService,
		private _reportDataSvc: ReportDataService,
		private _activatedRoute: ActivatedRoute,
		private _reportViewSvc: ReportViewService,
		private _router: Router
	) {}

	ngOnInit(): void {
		if (this.responsiveLayoutType == null) this._initResponsiveLayoutType();
		this._initReportLayoutType();
		// this._initReportView();

		if (this.reportEndpointConfig) this._reportDataSvc.initReportData(this.reportEndpointConfig);
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
							return EResponsiveLayoutType.Desktop;
						}
						// Tablet view
						if (
							result.breakpoints[Breakpoints.Tablet] ||
							result.breakpoints[Breakpoints.TabletLandscape] ||
							result.breakpoints[Breakpoints.Medium]
						) {
							return EResponsiveLayoutType.Tablet;
						}
						// Mobile view
						else return EResponsiveLayoutType.Mobile;
					}
					return null;
				})
			)
			.subscribe((layout: EResponsiveLayoutType | null) => {
				this.responsiveLayoutType = layout;
			});
	}

	/**
	 * Starts a subscription for the report layout query params
	 */
	private _initReportLayoutType() {
		const params = this._activatedRoute.snapshot.queryParams;
		if (!params) return;

		const viewMode = params['viewMode'];
		const contentMode = params['contentMode'];
		const sourcePage = params['sourcePage'];
		const suspectPage = params['suspectPage'];
		const suspectId = params['suspectId'];

		this.reportLayoutType = viewMode ?? 'one-to-many';

		this._reportViewSvc.reportViewMode$.next({
			viewMode: viewMode ?? 'one-to-many',
			isHtmlView: !contentMode || contentMode == 'html',
			sourcePageIndex: Number(sourcePage) ?? 1,
			suspectId: suspectId,
			suspectPageIndex: Number(suspectPage) ?? 1,
		} as IReportViewEvent);

		this.viewChangesSub = this._reportViewSvc.reportViewMode$.subscribe(data => {
			if (!data) return;
			let updatedParams: IReportViewQueryParams = {
				viewMode: data.viewMode,
				contentMode: data.isHtmlView ? 'html' : 'text',
				sourcePage: String(data.sourcePageIndex),
			};
			// Add the suspect Id if available
			if (data.suspectId)
				updatedParams = {
					...updatedParams,
					suspectId: data.suspectId,
				};
			// Add the suspect pagination page index if available
			if (data.suspectPageIndex)
				updatedParams = {
					...updatedParams,
					suspectPage: String(data.suspectPageIndex),
				};
			// Navigate without page reload
			this._router.navigate([], {
				relativeTo: this._activatedRoute,
				queryParams: updatedParams,
				queryParamsHandling: 'merge', // remove to replace all query params by provided
			});
		});
	}

	/**
	 * Starts a subscription for the report layout query params
	 */
	private _initReportView() {}

	ngOnDestroy() {
		if (this.layoutChangesSub) this.layoutChangesSub.unsubscribe();
		if (this.queryParamsSub) this.queryParamsSub.unsubscribe();
		if (this.viewChangesSub) this.viewChangesSub.unsubscribe();
	}
}
