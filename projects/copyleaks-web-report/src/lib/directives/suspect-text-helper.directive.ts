import { AfterContentInit, ContentChildren, Directive, Input, OnDestroy, QueryList } from '@angular/core';
import { filter, take, takeUntil, withLatestFrom } from 'rxjs/operators';
import { ContentMode } from '../models/report-config.models';
import { Match } from '../models/report-matches.models';
import { ReportDataService } from '../services/report-data.service';
import { ReportMatchHighlightService } from '../services/report-match-highlight.service';
import { ReportViewService } from '../services/report-view.service';
import { ReportTextMatchComponent } from './report-text-match/report-text-match.component';
import { IResultDetailResponse } from '../models/report-data.models';
import * as helpers from '../utils/highlight-helpers';
import { Subject } from 'rxjs';

@Directive({
	selector: '[crSuspectTextHelper]',
})
export class SuspectTextHelperDirective implements AfterContentInit, OnDestroy {
	@Input() public host: { currentPage: number };

	private destroy$ = new Subject<void>();

	constructor(
		private _highlightSvc: ReportMatchHighlightService,
		private _viewService: ReportViewService,
		private _dataSvc: ReportDataService
	) {}

	@ContentChildren(ReportTextMatchComponent)
	private children: QueryList<ReportTextMatchComponent>;

	/**
	 * Handle a match click that was broadcasted by the source text helper
	 * @param elem the broadcasted element
	 * @param suspect the suspected scan result
	 * @param contentMode content mode of the broadcasting match
	 */
	handleBroadcast(match: Match, suspect: IResultDetailResponse, contentMode: ContentMode) {
		const [, start] = helpers.findRespectiveMatch(match, suspect[contentMode].comparison, true);
		const page = helpers.findRespectivePage(start, suspect.text.pages.startPosition);
		if (page === this.host.currentPage) {
			const comp = this.children.find(item => item.match.start === start);
			if (comp === null || comp === undefined) {
				throw new Error('Match component was not found in view');
			}
			this._highlightSvc.textMatchClicked({ elem: comp, broadcast: false, origin: 'suspect' });
		} else {
			this.children.changes.pipe(take(1), takeUntil(this.destroy$)).subscribe(() => {
				const comp = this.children.find(item => item.match.start === start);
				if (comp === null || comp === undefined) {
					throw new Error('Match component was not found in view');
				}
				this._highlightSvc.textMatchClicked({ elem: comp, broadcast: false, origin: 'suspect' });
			});
			this.host.currentPage = page;
		}
	}

	/**
	 * Life-cycle method
	 * - listen to text match clicks from `source`
	 */
	ngAfterContentInit() {
		const { reportViewMode$, selectedResult$ } = this._viewService;
		const { textMatchClick$, sourceHtml$ } = this._highlightSvc;
		textMatchClick$
			.pipe(
				filter(ev => ev.origin === 'source' && ev.broadcast),
				withLatestFrom(selectedResult$),
				takeUntil(this.destroy$)
			)
			.subscribe(([{ elem }, suspect]) => {
				if (elem && suspect?.result) {
					this.handleBroadcast(elem.match, suspect.result, 'text');
				}
			});

		sourceHtml$
			.pipe(
				withLatestFrom(selectedResult$, reportViewMode$),
				filter(([, , viewData]) => viewData.isHtmlView),
				filter(
					([, suspect]) =>
						suspect != null && suspect != undefined && suspect.result != undefined && !suspect.result.html.value
				),
				takeUntil(this.destroy$)
			)
			.subscribe(([match, suspect]) => {
				if (match && suspect?.result) this.handleBroadcast(match, suspect.result, 'html');
			});
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
