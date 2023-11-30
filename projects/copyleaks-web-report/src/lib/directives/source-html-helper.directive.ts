import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { IComparisonCollection } from '../models/report-data.models';
import { MatchJumpEvent, MatchSelectEvent } from '../models/report-iframe-events.models';
import { MatchType } from '../models/report-matches.models';
import { ReportMatchHighlightService } from '../services/report-match-highlight.service';
import { ReportMatchesService } from '../services/report-matches.service';
import { ReportViewService } from '../services/report-view.service';
import { findRespectiveStart } from '../utils/report-match-helpers';
import { untilDestroy } from '../utils/until-destroy';

@Directive({
	selector: '[crSourceHtmlHelper]',
})
export class SourceHtmlHelperComponent implements OnInit, OnDestroy {
	constructor(
		private _reportViewSvc: ReportViewService,
		private _highlightSvc: ReportMatchHighlightService,
		private _element: ElementRef<HTMLIFrameElement>,
		private _matchesSvc: ReportMatchesService
	) {}

	protected get frame() {
		return this._element.nativeElement.contentWindow;
	}

	/**
	 * Life-cycle method
	 * subscribe to:
	 * - source and suspect html matches
	 * - report metadata source and suspect objects
	 * - viewmode changes
	 * - jump events
	 */
	ngOnInit() {
		const { suspectHtml$, jump$, textMatchClick$ } = this._highlightSvc;
		const { sourceHtmlMatches$ } = this._matchesSvc;
		const { reportViewMode$, selectedResult$ } = this._reportViewSvc;

		jump$
			.pipe(
				withLatestFrom(reportViewMode$),
				filter(([, viewData]) => viewData.viewMode === 'one-to-one' && viewData.isHtmlView),
				untilDestroy(this)
			)
			.subscribe(([forward]) => {
				this.messageFrame({ type: 'match-jump', forward } as MatchJumpEvent);
			});

		textMatchClick$
			.pipe(
				filter(ev => ev.origin === 'suspect' && ev.broadcast),
				map(ev => ev.elem),
				withLatestFrom(selectedResult$, sourceHtmlMatches$, reportViewMode$),
				filter(([, , matches, viewData]) => viewData.isHtmlView && !!matches),
				untilDestroy(this)
			)
			.subscribe(([elem, suspect, matches]) => {
				if (elem && suspect?.result && matches) {
					const comparison = suspect.result.html.comparison[MatchType[elem.match.type] as keyof IComparisonCollection];
					const [start] = findRespectiveStart(elem.match.start, comparison, false);
					const found = matches.findIndex(m => m.start === start);
					this.markSingleMatchInFrame(found);
				} else {
					this.markSingleMatchInFrame(-1);
				}
			});

		suspectHtml$
			.pipe(
				withLatestFrom(selectedResult$, sourceHtmlMatches$, reportViewMode$),
				filter(([, , matches, viewData]) => viewData.isHtmlView && !!matches),
				untilDestroy(this)
			)
			.subscribe(([match, suspect, matches]) => {
				if (match && suspect && suspect.result && matches) {
					const comparison = suspect.result.html.comparison[MatchType[match.type] as keyof IComparisonCollection];
					const [start] = findRespectiveStart(match.start, comparison, false);
					const found = matches.findIndex(m => m.start === start);
					this.markSingleMatchInFrame(found);
				} else {
					this.markSingleMatchInFrame(-1);
				}
			});
	}

	/**
	 * Send a message to the iframe using PostMessage API
	 * @param data the data to post
	 */
	protected messageFrame(data: any) {
		this.frame && this.frame.postMessage(data, '*');
	}

	/**
	 * highlight a single match in the iframe
	 * @param index the index of the match to mark
	 */
	protected markSingleMatchInFrame(index: number) {
		this.messageFrame({ type: 'match-select', index } as MatchSelectEvent);
	}

	ngOnDestroy() {}
}
