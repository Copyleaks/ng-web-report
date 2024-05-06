import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ALERTS } from '../constants/report-alerts.constants';
import {
	ICompleteResults,
	IScanSource,
	IWritingFeedback,
	IWritingFeedbackCorrectionViewModel,
} from '../models/report-data.models';
import { Match, ResultDetailItem, SlicedMatch } from '../models/report-matches.models';
import { ICopyleaksReportOptions } from '../models/report-options.models';
import { IReportViewEvent } from '../models/report-view.models';
import * as helpers from '../utils/report-match-helpers';
import { untilDestroy } from '../utils/until-destroy';
import { ReportDataService } from './report-data.service';
import { ReportViewService } from './report-view.service';

/**
 * Service that calculates the matches highlight positions with respect to the view and content mode.
 * It exposes some observable streams that you can subscribe to and get the newest relevant calculations.
 */
@Injectable()
export class ReportMatchesService implements OnDestroy {
	private _sourceTextMatches = new BehaviorSubject<SlicedMatch[][] | null>(null);
	/** Emits matches that are relevant to source text one-to-one mode */
	public get sourceTextMatches$() {
		return this._sourceTextMatches.asObservable().pipe();
	}

	private _sourceHtmlMatches = new BehaviorSubject<Match[] | null>(null);
	/** Emits matches that are relevant to source html one-to-one mode */
	public get sourceHtmlMatches$() {
		return this._sourceHtmlMatches.asObservable().pipe();
	}

	private _suspectTextMatches = new BehaviorSubject<SlicedMatch[][] | null>(null);
	/** Emits matches that are relevant to suspect text one-to-one mode */
	public get suspectTextMatches$() {
		return this._suspectTextMatches.asObservable().pipe();
	}

	private _suspectHtmlMatches = new BehaviorSubject<Match[] | null>(null);
	/** Emits matches that are relevant to suspect html one-to-one mode */
	public get suspectHtmlMatches$() {
		return this._suspectHtmlMatches.asObservable().pipe();
	}

	private _originalTextMatches = new BehaviorSubject<SlicedMatch[][] | null>(null);
	/** Emits matches that are relevant to source text one-to-many mode */
	public get originalTextMatches$() {
		return this._originalTextMatches.asObservable().pipe();
	}

	private _originalHtmlMatches = new BehaviorSubject<Match[] | null>(null);
	/** Emits matches that are relevant to source html one-to-many mode */
	public get originalHtmlMatches$() {
		return this._originalHtmlMatches.asObservable().pipe();
	}

	private _correctionSelect$ = new BehaviorSubject<IWritingFeedbackCorrectionViewModel | null>(null);
	/** Emits matches that are relevant to source html one-to-many mode */
	public get correctionSelect$() {
		return this._correctionSelect$;
	}
	public get correctionSelect() {
		return this._correctionSelect$.value;
	}

	private _showOmittedWords$ = new BehaviorSubject<boolean>(false);
	/** Emits a falg that indicates if the omitted words should be shown or not */
	public get showOmittedWords$() {
		return this._showOmittedWords$;
	}
	public get showOmittedWords() {
		return this._showOmittedWords$.value;
	}

	constructor(private _reportDataSvc: ReportDataService, private _reportViewSvc: ReportViewService) {
		this._initOneToManyMatchesHandler();
		this._initOneToOneMatchesHandler();
		this._initAlertMatchesHandler();
		this._initWritingFeedbackCorrectionsHandler();
	}

	private _initOneToManyMatchesHandler() {
		combineLatest([
			this._reportDataSvc.crawledVersion$,
			this._reportDataSvc.scanResultsDetails$,
			this._reportViewSvc.reportViewMode$,
			this._reportViewSvc.selectedAlert$,
			this._reportDataSvc.filterOptions$,
			this._reportDataSvc.excludedResultsIds$,
			this.showOmittedWords$,
		])
			.pipe(
				untilDestroy(this),
				filter(
					([scanSource, , viewMode, selectedAlert]: [
						IScanSource,
						ResultDetailItem[],
						IReportViewEvent,
						string,
						ICopyleaksReportOptions,
						string[],
						boolean
					]) =>
						scanSource != undefined && viewMode != null && viewMode.viewMode === 'one-to-many' && selectedAlert === null
				)
			)
			.subscribe(
				([scanSource, scanResults, viewMode, , filterOptions, excludedResultsIds, showOmittedWords]: [
					IScanSource,
					ResultDetailItem[],
					IReportViewEvent,
					string,
					ICopyleaksReportOptions,
					string[],
					boolean
				]) => {
					let modifiedScanSource = scanSource ? JSON.parse(JSON.stringify(scanSource)) : null;
					if (!showOmittedWords && modifiedScanSource) {
						modifiedScanSource.html.exclude = null;
						modifiedScanSource.text.exclude = null;
					}

					if (
						(modifiedScanSource && this._reportViewSvc.progress$.value != 100) ||
						(modifiedScanSource && (!scanResults || scanResults.length === 0))
					) {
						// process the mathces according to the report view
						if (viewMode.isHtmlView) {
							this._processOneToManyMatchesHtml(scanResults ?? [], undefined, [], modifiedScanSource);
						} else {
							this._processOneToManyMatchesText(scanResults ?? [], undefined, [], modifiedScanSource);
						}
					}

					if (!modifiedScanSource || !viewMode || !filterOptions || !excludedResultsIds) return;

					if (!modifiedScanSource?.html?.value && viewMode.isHtmlView) {
						this._reportViewSvc.reportViewMode$.next({
							...this._reportViewSvc.reportViewMode,
							isHtmlView: false,
						});
						return;
					}
					// process the mathces according to the report view
					const isRealtimeInitView =
						this._reportDataSvc.realTimeView &&
						!this._reportDataSvc.isFilterOn &&
						(!this._reportDataSvc.excludedResultsIds || this._reportDataSvc.excludedResultsIds.length === 0);

					if (viewMode.isHtmlView) {
						this._processOneToManyMatchesHtml(
							scanResults,
							isRealtimeInitView ? undefined : filterOptions,
							excludedResultsIds,
							modifiedScanSource
						);
					} else {
						this._processOneToManyMatchesText(
							scanResults,
							isRealtimeInitView ? undefined : filterOptions,
							excludedResultsIds,
							modifiedScanSource
						);
					}
				}
			);
	}

	private _initOneToOneMatchesHandler() {
		combineLatest([
			this._reportDataSvc.crawledVersion$,
			this._reportViewSvc.selectedResult$,
			this._reportViewSvc.reportViewMode$,
			this._reportViewSvc.selectedAlert$,
			this._reportDataSvc.filterOptions$,
			this.showOmittedWords$,
		])
			.pipe(
				untilDestroy(this),
				filter(
					([scanSource, scanResults, viewMode, selectedAlert]) =>
						scanSource != undefined &&
						scanResults != undefined &&
						viewMode != null &&
						viewMode.viewMode === 'one-to-one' &&
						selectedAlert === null
				)
			)
			.subscribe(([scanSource, selectedResult, viewMode, , filterOptions, showOmittedWords]) => {
				let modifiedScanSource = scanSource ? JSON.parse(JSON.stringify(scanSource)) : null;
				if (!showOmittedWords && modifiedScanSource) {
					modifiedScanSource.html.exclude = null;
					modifiedScanSource.text.exclude = null;
				}

				if (modifiedScanSource && selectedResult && this._reportViewSvc.progress$.value != 100) {
					if (modifiedScanSource && this._reportViewSvc.progress$.value != 100) {
						this._processOneToOneMatches(
							selectedResult,
							{
								showIdentical: true,
								showRelated: true,
								showMinorChanges: true,
							},
							modifiedScanSource,
							viewMode
						);
					}
				}

				if (!modifiedScanSource || !selectedResult || !viewMode || !filterOptions) return;

				this._processOneToOneMatches(selectedResult, filterOptions, modifiedScanSource, viewMode);
			});
	}

	private _initAlertMatchesHandler() {
		combineLatest([
			this._reportDataSvc.crawledVersion$,
			this._reportViewSvc.selectedAlert$,
			this._reportDataSvc.scanResultsPreviews$,
			this._reportDataSvc.filterOptions$,
			this.showOmittedWords$,
		])
			.pipe(
				untilDestroy(this),
				filter(
					([scanSource, selectedAlert, ,]) =>
						scanSource != null && scanSource != undefined && selectedAlert != null && selectedAlert != undefined
				)
			)
			.subscribe(([scanSource, selectedAlert, completeResults, filterOptions, showOmittedWords]) => {
				let modifiedScanSource = scanSource ? JSON.parse(JSON.stringify(scanSource)) : null;
				if (!showOmittedWords && modifiedScanSource) {
					modifiedScanSource.html.exclude = null;
					modifiedScanSource.text.exclude = null;
				}
				if (
					(modifiedScanSource && this._reportViewSvc.progress$.value != 100) ||
					(modifiedScanSource && selectedAlert)
				) {
					this._processAlertMatches(modifiedScanSource, selectedAlert, filterOptions, completeResults);
				}

				if (!modifiedScanSource || !selectedAlert || !completeResults || !filterOptions) return;

				this._processAlertMatches(modifiedScanSource, selectedAlert, filterOptions, completeResults);
			});
	}

	private _initWritingFeedbackCorrectionsHandler() {
		combineLatest([
			this._reportDataSvc.crawledVersion$,
			this._reportViewSvc.selectedAlert$,
			this._reportDataSvc.writingFeedback$,
			this._reportViewSvc.reportViewMode$,
			this._reportDataSvc.filterOptions$,
			this._reportDataSvc.excludedCorrections$,
		])
			.pipe(
				untilDestroy(this),
				filter(
					([scanSource, selectedAlert, writingFeedback, viewMode]) =>
						scanSource != null &&
						scanSource != undefined &&
						!selectedAlert &&
						writingFeedback != null &&
						writingFeedback != undefined &&
						viewMode.viewMode === 'writing-feedback'
				)
			)
			.subscribe(([scanSource, , writingFeedback, viewMode, filterOptions, excludedCorrections]) => {
				if (!scanSource || !writingFeedback || !viewMode) return;

				const hasHtml =
					!!writingFeedback?.corrections?.html?.chars &&
					!!writingFeedback?.corrections?.html?.chars.types &&
					!!writingFeedback?.corrections?.html?.chars.groupIds &&
					!!writingFeedback?.corrections?.html?.chars.lengths &&
					!!writingFeedback?.corrections?.html?.chars.starts;

				if (viewMode.isHtmlView && !hasHtml) {
					this._reportViewSvc.reportViewMode$.next({
						...this._reportViewSvc.reportViewMode,
						isHtmlView: false,
					});
					return;
				}

				if (hasHtml)
					this._processHtmlWritingFeedbackCorrections(scanSource, writingFeedback, filterOptions, excludedCorrections);
				this._processTextWritingFeedbackCorrections(scanSource, writingFeedback, filterOptions, excludedCorrections);
			});
	}
	/**
	 * Process matches on the `one-to-many` view mode
	 * will calculate the matches when showing `text` or `html` for the first time
	 * @param results the results to calculate matches from
	 * @param settings the report settings
	 * @param source  the scan source
	 */
	private _processOneToManyMatchesHtml(
		results: ResultDetailItem[] | undefined,
		settings: ICopyleaksReportOptions | undefined,
		excludedResultsIds: string[],
		source: IScanSource
	) {
		if (settings) results = this._reportDataSvc.filterResults(settings, excludedResultsIds);
		const html = helpers.processSourceHtml(
			results ?? [],
			settings ?? {
				showIdentical: true,
				showRelated: true,
				showMinorChanges: true,
			},
			source
		);
		if (html) {
			this._originalHtmlMatches.next(html);
		}
	}

	/**
	 * Process matches on the `one-to-many` view mode
	 * will calculate the matches when showing `text` or `html` for the first time
	 * @param results the results to calculate matches from
	 * @param settings the report settings
	 * @param source  the scan source
	 */
	private _processOneToManyMatchesText(
		results: ResultDetailItem[] | undefined,
		settings: ICopyleaksReportOptions | undefined,
		excludedResultsIds: string[],
		source: IScanSource
	) {
		if (settings) results = this._reportDataSvc.filterResults(settings, excludedResultsIds);
		const text = helpers.processSourceText(
			results ?? [],
			settings ?? {
				showIdentical: true,
				showRelated: true,
				showMinorChanges: true,
			},
			source
		);
		if (text) {
			this._originalTextMatches.next(text);
		}
	}

	/**
	 * Process matches on the `one-to-one` view mode
	 * will calculate the matches when showing `text` or `html` for the first time
	 * @param item the result to calculate matches from
	 * @param settings the report settings
	 * @param source  the scan source
	 */
	private _processOneToOneMatches(
		item: ResultDetailItem,
		settings: ICopyleaksReportOptions,
		source: IScanSource,
		viewMode: IReportViewEvent
	) {
		// Case where source has html but suspect doesnt
		if (source.html && source.html.value && !(item.result?.html && item.result.html.value)) {
			// Create the report left side (the source document) text matches
			this._sourceTextMatches.next(helpers.processSourceText(item, settings, source));

			// Create the report left side (the source document) html matches
			this._sourceHtmlMatches.next(helpers.processSourceHtml(item, settings, source));

			// Create the report right side (the result/suspect document) text matches
			this._suspectTextMatches.next(helpers.processSuspectText(item, settings, !viewMode.isHtmlView));
		}
		// Case where suspect has html but source doesnt
		else if (!(source.html && source.html.value) && item.result?.html && item.result.html.value) {
			// Create the report left side (the source document) text matches
			this._sourceTextMatches.next(helpers.processSourceText(item, settings, source, !viewMode.isHtmlView));

			// Create the report right side (the result/suspect document) text matches
			this._suspectTextMatches.next(helpers.processSuspectText(item, settings));

			// Create the report right side (the result/suspect document) html matches
			this._suspectHtmlMatches.next(helpers.processSuspectHtml(item, settings));
		}
		// Case where both source and suspect have html & text views
		else {
			// Create the report left side (the source document) text and html matches
			this._sourceTextMatches.next(helpers.processSourceText(item, settings, source));
			this._sourceHtmlMatches.next(helpers.processSourceHtml(item, settings, source));

			// Create the report right side (the result/suspect document) text and html matches
			this._suspectTextMatches.next(helpers.processSuspectText(item, settings));
			this._suspectHtmlMatches.next(helpers.processSuspectHtml(item, settings));
		}
	}

	/**
	 * Process matches on the `suspected-character-replacement` view mode
	 * will calculate the matches when showing `text` or `html` for the first time
	 * @param settings the report settings
	 * @param source  the scan source
	 */
	private _processAlertMatches(
		source: IScanSource,
		selectedAlertCode: string | null,
		settings?: ICopyleaksReportOptions,
		completeResults?: ICompleteResults
	) {
		let text: SlicedMatch[][];

		// check if the selected alert code is valid
		const selectedAlert = completeResults?.notifications?.alerts.find(alert => alert.code === selectedAlertCode);
		if (selectedAlert) {
			switch (selectedAlertCode) {
				case ALERTS.SUSPECTED_AI_TEXT_DETECTED:
					text = helpers.processAICheatingMatches(source, selectedAlert);
					break;
				case ALERTS.SUSPECTED_CHARACTER_REPLACEMENT_CODE:
					text = helpers.processSuspectedCharacterMatches(source, selectedAlert);
					break;
				default:
					text = [];
					break;
			}
		}
		// otherwise, update the text view with zero results
		else
			text = helpers.processSourceText(
				[],
				settings ?? {
					showIdentical: true,
					showRelated: true,
					showMinorChanges: true,
				},
				source
			);
		if (text) this._originalTextMatches.next(text);

		// update the html view with zero results
		const html = helpers.processSourceHtml(
			[],
			settings ?? {
				showIdentical: true,
				showRelated: true,
				showMinorChanges: true,
			},
			source
		);
		if (html) this._originalHtmlMatches.next(html);
	}

	/**
	 * Process matches on the `suspected-character-replacement` view mode
	 * will calculate the matches when showing `text` or `html` for the first time
	 * @param settings the report settings
	 * @param source  the scan source
	 */
	private _processHtmlWritingFeedbackCorrections(
		source: IScanSource,
		writingFeedback: IWritingFeedback,
		filterOptions: ICopyleaksReportOptions,
		excludedCorrections: IWritingFeedbackCorrectionViewModel[]
	) {
		const filteredCorrections = this._reportDataSvc.filterCorrections(
			JSON.parse(JSON.stringify(writingFeedback.corrections)),
			filterOptions,
			excludedCorrections
		);

		const html = helpers.processCorrectionsHtml(filteredCorrections, 'html', source);
		if (html) this._originalHtmlMatches.next(html);
	}

	/**
	 * Process matches on the `suspected-character-replacement` view mode
	 * will calculate the matches when showing `text` or `html` for the first time
	 * @param settings the report settings
	 * @param source  the scan source
	 */
	private _processTextWritingFeedbackCorrections(
		source: IScanSource,
		writingFeedback: IWritingFeedback,
		filterOptions: ICopyleaksReportOptions,
		excludedCorrections: IWritingFeedbackCorrectionViewModel[]
	) {
		const filteredCorrections = this._reportDataSvc.filterCorrections(
			JSON.parse(JSON.stringify(writingFeedback.corrections)),
			filterOptions,
			excludedCorrections
		);

		const text = helpers.processCorrectionsText(filteredCorrections, 'text', source);
		if (text) this._originalTextMatches.next(text);
	}

	/**
	 * dtor
	 */
	ngOnDestroy() {
		this._sourceTextMatches && this._sourceTextMatches.complete();
		this._sourceHtmlMatches && this._sourceHtmlMatches.complete();
		this._suspectTextMatches && this._suspectTextMatches.complete();
		this._suspectHtmlMatches && this._suspectHtmlMatches.complete();
		this._originalTextMatches && this._originalTextMatches.complete();
		this._originalHtmlMatches && this._originalHtmlMatches.complete();
	}
}
