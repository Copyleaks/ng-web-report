import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, combineLatest } from 'rxjs';
import * as helpers from '../utils/report-match-helpers';
import { IScanSource } from '../models/report-data.models';
import { CopyleaksReportOptions } from '../models/report-options.models';
import { ReportDataService } from './report-data.service';
import { filter, takeUntil } from 'rxjs/operators';
import { SlicedMatch, Match, ResultDetailItem } from '../models/report-matches.models';
import { ReportViewService } from './report-view.service';
import { IReportViewEvent } from '../models/report-view.models';

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

	private _unsubscribe$: Subject<void> = new Subject();

	constructor(private _reportDataSvc: ReportDataService, private _reportViewSvc: ReportViewService) {
		this._initOneToManyMatchesHandler();
		this._initOneToOneMatchesHandler();
	}

	private _initOneToManyMatchesHandler() {
		combineLatest([
			this._reportDataSvc.crawledVersion$,
			this._reportDataSvc.scanResultsDetails$,
			this._reportViewSvc.reportViewMode$,
		])
			.pipe(
				takeUntil(this._unsubscribe$),
				filter(
					([scanSource, scanResults, viewMode]) =>
						scanSource != undefined &&
						scanResults != undefined &&
						viewMode != null &&
						viewMode.viewMode === 'one-to-many'
				)
			)
			.subscribe(([scanSource, scanResults, viewMode]) => {
				if (!scanSource || !scanResults || !viewMode) return;

				// process the mathces according to the report view
				if (viewMode.isHtmlView) {
					this._processOneToManyMatchesHtml(
						scanResults,
						// !MOCK data for scan report options
						{
							showRelated: true,
							showIdentical: true,
							showMinorChanges: true,
							showPageSources: true,
							showOnlyTopResults: true,
							setAsDefault: true,
						} as CopyleaksReportOptions,
						scanSource
					);
				} else {
					this._processOneToManyMatchesText(
						scanResults,
						// !MOCK data for scan report options
						{
							showRelated: true,
							showIdentical: true,
							showMinorChanges: true,
							showPageSources: true,
							showOnlyTopResults: true,
							setAsDefault: true,
						} as CopyleaksReportOptions,
						scanSource
					);
				}
			});
	}

	private _initOneToOneMatchesHandler() {
		combineLatest([
			this._reportDataSvc.crawledVersion$,
			this._reportViewSvc.selectedResult$,
			this._reportViewSvc.reportViewMode$,
		])
			.pipe(
				takeUntil(this._unsubscribe$),
				filter(
					([scanSource, scanResults, viewMode]) =>
						scanSource != undefined &&
						scanResults != undefined &&
						viewMode != null &&
						viewMode.viewMode === 'one-to-one'
				)
			)
			.subscribe(([scanSource, selectedResult, viewMode]) => {
				if (!scanSource || !selectedResult || !viewMode) return;

				this._processOneToOneMatches(
					selectedResult,
					// !MOCK data for scan report options
					{
						showRelated: true,
						showIdentical: true,
						showMinorChanges: true,
						showPageSources: true,
						showOnlyTopResults: true,
						setAsDefault: true,
					} as CopyleaksReportOptions,
					scanSource,
					viewMode
				);
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
		results: ResultDetailItem[],
		settings: CopyleaksReportOptions,
		source: IScanSource
	) {
		const html = helpers.processSourceHtml(results, settings, source);
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
		results: ResultDetailItem[],
		settings: CopyleaksReportOptions,
		source: IScanSource
	) {
		const text = helpers.processSourceText(results, settings, source);
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
		settings: CopyleaksReportOptions,
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
	 * dtor
	 */
	ngOnDestroy() {
		this._sourceTextMatches && this._sourceTextMatches.complete();
		this._sourceHtmlMatches && this._sourceHtmlMatches.complete();
		this._suspectTextMatches && this._suspectTextMatches.complete();
		this._suspectHtmlMatches && this._suspectHtmlMatches.complete();
		this._originalTextMatches && this._originalTextMatches.complete();
		this._originalHtmlMatches && this._originalHtmlMatches.complete();

		// Stop subscriptions
		this._unsubscribe$.next();
		this._unsubscribe$.complete();
	}
}