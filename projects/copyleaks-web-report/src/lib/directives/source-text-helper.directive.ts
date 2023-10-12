import { Directive, AfterContentInit, OnDestroy, Input, ContentChildren, QueryList } from '@angular/core';
import { filter, withLatestFrom, take } from 'rxjs/operators';
import { ContentMode } from '../models/report-config.models';
import { Match } from '../models/report-matches.models';
import { ReportMatchHighlightService } from '../services/report-match-highlight.service';
import { ReportViewService } from '../services/report-view.service';
import { ReportTextMatchComponent } from './report-text-match/report-text-match.component';
import { IResultDetailResponse, IScanSource } from '../models/report-data.models';
import * as helpers from '../utils/highlight-helpers';
import { ReportDataService } from '../services/report-data.service';

@Directive({
	selector: '[crSourceTextHelper]',
})
export class SourceTextHelperDirective implements AfterContentInit, OnDestroy {
	@Input() public host: { currentPage: number; contentTextMatches: any };
	constructor(
		private _highlightSvc: ReportMatchHighlightService,
		private _viewService: ReportViewService,
		private _dataSvc: ReportDataService
	) {}

	@ContentChildren(ReportTextMatchComponent)
	private children: QueryList<ReportTextMatchComponent>;
	private current: ReportTextMatchComponent | null;

	/**
	 * Life-cycle method
	 * - subscribe to text match clicks from suspect
	 * - subscribe to jump events
	 * - subscribe to the source text selected match
	 */
	ngAfterContentInit() {
		const { textMatchClick$, jump$, sourceText$, suspectHtml$ } = this._highlightSvc;
		const { crawledVersion$ } = this._dataSvc;
		const { reportViewMode$, selectedResult$ } = this._viewService;
		sourceText$.subscribe(value => (this.current = value));
		textMatchClick$
			.pipe(
				filter(ev => ev.origin === 'suspect' && ev.broadcast),
				withLatestFrom(crawledVersion$, selectedResult$, reportViewMode$),
				filter(([, , , viewData]) => !viewData.isHtmlView)
			)
			.subscribe(([{ elem }, source, suspect]) => {
				if (elem && source && suspect?.result) {
					this.handleBroadcast(elem.match, source, suspect.result, 'text');
				}
			});

		jump$
			.pipe(
				withLatestFrom(reportViewMode$),
				filter(([, viewData]) => viewData.viewMode === 'one-to-one' && !viewData.isHtmlView)
			)
			.subscribe(([forward]) => this.handleJump(forward));

		suspectHtml$
			.pipe(
				withLatestFrom(crawledVersion$, selectedResult$, reportViewMode$),
				filter(([, , , viewData]) => viewData.isHtmlView),
				filter(([, source]) => !source?.html || !source.html.value)
			)
			.subscribe(([match, source, suspect]) => {
				if (match && source && suspect?.result) this.handleBroadcast(match, source, suspect.result, 'html');
			});
	}
	/**
	 * Handle a match click that was broadcasted by the suspect text helper
	 * @param elem the broadcasted element
	 * @param suspect the suspected scan result
	 */
	handleBroadcast(match: Match, source: IScanSource, suspect: IResultDetailResponse, contentMode: ContentMode) {
		const [, start] = helpers.findRespectiveMatch(match, suspect[contentMode].comparison, false);
		const page = helpers.findRespectivePage(start, source.text.pages.startPosition);
		if (page === this.host.currentPage) {
			const comp = this.children.find(item => item.match.start === start);
			if (comp === null || comp === undefined) {
				throw new Error('Match component was not found in view');
			}
			this._highlightSvc.textMatchClicked({ elem: comp, broadcast: false, origin: 'source' });
		} else {
			this.children.changes.pipe(take(1)).subscribe(() => {
				const comp = this.children.find(item => item.match.start === start);
				if (comp === null || comp === undefined) {
					throw new Error('Match component was not found in view');
				}
				this._highlightSvc.textMatchClicked({ elem: comp, broadcast: false, origin: 'source' });
			});
			this.host.currentPage = page;
		}
	}
	/**
	 * Handles the jump logic
	 * @param forward the direction of the jump
	 */
	handleJump(forward: boolean) {
		if (this.canJumpInCurrentPage(forward)) {
			const components = this.children.toArray();
			const nextIndex = this.current ? components.indexOf(this.current) + (forward ? 1 : -1) : 0;
			this._highlightSvc.textMatchClicked({ elem: components[nextIndex], broadcast: true, origin: 'source' });
		} else {
			const page = forward
				? helpers.findNextPageWithMatch(this.host.contentTextMatches, this.host.currentPage)
				: helpers.findPrevPageWithMatch(this.host.contentTextMatches, this.host.currentPage);
			if (this.host.currentPage !== page) {
				this._highlightSvc.textMatchClicked({ elem: this.current, broadcast: true, origin: 'source' });
				this.children.changes.pipe(take(1)).subscribe(() => {
					const comp = forward ? this.children.first : this.children.last;
					this._highlightSvc.textMatchClicked({ elem: comp, broadcast: true, origin: 'source' });
				});
				this.host.currentPage = page;
			}
		}
	}

	/**
	 * Checks whether it is possible to jump forward/backward in the current page
	 * @param forward the direction of the jump
	 */
	canJumpInCurrentPage(forward: boolean): boolean {
		if (this.current) {
			return forward ? this.current !== this.children.last : this.current !== this.children.first;
		} else {
			return this.children.length > 0;
		}
	}

	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}
