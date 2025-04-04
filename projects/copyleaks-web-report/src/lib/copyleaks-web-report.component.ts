import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges,
	TemplateRef,
	ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';
import { IResultItem } from './components/containers/report-results-item-container/components/models/report-result-item.models';
import { ALERTS } from './constants/report-alerts.constants';
import {
	EPlatformType,
	EReportLayoutType,
	EReportMode,
	EResponsiveLayoutType,
} from './enums/copyleaks-web-report.enums';
import { IClsReportEndpointConfigModel } from './models/report-config.models';
import { ICompleteResults, IScanSource } from './models/report-data.models';
import { ReportHttpRequestErrorModel } from './models/report-errors.models';
import { IReportViewEvent, IReportViewQueryParams } from './models/report-view.models';
import { ReportDataService } from './services/report-data.service';
import { ReportErrorsService } from './services/report-errors.service';
import { ReportMatchHighlightService } from './services/report-match-highlight.service';
import { ReportMatchesService } from './services/report-matches.service';
import { ReportNgTemplatesService } from './services/report-ng-templates.service';
import { ReportStatisticsService } from './services/report-statistics.service';
import { ReportViewService } from './services/report-view.service';
import { ReportRealtimeResultsService } from './services/report-realtime-results.service';
import { ECustomResultsReportView } from './components/core/cr-custom-results/models/cr-custom-results.enums';
import { Subject } from 'rxjs';
import { IResourceStartExplainableAIVideo } from './models/report-ai-results.models';
import { ReportAIResultsService } from './services/report-ai-results.service';

@Component({
	selector: 'copyleaks-web-report',
	templateUrl: './copyleaks-web-report.component.html',
	styleUrls: ['./copyleaks-web-report.component.scss'],
	providers: [
		ReportErrorsService,
		ReportViewService,
		ReportDataService,
		ReportNgTemplatesService,
		ReportMatchesService,
		ReportMatchHighlightService,
		ReportStatisticsService,
		ReportAIResultsService,
	],
})
export class CopyleaksWebReportComponent implements OnInit, OnDestroy {
	@ViewChild('customActionsTemplate', { static: true }) customActionsTemplate: TemplateRef<any>;
	@ViewChild('customEmptyResultsTemplate', { static: true }) customEmptyResultsTemplate: TemplateRef<any>;
	@ViewChild('customResultsTemplate', { static: true }) customResultsTemplate: TemplateRef<any>;
	@ViewChild('customBannerSectionTemplate', { static: true }) customBannerSectionTemplate: TemplateRef<any>;
	@ViewChild('customAISourceMatchUpgradeTemplate', { static: true })
	customAISourceMatchUpgradeTemplate: TemplateRef<any>;

	/**
	 * @Input {EReportMode} - The copyleaks report view type.
	 * @Default value: EReportMode.WebReport
	 * @Description: The type of the report view.
	 * @Example: EReportMode.WebReport
	 * @Example: EReportMode.AssessmentTool
	 */
	@Input() reportMode: EReportMode = EReportMode.WebReport;

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

	/**
	 * @Input {boolean} - Flag indicating whether to still show the disabled products tabs.
	 */
	@Input() showDisabledProducts: boolean = false;

	/**
	 * @Input {TemplateRef<IResultItem>} - Custom locked result template ref.
	 */
	@Input() lockedResultTemplateRef: TemplateRef<IResultItem>;

	/**
	 * @Input {string} - Custom company logo which will be shown in the tabs sections.
	 */
	@Input() companyLogo: string = null;

	/**
	 * @Input {boolean} - Flag indicating whether to show the Grammar tab and content in the report.
	 */
	@Input() hideWritingFeedback: boolean = false;

	/**
	 * @Input {EPlatformType} - The type of the platform that the report is running on.
	 */
	@Input() platformType: EPlatformType = EPlatformType.APP;

	/**
	 * @Input {boolean} - Flag indicating whether to show the locked result in the AI explain.
	 */
	@Input() lockedExplainAIResults: boolean = false;

	/**
	 * @Output {IResourceStartExplainableAIVideo} - Emits once AI Insight explination start video button clicked.
	 */
	@Output() onExplainableAIStartVideoButtonClicked = new EventEmitter<IResourceStartExplainableAIVideo>();

	/**
	 * @Output {ReportHttpRequestErrorModel} - Emits HTTP request data, when any request to update & fetch report data fails.
	 */
	@Output() onReportRequestError = new EventEmitter<ReportHttpRequestErrorModel>();

	/**
	 * @Output {ICompleteResults} - Emits complete request updates.
	 */
	@Output() onCompleteResultUpdate = new EventEmitter<ICompleteResults>();

	/**
	 * @Output {IScanSource} - Emits crawled version updates.
	 */
	@Output() onCrawledVersionUpdate = new EventEmitter<IScanSource>();

	// Layout realated properties
	ReportLayoutType = EReportLayoutType;
	ResponsiveLayoutType = EResponsiveLayoutType;
	EReportMode = EReportMode;
	docDirection: 'ltr' | 'rtl';

	// Subject for destroying all the subscriptions in the main library component
	private unsubscribe$ = new Subject();

	constructor(
		private _breakpointObserver: BreakpointObserver,
		private _reportNgTemplatesSvc: ReportNgTemplatesService,
		private _reportDataSvc: ReportDataService,
		private _reportRealtimeResultsSvc: ReportRealtimeResultsService,
		private _activatedRoute: ActivatedRoute,
		private _reportViewSvc: ReportViewService,
		private _reportErrorsSvc: ReportErrorsService,
		private _router: Router,
		private _reportAIResultsSvc: ReportAIResultsService,
		private _reportMatchesSvc: ReportMatchesService
	) {}

	ngOnInit(): void {
		// Handel responsive view changes
		if (this.responsiveLayoutType == null) this._initResponsiveLayoutType();

		// Handel report layout changes
		if (!this.reportLayoutType) this._initReportLayoutType();

		// Initialize the report data
		if (this.reportEndpointConfig) this._reportDataSvc.initReportData(this.reportEndpointConfig);

		// Listen to route params changes
		this._listenToRouteParamsChange();

		// Listen to document direction changes (RTL/LTR)
		this._listenToDocumentDirectionChange();

		// Handle report requests errors & emit it
		this._reportErrorsSvc.reportHttpRequestError$
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe(error => this.onReportRequestError.emit(error));

		// Handle start video explination clicked & emit it
		this._reportAIResultsSvc.resourcesStartExplainableVideo$.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
			if (!data?.startVideo) return;
			this.onExplainableAIStartVideoButtonClicked.emit(data);
		});

		this._reportDataSvc.scanResultsPreviews$
			.pipe(
				takeUntil(this.unsubscribe$),
				filter(
					scanResultsPreviews =>
						scanResultsPreviews != undefined &&
						scanResultsPreviews.filters != undefined &&
						scanResultsPreviews.filters.filteredResultIds != undefined
				)
			)
			.subscribe(scanResultsPreviews => {
				if (
					!this._reportDataSvc.isPlagiarismEnabled() &&
					!this._reportDataSvc.isWritingFeedbackEnabled() &&
					this._reportDataSvc.isAiDetectionEnabled() &&
					this.reportLayoutType != EReportLayoutType.OnlyAi &&
					!this.showDisabledProducts &&
					this._reportNgTemplatesSvc.reportTemplatesMode$.value != ECustomResultsReportView.Full &&
					this._reportNgTemplatesSvc.reportTemplatesMode$.value != ECustomResultsReportView.Partial
				) {
					this._reportViewSvc.reportViewMode$.next({
						...this._reportViewSvc.reportViewMode,
						viewMode: 'one-to-many',
						alertCode: ALERTS.SUSPECTED_AI_TEXT_DETECTED,
					});
					this._reportViewSvc.selectedAlert$.next(ALERTS.SUSPECTED_AI_TEXT_DETECTED);
				}

				if (this._reportDataSvc.scanResultsDetails) this.onCompleteResultUpdate.emit(scanResultsPreviews);
			});

		this._reportDataSvc.crawledVersion$.pipe(takeUntil(this.unsubscribe$)).subscribe(crawledVersion => {
			if (!crawledVersion) return;
			this.onCrawledVersionUpdate.emit(crawledVersion);
		});

		this._reportRealtimeResultsSvc.onNewResults$.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
			this._reportDataSvc.pushNewResults(data);
		});
	}

	ngAfterViewInit() {
		// Read provided custom components
		this._initCustomTemplatesRefs();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if ('reportEndpointConfig' in changes && !changes['reportEndpointConfig'].firstChange) {
			this._reportDataSvc.initReportData(this.reportEndpointConfig);
		}

		if ('showDisabledProducts' in changes) {
			if (!!this._reportViewSvc.reportViewMode)
				this._reportViewSvc.reportViewMode$.next({
					...this._reportViewSvc.reportViewMode,
					showDisabledProducts: this.showDisabledProducts,
				} as IReportViewEvent);
		}
	}

	/**
	 * Reads the report custom components templates references & saves them in the templates service.
	 */
	private _initCustomTemplatesRefs() {
		// Read the report custom actions template reference.
		if (this.customActionsTemplate)
			this._reportNgTemplatesSvc.setReportCustomActionsTemplateRef(this.customActionsTemplate);

		// Read the report custom empty results template reference.
		if (this.customEmptyResultsTemplate)
			this._reportNgTemplatesSvc.setReportCustomEmptyResultsTemplateRef(this.customEmptyResultsTemplate);

		// Read the report custom results template reference.
		if (this.customResultsTemplate)
			this._reportNgTemplatesSvc.setReportCustomResultsTemplateRef(this.customResultsTemplate);

		// Read the report custom results template reference.
		if (this.customBannerSectionTemplate)
			this._reportNgTemplatesSvc.setReportCustomBannerSectionTemplateRef(this.customBannerSectionTemplate);

		// Read the report custom AI source match upgrade component reference
		if (this.customAISourceMatchUpgradeTemplate)
			this._reportNgTemplatesSvc.setReportCustomAISourceMatchUpgradeTemplateRef(
				this.customAISourceMatchUpgradeTemplate
			);

		// Read the report results locked result item template reference.
		if (this.lockedResultTemplateRef)
			this._reportNgTemplatesSvc.setLockedResultItemTemplateRef(this.lockedResultTemplateRef);
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

		layoutChanges
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
				}),

				takeUntil(this.unsubscribe$)
			)
			.subscribe((layout: EResponsiveLayoutType | null) => {
				this.responsiveLayoutType = layout;
				if (layout)
					this._reportViewSvc.reportResponsiveMode$.next({
						mode: layout,
					});
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
		const alertCode = params['alertCode'];
		const selectedCustomTabId = params['selectedCustomTabId'];
		const selectedResultsCategory = params['selectedResultsCategory'];
		const showAIPhrases = params['showAIPhrases'];

		this.reportLayoutType = viewMode ?? 'one-to-many';
		if (viewMode === 'writing-feedback') this.reportLayoutType = EReportLayoutType.OneToMany;
		if (suspectId)
			// Add the suspect Id if available
			this.reportLayoutType = EReportLayoutType.OneToOne;

		this._reportViewSvc.reportViewMode$.next({
			viewMode: viewMode === 'writing-feedback' ? EReportLayoutType.WritingFeedback : this.reportLayoutType,
			isHtmlView:
				(!contentMode || contentMode == 'html') && (!alertCode || alertCode === ALERTS.SUSPECTED_AI_TEXT_DETECTED),
			sourcePageIndex: sourcePage ? Number(sourcePage) ?? 1 : 1,
			suspectId: suspectId,
			suspectPageIndex: suspectPage ? Number(suspectPage) ?? 1 : 1,
			alertCode: alertCode,
			showDisabledProducts: this.showDisabledProducts,
			platformType: this.platformType,
			selectedCustomTabId: selectedCustomTabId,
			selectedResultsCategory: selectedResultsCategory,
			showAIPhrases: showAIPhrases === 'true',
		} as IReportViewEvent);

		if (alertCode) this._reportViewSvc.selectedAlert$.next(alertCode);
		if (showAIPhrases === 'true' && !this._reportMatchesSvc.showAIPhrases)
			this._reportMatchesSvc.showAIPhrases$.next(true);

		this._reportViewSvc.reportViewMode$.pipe(distinctUntilChanged(), takeUntil(this.unsubscribe$)).subscribe(data => {
			if (!data) return;

			let updatedParams: IReportViewQueryParams = {
				viewMode: data.viewMode,
				contentMode: data.isHtmlView ? 'html' : 'text',
				sourcePage: String(data.sourcePageIndex) ?? '1',
				suspectPage: String(data.suspectPageIndex) ?? '1',
				suspectId: data.suspectId,
				alertCode: data.alertCode,
				selectedCustomTabId: data.selectedCustomTabId,
				selectedResultsCategory: data.selectedResultsCategory,
				showAIPhrases: data.showAIPhrases ? 'true' : 'false',
			};

			if (data.viewMode == 'one-to-many' || data.viewMode == 'writing-feedback')
				this.reportLayoutType = EReportLayoutType.OneToMany;
			else if (data.viewMode == 'one-to-one') this.reportLayoutType = EReportLayoutType.OneToOne;
			else this.reportLayoutType = EReportLayoutType.OnlyAi;

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
				queryParamsHandling: 'merge',
			});
		});
	}

	private _listenToRouteParamsChange() {
		this._activatedRoute.queryParams.pipe(distinctUntilChanged(), takeUntil(this.unsubscribe$)).subscribe(params => {
			const viewMode = params['viewMode'];
			const contentMode = params['contentMode'];
			const sourcePage = params['sourcePage'];
			const suspectPage = params['suspectPage'];
			const suspectId = params['suspectId'];
			const alertCode = params['alertCode'];
			const selectedCustomTabId = params['selectedCustomTabId'];
			const selectedResultsCategory = params['selectedResultsCategory'];
			const showAIPhrases = params['showAIPhrases'];

			this.reportLayoutType = viewMode ?? 'one-to-many';
			if (viewMode === 'writing-feedback') {
				this.reportLayoutType = EReportLayoutType.OneToMany;
			}
			if (suspectId) {
				this.reportLayoutType = EReportLayoutType.OneToOne;
			}

			// check if the reportViewMode$ value is the same as new value
			if (
				!(
					this._reportViewSvc.reportViewMode?.viewMode ==
						(viewMode === 'writing-feedback' ? EReportLayoutType.WritingFeedback : this.reportLayoutType) &&
					this._reportViewSvc.reportViewMode?.isHtmlView ==
						((!contentMode || contentMode == 'html') &&
							(!alertCode || alertCode === ALERTS.SUSPECTED_AI_TEXT_DETECTED)) &&
					this._reportViewSvc.reportViewMode?.sourcePageIndex == (sourcePage ? Number(sourcePage) ?? 1 : 1) &&
					this._reportViewSvc.reportViewMode?.suspectId == suspectId &&
					this._reportViewSvc.reportViewMode?.suspectPageIndex == (suspectPage ? Number(suspectPage) ?? 1 : 1) &&
					this._reportViewSvc.reportViewMode?.alertCode == alertCode &&
					this._reportViewSvc.reportViewMode?.showDisabledProducts == this.showDisabledProducts &&
					this._reportViewSvc.reportViewMode?.platformType == this.platformType &&
					this._reportViewSvc.reportViewMode?.selectedCustomTabId == selectedCustomTabId &&
					this._reportViewSvc.reportViewMode?.selectedResultsCategory == selectedResultsCategory &&
					this._reportViewSvc.reportViewMode?.showAIPhrases == (showAIPhrases === 'true' ? true : false)
				)
			)
				this._reportViewSvc.reportViewMode$.next({
					viewMode: viewMode === 'writing-feedback' ? EReportLayoutType.WritingFeedback : this.reportLayoutType,
					isHtmlView:
						(!contentMode || contentMode == 'html') && (!alertCode || alertCode === ALERTS.SUSPECTED_AI_TEXT_DETECTED),
					sourcePageIndex: sourcePage ? Number(sourcePage) ?? 1 : 1,
					suspectId: suspectId,
					suspectPageIndex: suspectPage ? Number(suspectPage) ?? 1 : 1,
					alertCode: alertCode,
					showDisabledProducts: this.showDisabledProducts,
					platformType: this.platformType,
					selectedCustomTabId: selectedCustomTabId,
					selectedResultsCategory: selectedResultsCategory,
					showAIPhrases: showAIPhrases === 'true',
				} as IReportViewEvent);
			if (alertCode && this._reportViewSvc.selectedAlert != alertCode)
				this._reportViewSvc.selectedAlert$.next(alertCode);
			else if (alertCode === null && this._reportViewSvc.selectedAlert != null)
				this._reportViewSvc.selectedAlert$.next(null);
			if (!selectedCustomTabId || selectedCustomTabId == 'null') {
				this._reportViewSvc.selectedCustomTabContent$.next(null);
				this._reportViewSvc.selectedCustomTabResultSectionContent$.next(null);
			}
			if (showAIPhrases === 'true') this._reportMatchesSvc.showAIPhrases$.next(showAIPhrases === 'true');
		});
	}

	private _listenToDocumentDirectionChange() {
		this._reportViewSvc.documentDirection$.pipe(takeUntil(this.unsubscribe$)).subscribe(dir => {
			this.docDirection = dir;
		});
	}
	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
