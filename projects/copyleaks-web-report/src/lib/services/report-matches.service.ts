import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, combineLatest } from 'rxjs';
import * as helpers from '../utils/report-match-helpers';
import { IScanSource } from '../models/report-data.models';
import { CopyleaksReportOptions } from '../models/report-options.models';
import { ReportDataService } from './report-data.service';
import { takeUntil } from 'rxjs/operators';
import { SlicedMatch, Match, ResultDetailItem } from '../models/report-matches.models';
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

	private _unsubscribe$: Subject<void> = new Subject();

	constructor(private _reportDataSvc: ReportDataService, private _reportViewSvc: ReportViewService) {
		this._initOneToManyMatchesHandler();
	}

	private _initOneToManyMatchesHandler() {
		combineLatest([
			this._reportDataSvc.crawledVersion$,
			this._reportDataSvc.scanResultsDetails$,
			this._reportViewSvc.reportViewMode$,
		])
			.pipe(takeUntil(this._unsubscribe$))
			.subscribe(([scanSource, scanResults, viewMode]) => {
				if (scanSource && scanResults && viewMode) {
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
				}
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
