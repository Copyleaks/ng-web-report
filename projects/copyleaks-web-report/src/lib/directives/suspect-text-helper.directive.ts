import { AfterContentInit, ContentChildren, Directive, Input, OnDestroy, QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, take, takeUntil, withLatestFrom } from 'rxjs/operators';
import { CrTextMatchComponent } from '../components/core/cr-text-match/cr-text-match.component';
import { ContentMode } from '../models/report-config.models';
import { IResultDetailResponse } from '../models/report-data.models';
import { Match } from '../models/report-matches.models';
import { ReportMatchHighlightService } from '../services/report-match-highlight.service';
import { ReportViewService } from '../services/report-view.service';
import * as helpers from '../utils/highlight-helpers';
import { untilDestroy } from '../utils/until-destroy';

@Directive({
	selector: '[crSuspectTextHelper]',
})
export class SuspectTextHelperDirective implements AfterContentInit, OnDestroy {
	@Input() public host: { currentPage: number };

	private unsubscribe$ = new Subject();

	constructor(private _highlightSvc: ReportMatchHighlightService, private _viewService: ReportViewService) {}

	@ContentChildren(CrTextMatchComponent)
	private children: QueryList<CrTextMatchComponent>;

	/**
	 * Handle a match click that was broadcasted by the source text helper
	 * @param elem the broadcasted element
	 * @param suspect the suspected scan result
	 * @param contentMode content mode of the broadcasting match
	 */
	handleBroadcast(match: Match, suspect: IResultDetailResponse, contentMode: ContentMode) {
		setTimeout(() => {
			const [, start] = helpers.findRespectiveMatch(match, suspect[contentMode].comparison, true);
			const page = helpers.findRespectivePage(start, suspect.text.pages.startPosition);
			if (page === this.host.currentPage) {
				const comp = this.children.find(item => item.match.start === start);
				if (comp === null || comp === undefined) {
					return;
				}
				this._highlightSvc.textMatchClicked({ elem: comp, broadcast: false, origin: 'suspect' });
			} else {
				this.children.changes.pipe(take(1)).subscribe(() => {
					const comp = this.children.find(item => item.match.start === start);
					if (comp === null || comp === undefined) {
						return;
					}
					this._highlightSvc.textMatchClicked({ elem: comp, broadcast: false, origin: 'suspect' });
				});
				this.host.currentPage = page;
			}
		});
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
				untilDestroy(this),
				takeUntil(this.unsubscribe$)
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
				)
			)
			.subscribe(([match, suspect]) => {
				if (match && suspect?.result) this.handleBroadcast(match, suspect.result, 'html');
				if (!match && suspect?.result)
					this._highlightSvc.textMatchClicked({ elem: null, broadcast: false, origin: 'suspect' });
			});
	}

	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
