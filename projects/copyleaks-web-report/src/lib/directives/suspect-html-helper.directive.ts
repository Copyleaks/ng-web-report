import { Directive, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { filter, map, takeUntil, withLatestFrom } from 'rxjs/operators';
import { MatchType } from '../models/report-matches.models';
import { ReportMatchHighlightService } from '../services/report-match-highlight.service';
import { ReportMatchesService } from '../services/report-matches.service';
import { ReportViewService } from '../services/report-view.service';
import { findRespectiveStart } from '../utils/report-match-helpers';
import { MatchSelectEvent } from '../models/report-iframe-events.models';
import { IComparisonCollection } from '../models/report-data.models';
import { Subject } from 'rxjs';
import { untilDestroy } from '../utils/untilDestroy';

@Directive({
	selector: '[crSuspectHtmlHelper]',
})
export class SuspectHtmlHelperComponent implements OnInit, OnDestroy {
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
	 * - suspect changes
	 * - view mode changes
	 * - source and suspect html matches
	 */
	ngOnInit() {
		const { sourceHtml$, textMatchClick$ } = this._highlightSvc;
		const { suspectHtmlMatches$ } = this._matchesSvc;
		const { reportViewMode$, selectedResult$ } = this._reportViewSvc;

		textMatchClick$
			.pipe(
				filter(ev => ev.origin === 'source' && ev.broadcast),
				map(ev => ev.elem),
				withLatestFrom(selectedResult$, suspectHtmlMatches$, reportViewMode$),
				filter(([, , matches, viewData]) => viewData.isHtmlView && !!matches),
				untilDestroy(this)
			)
			.subscribe(([elem, suspect, matches]) => {
				if (elem && suspect && suspect.result && matches) {
					const comparison = suspect.result.html.comparison[MatchType[elem.match.type] as keyof IComparisonCollection];
					const [start] = findRespectiveStart(elem.match.start, comparison, true);
					const found = matches.findIndex(m => m.start === start);
					this.markSingleMatchInFrame(found);
				} else {
					this.markSingleMatchInFrame(-1);
				}
			});

		sourceHtml$
			.pipe(
				withLatestFrom(selectedResult$, suspectHtmlMatches$, reportViewMode$),
				filter(([, , matches, viewData]) => viewData.isHtmlView && !!matches),
				filter(
					([, suspect, ,]) =>
						suspect != undefined &&
						suspect != null &&
						suspect.result != null &&
						suspect.result != undefined &&
						!!suspect.result.html.value
				),
				untilDestroy(this)
			)
			.subscribe(([match, suspect, matches]) => {
				if (match && suspect && suspect.result && matches) {
					const comparison = suspect.result.html.comparison[MatchType[match.type] as keyof IComparisonCollection];
					const [start] = findRespectiveStart(match.start, comparison, true);
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
