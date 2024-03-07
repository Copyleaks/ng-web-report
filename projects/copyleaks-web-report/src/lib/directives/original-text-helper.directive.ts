import { AfterContentInit, ContentChildren, Directive, Input, OnDestroy, QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, take, takeUntil, withLatestFrom } from 'rxjs/operators';
import { CrTextMatchComponent } from '../components/core/cr-text-match/cr-text-match.component';
import { SlicedMatch, TextMatchHighlightEvent } from '../models/report-matches.models';
import { ReportMatchHighlightService } from '../services/report-match-highlight.service';
import { ReportViewService } from '../services/report-view.service';
import * as helpers from '../utils/highlight-helpers';
import { untilDestroy } from '../utils/until-destroy';
import { ReportMatchesService } from '../services/report-matches.service';
import { IWritingFeedbackCorrectionViewModel } from '../models/report-data.models';

@Directive({
	selector: '[crOriginalTextHelper]',
})
export class OriginalTextHelperDirective implements AfterContentInit, OnDestroy {
	@Input() public host: { contentTextMatches: any; currentPage: number };
	private unsubscribe$ = new Subject();

	private lastSelectedOriginalTextMatch: TextMatchHighlightEvent;

	constructor(
		private highlightService: ReportMatchHighlightService,
		private _reportMatchesSvc: ReportMatchesService,
		private _viewService: ReportViewService
	) {}

	@ContentChildren(CrTextMatchComponent)
	private children: QueryList<CrTextMatchComponent>;
	private current: CrTextMatchComponent | null;

	/**
	 * Handles the jump logic
	 * @param forward the direction of the jump
	 */
	handleJump(forward: boolean) {
		if (this.canJumpInCurrentPage(forward)) {
			const components = this.children.toArray();
			const nextIndex = this.current ? components.indexOf(this.current) + (forward ? 1 : -1) : 0;
			this.highlightService.textMatchClicked({ elem: components[nextIndex], broadcast: true, origin: 'original' });
		} else {
			const page = (forward ? helpers.findNextPageWithMatch : helpers.findPrevPageWithMatch)(
				this.host.contentTextMatches,
				this.host.currentPage
			);
			if (this.host.currentPage !== page) {
				this.children.changes.pipe(take(1)).subscribe(() => {
					const comp = forward ? this.children.first : this.children.last;
					this.highlightService.textMatchClicked({ elem: comp, broadcast: true, origin: 'original' });
				});
				this.host.currentPage = page;
			}
		}
	}

	/**
	 * Handles the jump logic
	 * @param forward the direction of the jump
	 */
	handleCorrectionSelect(correctionSelect: IWritingFeedbackCorrectionViewModel) {
		const foundCorrectionInfo = this.findMatchWithStartAndEnd(
			this.host.contentTextMatches as SlicedMatch[][],
			correctionSelect.start,
			correctionSelect.end
		);

		setTimeout(() => {
			// this.host.currentPage = foundCorrectionInfo.page;
			if (this.host.currentPage === foundCorrectionInfo.page + 1) {
				const components = this.children.toArray();
				components?.forEach(component => {
					if (component) component.focused = false;
				});
				const comp = components.find(
					comp => comp?.match?.start === correctionSelect.start && comp?.match?.end === correctionSelect.end
				);
				this.highlightService.textMatchClicked({
					elem: comp,
					broadcast: false,
					origin: 'original',
					showResults: false,
					multiSelect: false,
				});
			} else {
				this.host.currentPage = foundCorrectionInfo.page + 1;
				this.children.changes.pipe(take(1)).subscribe(() => {
					const components = this.children.toArray();
					components?.forEach(component => {
						if (component) component.focused = false;
					});
					const comp = components.find(
						comp => comp?.match?.start === correctionSelect.start && comp?.match?.end === correctionSelect.end
					);
					this.highlightService.textMatchClicked({
						elem: comp,
						broadcast: false,
						origin: 'original',
						showResults: false,
						multiSelect: false,
					});
				});
			}
		});
	}

	/**
	 * Checks whether it is possible to jump forward/backward in the current page
	 * @param forward the direction of the jump
	 */
	canJumpInCurrentPage(forward: boolean) {
		if (this.current) {
			return forward ? this.current !== this.children.last : this.current !== this.children.first;
		} else {
			return this.children?.length > 0;
		}
	}

	findMatchWithStartAndEnd(
		contentTextMatches: SlicedMatch[][],
		start: number,
		end: number
	): { match: SlicedMatch | null; page: number; index: number } {
		for (let page = 0; page < contentTextMatches.length; page++) {
			for (let index = 0; index < contentTextMatches[page].length; index++) {
				const slicedMatch = contentTextMatches[page][index];
				if (slicedMatch.match.start === start && slicedMatch.match.end === end) {
					return { match: slicedMatch, page, index };
				}
			}
		}
		// If no match is found
		return { match: null, page: -1, index: -1 };
	}

	/**
	 * Life-cycle method
	 * - subscribe to text jump clicks
	 * - subscribe to original text selected match state
	 */
	ngAfterContentInit() {
		const { jump$, originalText$, textMatchClick$ } = this.highlightService;
		originalText$.pipe(untilDestroy(this), takeUntil(this.unsubscribe$)).subscribe(value => (this.current = value));

		const { reportViewMode$ } = this._viewService;

		jump$
			.pipe(
				withLatestFrom(reportViewMode$),
				filter(
					([, viewData]) =>
						(viewData.viewMode === 'one-to-many' ||
							viewData.viewMode === 'only-ai' ||
							viewData.viewMode === 'writing-feedback') &&
						!viewData.isHtmlView
				),
				untilDestroy(this),
				takeUntil(this.unsubscribe$)
			)
			.subscribe(([forward]) => this.handleJump(forward));

		textMatchClick$
			.pipe(
				distinctUntilChanged(),
				withLatestFrom(reportViewMode$),
				filter(
					([textMatchClickEvent, viewData]) =>
						textMatchClickEvent &&
						(viewData.viewMode === 'one-to-many' ||
							viewData.viewMode === 'only-ai' ||
							viewData.viewMode === 'writing-feedback') &&
						!viewData.isHtmlView
				),
				untilDestroy(this),
				takeUntil(this.unsubscribe$)
			)
			.subscribe(([textMatchClickEvent, ,]) => {
				this.lastSelectedOriginalTextMatch = textMatchClickEvent;
			});

		reportViewMode$
			.pipe(
				distinctUntilChanged(),
				filter(
					viewData =>
						this.lastSelectedOriginalTextMatch &&
						(viewData.viewMode === 'one-to-many' ||
							viewData.viewMode === 'only-ai' ||
							viewData.viewMode === 'writing-feedback') &&
						!viewData.isHtmlView
				),
				untilDestroy(this),
				takeUntil(this.unsubscribe$)
			)
			.subscribe(_ => {
				setTimeout(() => {
					const start = this.lastSelectedOriginalTextMatch?.elem?.match?.start;
					const end = this.lastSelectedOriginalTextMatch?.elem?.match?.end;
					const comp = this.children.find(item => item.match.start === start && item.match.end === end);
					if (!comp) {
						return;
					}
					this.highlightService.textMatchClicked({ elem: comp, broadcast: false, origin: 'original' });
				}, 100);
			});

		this._reportMatchesSvc.correctionSelect$
			.pipe(
				untilDestroy(this),
				withLatestFrom(reportViewMode$),
				filter(
					([correctionSelect, viewModeData]) =>
						correctionSelect && viewModeData.viewMode === 'writing-feedback' && !viewModeData.isHtmlView
				)
			)
			.subscribe(([correctionSelect, _]) => {
				this.handleCorrectionSelect(correctionSelect);
			});
	}

	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
