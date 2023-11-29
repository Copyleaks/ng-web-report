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
import { EReportLayoutType, EResponsiveLayoutType, EResultPreviewType } from './enums/copyleaks-web-report.enums';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { filter, map } from 'rxjs/operators';
import { ReportNgTemplatesService } from './services/report-ng-templates.service';
import { ReportDataService } from './services/report-data.service';
import { ReportMatchesService } from './services/report-matches.service';
import { ReportViewService } from './services/report-view.service';
import { IClsReportEndpointConfigModel } from './models/report-config.models';
import { ReportMatchHighlightService } from './services/report-match-highlight.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IReportViewEvent, IReportViewQueryParams } from './models/report-view.models';
import { untilDestroy } from './utils/until-destroy';
import { ReportStatisticsService } from './services/report-statistics.service';
import { ReportHttpRequestErrorModel } from './models/report-errors.models';
import { ReportErrorsService } from './services/report-errors.service';
import { ICompleteResults } from './models/report-data.models';
import { ALERTS } from './constants/report-alerts.constants';
import { FilterResultDailogService } from './dialogs/filter-result-dailog/services/filter-result-dailog.service';
import { ReportRealtimeResultsService } from '../public-api';

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
		ReportStatisticsService,
		FilterResultDailogService,
		ReportRealtimeResultsService,
	],
})
export class CopyleaksWebReportComponent implements OnInit, OnDestroy {
	@ViewChild('customActionsTemplate', { static: true }) customActionsTemplate: TemplateRef<any>;
	@ViewChild('customEmptyResultsTemplate', { static: true }) customEmptyResultsTemplate: TemplateRef<any>;
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

	/**
	 * @Input {boolean} - Flag indicating whether to still show the disabled products tabs.
	 */
	@Input() showDisabledProducts: boolean = false;

	/**
	 * @Output {ReportHttpRequestErrorModel} - Emits HTTP request data, when any request to update & fetch report data fails.
	 */
	@Output() onReportRequestError = new EventEmitter<ReportHttpRequestErrorModel>();

	/**
	 * @Output {ReportHttpRequestErrorModel} - Emits complete request updates.
	 */
	@Output() onCompleteResultUpdate = new EventEmitter<ICompleteResults>();

	// Layout realated properties
	ReportLayoutType = EReportLayoutType;
	ResponsiveLayoutType = EResponsiveLayoutType;

	constructor(
		private _breakpointObserver: BreakpointObserver,
		private _reportNgTemplatesSvc: ReportNgTemplatesService,
		private _reportDataSvc: ReportDataService,
		private _activatedRoute: ActivatedRoute,
		private _reportViewSvc: ReportViewService,
		private _reportErrorsSvc: ReportErrorsService,
		private _router: Router
	) // private _reportRealtimeSvc: ReportRealtimeResultsService
	{}

	ngOnInit(): void {
		// Handel responsive view changes
		if (this.responsiveLayoutType == null) this._initResponsiveLayoutType();

		// Handel report layout changes
		if (!this.reportLayoutType) this._initReportLayoutType();

		// Initialize the report data
		if (this.reportEndpointConfig) this._reportDataSvc.initReportData(this.reportEndpointConfig);

		// this._reportRealtimeSvc.pushNewResults([
		// 	{
		// 		repositoryId: '',
		// 		url: 'https://blog.stackademic.com/read-text-aloud-in-simple-javascript-9528a8457904?gi=6b81cd0f325a',
		// 		id: '3b0edab479',
		// 		type: EResultPreviewType.Internet,
		// 		title: 'Read Text Aloud in Simple JavaScript | Stackademic',
		// 		introduction:
		// 			'Open in appSign up Sign In Write Sign up Sign In Read text aloud in simple JavaScript Anirudh Muni...',
		// 		matchedWords: 32,
		// 		metadata: {
		// 			finalUrl: undefined,
		// 			canonicalUrl: undefined,
		// 			author: 'Anirudh Munipalli',
		// 			organization: 'Stackademic',
		// 			filename: 'read-text-aloud-in-simple-javascript-9528a8457904',
		// 			publishDate: '2023-08-08T10:28:46Z',
		// 			creationDate: '2023-08-08T10:28:46Z',
		// 			lastModificationDate: '2023-08-10T12:06:52Z',
		// 			submissionDate: undefined,
		// 			submittedBy: undefined,

		// 			customMetadata: undefined,
		// 		},
		// 		tags: [],
		// 	},
		// 	{
		// 		repositoryId: '',
		// 		url: 'https://medium.com/@dschoenenberger/list/b37a02e2ee0c',
		// 		id: '5738a169ae',
		// 		type: EResultPreviewType.Internet,
		// 		title: 'List: angular | Curated by Dominique Schoenenberger | Medium',
		// 		introduction: 'Open in appSign up Sign In Write Sign up Sign In Follow Nov 12 ·10 stories angular Sha...',
		// 		matchedWords: 59,
		// 		metadata: {
		// 			finalUrl: undefined,
		// 			canonicalUrl: undefined,
		// 			author: 'Dominique Schoenenberger',
		// 			organization: 'Medium',
		// 			filename: 'b37a02e2ee0c',
		// 			publishDate: undefined,
		// 			creationDate: '2023-06-09T14:49:44Z',
		// 			lastModificationDate: '2023-11-12T05:53:07Z',
		// 			submissionDate: undefined,
		// 			submittedBy: undefined,

		// 			customMetadata: undefined,
		// 		},
		// 		tags: [],
		// 	},
		// 	{
		// 		repositoryId: '',

		// 		url: 'https://blog.stackademic.com/kotlin-code-smells-010-undefined-9162b60b252c',
		// 		id: '5aebdddb2e',
		// 		type: EResultPreviewType.Internet,
		// 		title: 'Kotlin Code Smells 10— undefined | Stackademic',
		// 		introduction:
		// 			'Open in appSign up Sign In Write Sign up Sign In Kotlin Code Smells 10— undefined Yonatan Karp-Rudin ...',
		// 		matchedWords: 32,

		// 		metadata: {
		// 			finalUrl: undefined,
		// 			canonicalUrl: undefined,
		// 			author: 'Yonatan Karp-Rudin',
		// 			organization: 'Stackademic',
		// 			filename: 'kotlin-code-smells-010-undefined-9162b60b252c',
		// 			publishDate: '2022-12-16T05:45:04Z',
		// 			creationDate: '2022-12-16T05:45:04Z',
		// 			lastModificationDate: '2023-08-05T20:07:31Z',
		// 			submissionDate: undefined,
		// 			submittedBy: undefined,

		// 			customMetadata: undefined,
		// 		},
		// 		tags: [],
		// 	},
		// ]);

		// Handel report requests errors & emit it
		this._reportErrorsSvc.reportHttpRequestError$
			.pipe(untilDestroy(this))
			.subscribe(error => this.onReportRequestError.emit(error));

		this._reportDataSvc.scanResultsPreviews$
			.pipe(
				untilDestroy(this),
				filter(scanResultsPreviews => scanResultsPreviews != undefined && scanResultsPreviews.filters != undefined)
			)
			.subscribe(scanResultsPreviews => {
				if (
					!this._reportDataSvc.isPlagiarismEnabled() &&
					this.reportLayoutType != EReportLayoutType.OnlyAi &&
					!this.showDisabledProducts
				) {
					this._reportViewSvc.reportViewMode$.next({
						...this._reportViewSvc.reportViewMode,
						viewMode: 'only-ai',
						alertCode: ALERTS.SUSPECTED_AI_TEXT_DETECTED,
					});
					this._reportViewSvc.selectedAlert$.next(ALERTS.SUSPECTED_AI_TEXT_DETECTED);
				}
				this.onCompleteResultUpdate.emit(scanResultsPreviews);
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
				untilDestroy(this)
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

		this.reportLayoutType = viewMode ?? 'one-to-many';

		// Add the suspect Id if available
		if (suspectId) this.reportLayoutType = EReportLayoutType.OneToOne;
		else this.reportLayoutType = EReportLayoutType.OneToMany;

		this._reportViewSvc.reportViewMode$.next({
			viewMode: this.reportLayoutType === EReportLayoutType.OneToOne ? 'one-to-one' : 'one-to-many',
			isHtmlView: (!contentMode || contentMode == 'html') && !alertCode,
			sourcePageIndex: sourcePage ? Number(sourcePage) ?? 1 : 1,
			suspectId: suspectId,
			suspectPageIndex: suspectPage ? Number(suspectPage) ?? 1 : 1,
			alertCode: alertCode,
			showDisabledProducts: this.showDisabledProducts,
		} as IReportViewEvent);

		if (alertCode) this._reportViewSvc.selectedAlert$.next(alertCode);

		this._reportViewSvc.reportViewMode$.pipe(untilDestroy(this)).subscribe(data => {
			if (!data) return;
			let updatedParams: IReportViewQueryParams = {
				viewMode: data.viewMode,
				contentMode: data.isHtmlView ? 'html' : 'text',
				sourcePage: String(data.sourcePageIndex) ?? '1',
				suspectPage: String(data.suspectPageIndex) ?? '1',
				suspectId: data.suspectId,
				alertCode: data.alertCode,
			};

			if (data.viewMode == 'one-to-many') this.reportLayoutType = EReportLayoutType.OneToMany;
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
				queryParamsHandling: 'merge', // remove to replace all query params by provided
			});
		});
	}

	ngOnDestroy() {}
}
