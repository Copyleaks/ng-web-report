import { Renderer2 } from '@angular/core';
import { ReportDataService } from '../../../services/report-data.service';
import { Match, MatchType, ResultDetailItem, SlicedMatch } from '../../../models/report-matches.models';
import { ReportMatchesService } from '../../../services/report-matches.service';
import { ReportViewService } from '../../../services/report-view.service';
import { ReportMatchHighlightService } from '../../../services/report-match-highlight.service';
import { ReportStatisticsService } from '../../../services/report-statistics.service';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { EExcludeReason, EResponsiveLayoutType, EResultPreviewType } from '../../../enums/copyleaks-web-report.enums';
import { ICompleteResults, IScanSource } from '../../../models/report-data.models';
import { PostMessageEvent } from '../../../models/report-iframe-events.models';
import { IReportViewEvent } from '../../../models/report-view.models';
import { untilDestroy } from '../../../utils/until-destroy';
import { ReportLayoutBaseComponent } from './report-layout-base.component';
import { IResultItem } from '../../containers/report-results-item-container/components/models/report-result-item.models';
import { Subject, combineLatest } from 'rxjs';
import { ReportNgTemplatesService } from '../../../services/report-ng-templates.service';
import { ReportRealtimeResultsService } from '../../../services/report-realtime-results.service';
import { ReportErrorsService } from '../../../services/report-errors.service';

export abstract class OneToOneReportLayoutBaseComponent extends ReportLayoutBaseComponent {
	hideRightSection = false;

	numberOfPagesSuspect: number;
	numberOfPagesSource: number;
	rerenderedSource: boolean = false;
	rerenderedSuspect: boolean = false;

	suspectCrawledVersion: IScanSource;
	sourceCrawledVersion: IScanSource;

	scanResultsPreviews: ICompleteResults | undefined;

	suspectIframeHtml: string;
	sourceIframeHtml: string;

	sourceTextMatches: SlicedMatch[][];
	suspectTextMatches: SlicedMatch[][];

	sourceHtmlMatches: Match[];
	suspectHtmlMatches: Match[];

	currentPageSuspect: number;
	currentPageSource: number;
	resultData: ResultDetailItem;
	resultItem: IResultItem | null = null;

	EResponsiveLayoutType = EResponsiveLayoutType;

	isLoadingSourceContent: boolean = false;
	isLoadingSuspectContent: boolean = false;
	isLoadingResultItem: boolean = false;

	isOthersFile: boolean;
	hasNonIdenticalMatchWords: boolean;
	hideMaskedContentDisclaimer: { flag: boolean } = {
		flag: false,
	};

	showOmittedWords: boolean;
	isPartitalScan: boolean;

	// Subject for destroying all the subscriptions in base component
	private unsubscribe$ = new Subject();

	get isLoadingScanContent(): boolean {
		return (!this.suspectIframeHtml && !this.suspectTextMatches) || (!this.sourceIframeHtml && !this.sourceTextMatches);
	}

	get numberOfWords(): number | undefined {
		return this.reportDataSvc.scanResultsPreviews?.scannedDocument?.totalWords;
	}

	constructor(
		reportDataSvc: ReportDataService,
		reportViewSvc: ReportViewService,
		matchSvc: ReportMatchesService,
		renderer: Renderer2,
		highlightSvc: ReportMatchHighlightService,
		statisticsSvc: ReportStatisticsService,
		templatesSvc: ReportNgTemplatesService,
		realTimeResultsSvc: ReportRealtimeResultsService,
		reportErrorsSvc: ReportErrorsService
	) {
		super(
			reportDataSvc,
			reportViewSvc,
			matchSvc,
			renderer,
			highlightSvc,
			statisticsSvc,
			templatesSvc,
			realTimeResultsSvc,
			reportErrorsSvc
		);
	}

	initOneToOneViewData(): void {
		this.unsubscribe$ = new Subject();

		this.reportDataSvc.crawledVersion$.pipe(untilDestroy(this), takeUntil(this.unsubscribe$)).subscribe(data => {
			if (data) {
				this.sourceCrawledVersion = data;
				this.numberOfPagesSource = data.text?.pages?.startPosition?.length ?? 1;
				if (
					(this.sourceCrawledVersion?.html?.exclude?.reasons?.filter(r => r === EExcludeReason.PartialScan).length >
						0 ||
						this.sourceCrawledVersion?.text?.exclude?.reasons?.filter(r => r === EExcludeReason.PartialScan).length >
							0) &&
					(!this.isPartitalScan || !this.showOmittedWords)
				) {
					this.matchSvc.showOmittedWords$.next(true);
					this.isPartitalScan = true;
					this.showOmittedWords = true;
				}
			}
		});

		this.matchSvc.suspectTextMatches$.pipe(untilDestroy(this), takeUntil(this.unsubscribe$)).subscribe(data => {
			if (data) {
				this.suspectTextMatches = data;
				this.hasNonIdenticalMatchWords =
					data
						.flat()
						?.filter(
							match =>
								match?.match?.type === MatchType.none ||
								match?.match?.type === MatchType.minorChanges ||
								match?.match?.type === MatchType.relatedMeaning
						)?.length > 0;
			}
		});

		this.matchSvc.sourceHtmlMatches$.pipe(untilDestroy(this), takeUntil(this.unsubscribe$)).subscribe(data => {
			if (data) {
				this.sourceHtmlMatches = data;
			}
		});

		this.matchSvc.sourceTextMatches$.pipe(untilDestroy(this), takeUntil(this.unsubscribe$)).subscribe(data => {
			if (data) this.sourceTextMatches = data;
		});

		combineLatest([
			this.reportDataSvc.scanResultsPreviews$.pipe(distinctUntilChanged()),
			this.reportViewSvc.selectedResult$.pipe(distinctUntilChanged()),
		])
			.pipe(untilDestroy(this), takeUntil(this.unsubscribe$))
			.subscribe(([previews, resultData]) => {
				this.scanResultsPreviews = previews;
				if (this.reportViewSvc.progress$.value != 100 && resultData) {
					this.numberOfPagesSuspect = resultData.result?.text?.pages?.startPosition?.length ?? 1;
					this.resultData = resultData;
					this.resultItem = this.reportDataSvc.newResults?.find(r => r.resultDetails?.id === resultData.id) ?? null;

					this.isOthersFile =
						this.resultItem?.resultPreview?.type === EResultPreviewType.Database &&
						!this.resultItem?.resultPreview?.scanId;

					this.matchSvc.suspectHtmlMatches$.pipe(untilDestroy(this), takeUntil(this.unsubscribe$)).subscribe(data => {
						if (!resultData?.result?.html?.value) return;
						if (data) {
							this.suspectHtmlMatches = data;
						}
					});
					return;
				}

				this.isLoadingResultItem = resultData === null || previews === undefined;

				if (resultData && previews) {
					this.numberOfPagesSuspect = resultData.result?.text?.pages?.startPosition?.length ?? 1;
					this.resultData = resultData;
					const allResults = [
						...(previews.results?.internet ?? []),
						...(previews.results?.database ?? []),
						...(previews.results?.batch ?? []),
						...(previews.results?.repositories ?? []),
					];
					this.resultItem = {
						resultPreview: allResults.find(r => r.id === resultData.id),
						resultDetails: resultData,
						iStatisticsResult: resultData?.result?.statistics,
						metadataSource: {
							words: this.reportDataSvc.crawledVersion?.metadata.words ?? 0,
							excluded: this.reportDataSvc.crawledVersion?.metadata.excluded ?? 0,
						},
					} as IResultItem;

					this.isOthersFile =
						this.resultItem?.resultPreview?.type === EResultPreviewType.Database &&
						!this.resultItem?.resultPreview?.scanId;
				}

				this.matchSvc.suspectHtmlMatches$.pipe(untilDestroy(this), takeUntil(this.unsubscribe$)).subscribe(data => {
					if (!resultData?.result?.html?.value) return;
					if (data) {
						this.suspectHtmlMatches = data;
					}
				});
			});

		this.reportViewSvc.reportViewMode$
			.pipe(
				filter(data => data.viewMode === 'one-to-one'),
				untilDestroy(this),
				takeUntil(this.unsubscribe$)
			)
			.subscribe(data => {
				if (!data) return;
				this.isHtmlView = data.isHtmlView;
				this.currentPageSource = data.sourcePageIndex;
				if (data.suspectPageIndex) this.currentPageSuspect = data.suspectPageIndex;
				this.reportDataSvc.scanResultsDetails$
					.pipe(untilDestroy(this), takeUntil(this.unsubscribe$))
					.subscribe(results => {
						if (!results) return;
						const foundSuspect = results?.find(result => result.id === data.suspectId);
						if (foundSuspect) this.reportViewSvc.selectedResult$.next(foundSuspect);
						else if (this.reportDataSvc.isResultsChunkMode) this._onSuspectNotLoaded(data);
						else {
							// if the result is not found, then change the view to one-to-many
							this.reportViewSvc.reportViewMode$.next({
								isHtmlView: data.isHtmlView,
								viewMode: 'one-to-many',
								sourcePageIndex: data.sourcePageIndex,
								suspectPageIndex: data.suspectPageIndex,
								suspectId: undefined,
								...this.reportViewSvc.reportViewMode,
							});
						}
					});
			});

		this.matchSvc.showOmittedWords$.pipe(untilDestroy(this)).subscribe(data => {
			this.showOmittedWords = data;
		});

		this._initMaskedContentFlags();
	}

	onSourceIFrameMessage(message: PostMessageEvent) {
		switch (message.type) {
			case 'match-select':
				this.highlightSvc.setSourceHtmlMatch(message.index !== -1 ? this.sourceHtmlMatches[message.index] : null);
				break;
			case 'upgrade-plan':
				console.log(message);
				break;
			case 'match-warn':
				console.warn('match not found');
				break;
			default:
				console.error('unknown event', message);
		}
	}

	onSuspectIFrameMessage(message: PostMessageEvent) {
		switch (message.type) {
			case 'match-select':
				this.highlightSvc.setSuspectHtmlMatch(message.index !== -1 ? this.suspectHtmlMatches[message.index] : null);
				break;
			case 'upgrade-plan':
				console.log(message);
				break;
			case 'match-warn':
				console.warn('match not found');
				break;
			default:
				console.error('unknown event', message);
		}
	}

	openDisclaimer() {
		this.hideMaskedContentDisclaimer = {
			flag: false,
		};
	}

	/**
	 * LMS-10324, chunk mode only (LMS batch export). The suspect of a one-to-one deep link or reload is loaded with the
	 * shown results, so a suspect that is not loaded yet is requested and awaited. Only when no load can bring it (it is
	 * not a result of this scan, or it could not be loaded) does the report go back to the one-to-many view, with the
	 * one-to-many values spread last. Spreading the current one-to-one view last re-emitted that same view, which
	 * subscribed again on every emission and recursed until `RangeError: Maximum call stack size exceeded`.
	 */
	private _onSuspectNotLoaded(data: IReportViewEvent) {
		const currentViewMode = this.reportViewSvc.reportViewMode;
		// The subscription of an earlier one-to-one view: the report shows something else now.
		if (currentViewMode?.viewMode !== 'one-to-one' || currentViewMode.suspectId !== data.suspectId) return;

		if (!this.reportDataSvc.loadingMoreResults) this.reportDataSvc.loadViewedResultsDetails();
		if (this.reportDataSvc.loadingMoreResults) return;

		this.reportViewSvc.reportViewMode$.next({
			...currentViewMode,
			viewMode: 'one-to-many',
			suspectId: undefined,
		});
	}

	private _initMaskedContentFlags() {
		try {
			const hideMaskedContentDisclaimer = JSON.parse(localStorage.getItem('hideMaskedContentDisclaimer')) as {
				flag: boolean;
			};
			if (hideMaskedContentDisclaimer) this.hideMaskedContentDisclaimer = hideMaskedContentDisclaimer;
		} catch (error) {
			console.error('Error getting disclaimer hide flag from local storage: ', error);
		}
	}

	protected onComponentDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
