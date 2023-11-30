import { Renderer2 } from '@angular/core';
import { ReportDataService } from '../../../services/report-data.service';
import iframeJsScript from '../../../utils/one-to-one-iframe-logic';
import { Match, ResultDetailItem, SlicedMatch } from '../../../models/report-matches.models';
import { ReportMatchesService } from '../../../services/report-matches.service';
import { ReportViewService } from '../../../services/report-view.service';
import { ReportMatchHighlightService } from '../../../services/report-match-highlight.service';
import { ReportStatisticsService } from '../../../services/report-statistics.service';
import { filter } from 'rxjs/operators';
import { EResponsiveLayoutType } from '../../../enums/copyleaks-web-report.enums';
import { IScanSource } from '../../../models/report-data.models';
import { PostMessageEvent } from '../../../models/report-iframe-events.models';
import { untilDestroy } from '../../../utils/until-destroy';
import { ReportLayoutBaseComponent } from './report-layout-base.component';
import { IResultItem } from '../../containers/report-results-item-container/components/models/report-result-item.models';
import { combineLatest } from 'rxjs';
import { ReportNgTemplatesService } from '../../../services/report-ng-templates.service';
import { ReportRealtimeResultsService } from '../../../services/report-realtime-results.service';

export abstract class OneToOneReportLayoutBaseComponent extends ReportLayoutBaseComponent {
	hideRightSection = false;

	numberOfPagesSuspect: number;
	numberOfPagesSource: number;
	rerenderedSource: boolean = false;
	rerenderedSuspect: boolean = false;

	suspectCrawledVersion: IScanSource;
	sourceCrawledVersion: IScanSource;

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

	get isLoadingScanContent(): boolean {
		return (!this.suspectIframeHtml && !this.suspectTextMatches) || (!this.sourceIframeHtml && !this.sourceTextMatches);
	}

	get numberOfWords(): number | undefined {
		return this.reportDataSvc.scanResultsPreviews?.scannedDocument?.totalWords;
	}

	override get rerendered(): boolean {
		return this.rerenderedSource && this.rerenderedSuspect;
	}

	constructor(
		reportDataSvc: ReportDataService,
		reportViewSvc: ReportViewService,
		matchSvc: ReportMatchesService,
		renderer: Renderer2,
		highlightSvc: ReportMatchHighlightService,
		statisticsSvc: ReportStatisticsService,
		templatesSvc: ReportNgTemplatesService,
		realTimeResultsSvc: ReportRealtimeResultsService
	) {
		super(
			reportDataSvc,
			reportViewSvc,
			matchSvc,
			renderer,
			highlightSvc,
			statisticsSvc,
			templatesSvc,
			realTimeResultsSvc
		);
		this.iframeJsScript = iframeJsScript;
	}

	initOneToOneViewData(): void {
		this.reportDataSvc.crawledVersion$.pipe(untilDestroy(this)).subscribe(data => {
			if (data) {
				this.sourceCrawledVersion = data;
				this.numberOfPagesSource = data.text?.pages?.startPosition?.length ?? 1;
			}
		});

		this.matchSvc.suspectTextMatches$.pipe(untilDestroy(this)).subscribe(data => {
			if (data) this.suspectTextMatches = data;
		});

		this.matchSvc.sourceHtmlMatches$.pipe(untilDestroy(this)).subscribe(data => {
			const rerenderedMatches = this._getRenderedMatches(data, this.sourceCrawledVersion?.html?.value);
			if (rerenderedMatches && data) {
				this.sourceIframeHtml = rerenderedMatches;
				this.rerenderedSource = true;
				this.sourceHtmlMatches = data;
			}
		});

		this.matchSvc.sourceTextMatches$.pipe(untilDestroy(this)).subscribe(data => {
			if (data) this.sourceTextMatches = data;
		});

		combineLatest([this.reportDataSvc.scanResultsPreviews$, this.reportViewSvc.selectedResult$])
			.pipe(untilDestroy(this))
			.subscribe(([previews, resultData]) => {
				if (this.reportViewSvc.progress$.value != 100 && resultData) {
					this.numberOfPagesSuspect = resultData.result?.text?.pages?.startPosition?.length ?? 1;
					this.resultData = resultData;
					this.resultItem =
						this.realTimeResultsSvc.newResults?.find(r => r.resultDetails?.id === resultData.id) ?? null;

					this.matchSvc.suspectHtmlMatches$.pipe(untilDestroy(this)).subscribe(data => {
						if (!resultData?.result?.html.value) return;
						const rerenderedMatches = this._getRenderedMatches(data, resultData?.result?.html?.value);
						if (rerenderedMatches && data) {
							this.suspectIframeHtml = rerenderedMatches;
							this.rerenderedSuspect = true;
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
				}

				this.matchSvc.suspectHtmlMatches$.pipe(untilDestroy(this)).subscribe(data => {
					if (!resultData?.result?.html.value) return;
					const rerenderedMatches = this._getRenderedMatches(data, resultData?.result?.html?.value);
					if (rerenderedMatches && data) {
						this.suspectIframeHtml = rerenderedMatches;
						this.rerenderedSuspect = true;
						this.suspectHtmlMatches = data;
					}
				});
			});

		this.reportViewSvc.reportViewMode$
			.pipe(
				filter(data => data.viewMode === 'one-to-one'),
				untilDestroy(this)
			)
			.subscribe(data => {
				if (!data) return;
				this.isHtmlView = data.isHtmlView;
				this.currentPageSource = data.sourcePageIndex;
				if (data.suspectPageIndex) this.currentPageSuspect = data.suspectPageIndex;
				this.reportDataSvc.scanResultsDetails$.pipe(untilDestroy(this)).subscribe(results => {
					if (!results) return;
					const foundSuspect = results?.find(result => result.id === data.suspectId);
					if (foundSuspect) this.reportViewSvc.selectedResult$.next(foundSuspect);
					else {
						// if the result is not found, then change the view to one-to-many
						this.reportViewSvc.reportViewMode$.next({
							isHtmlView: data.isHtmlView,
							viewMode: 'one-to-many',
							sourcePageIndex: data.sourcePageIndex,
							suspectPageIndex: data.suspectPageIndex,
							suspectId: undefined,
						});
					}
				});
			});
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
}
