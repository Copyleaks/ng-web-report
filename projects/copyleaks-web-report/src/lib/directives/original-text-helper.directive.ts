import { AfterContentInit, ContentChildren, Directive, EventEmitter, Input, OnDestroy, QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, take, takeUntil, withLatestFrom } from 'rxjs/operators';
import { CrTextMatchComponent } from '../components/core/cr-text-match/cr-text-match.component';
import { Range, SlicedMatch, TextMatchHighlightEvent } from '../models/report-matches.models';
import { ReportMatchHighlightService } from '../services/report-match-highlight.service';
import { ReportViewService } from '../services/report-view.service';
import * as helpers from '../utils/highlight-helpers';
import { untilDestroy } from '../utils/until-destroy';
import { ReportMatchesService } from '../services/report-matches.service';
import { IWritingFeedbackCorrectionViewModel } from '../models/report-data.models';
import { PageEvent } from '../components/core/cr-paginator/models/cr-paginator.models';

@Directive({
	selector: '[crOriginalTextHelper]',
})
export class OriginalTextHelperDirective implements AfterContentInit, OnDestroy {
	@Input() public host: {
		contentTextMatches: any;
		currentPage: number;
		customViewMatchesData: { id: string; start: number; end: number; pageNumber: number }[][];
		customViewMatcheClassName;
		onTextMatchSelectionEvent: EventEmitter<TextMatchHighlightEvent | any>;
		onPaginationEvent(event: PageEvent): void;
	};
	private unsubscribe$ = new Subject();

	private lastSelectedOriginalTextMatch: TextMatchHighlightEvent;

	constructor(
		private highlightService: ReportMatchHighlightService,
		private _reportMatchesSvc: ReportMatchesService,
		private _viewService: ReportViewService
	) {}

	@ContentChildren(CrTextMatchComponent)
	private children: QueryList<CrTextMatchComponent>;
	private current: CrTextMatchComponent | Element | null;

	/**
	 * Handles the jump logic
	 * @param forward the direction of the jump
	 */
	handleJump(forward: boolean) {
		if (this.host.customViewMatchesData) {
			let customMatches = document.querySelectorAll('.' + this.host.customViewMatcheClassName);
			if (customMatches.length === 0) return;
			const canJump = forward
				? this.current !== customMatches[customMatches.length - 1]
				: this.current !== customMatches[0];

			if (canJump) {
				const components = Array.from(customMatches);
				const nextIndex = this.current ? components.indexOf(this.current as Element) + (forward ? 1 : -1) : 0;
				const selectedElementId = (components[nextIndex] as HTMLElement)?.dataset?.['id'];
				this.selecteCustomElementById(selectedElementId, components, nextIndex);
			} else {
				let nextPage = null;
				if (forward) {
					for (let i = this.host.currentPage; i < this.host.customViewMatchesData.length; i++) {
						if (this.host.customViewMatchesData[i].length > 0) {
							nextPage = i + 1;
							break;
						}
					}
				} else {
					for (let i = this.host.currentPage - 2; i >= 0; i--) {
						if (this.host.customViewMatchesData[i].length > 0) {
							nextPage = i + 1;
							break;
						}
					}
				}
				if (nextPage === null) nextPage = this.host.currentPage;

				if (this.host.currentPage !== nextPage) {
					this.host.currentPage = nextPage;
					this.host.onPaginationEvent({
						pageIndex: nextPage,
						preIndex: nextPage,
					});
					setTimeout(() => {
						customMatches = document.querySelectorAll('.' + this.host.customViewMatcheClassName);
						const components = Array.from(customMatches);
						const nextIndex = forward ? 0 : customMatches.length - 1;
						const selectedElementId = (components[nextIndex] as HTMLElement)?.dataset?.['id'];
						this.selecteCustomElementById(selectedElementId, components, nextIndex);
					});
				}
			}
		} else {
			if (this.canJumpInCurrentPage(forward)) {
				const components = this.children.toArray();
				const nextIndex = this.current
					? components.indexOf(this.current as CrTextMatchComponent) + (forward ? 1 : -1)
					: 0;
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
	}

	selecteCustomElementById(selectedElementId: string, components: Element[], nextIndex: number) {
		const contentContainer = document.querySelector('.content-container')?.querySelector('.content-container');
		if (!contentContainer) return;

		const rect = components[nextIndex].getBoundingClientRect();
		let scrollY = contentContainer.scrollTop;

		const top = rect.top + scrollY;

		const selectedAnnotation = this.host.customViewMatchesData[this.host.currentPage - 1].find(
			cvm => cvm.id === selectedElementId
		);
		const annotationEvent = {
			type: 'annotation-click',
			id: selectedAnnotation.id,
			start: selectedAnnotation.start,
			end: selectedAnnotation.end,
			offsetTop: top + 'px',
			scrollViewOffsetTop: rect.top + 'px',
		};
		this.host.onTextMatchSelectionEvent.emit(annotationEvent);

		this.current = components[nextIndex];
		components.forEach(c => {
			c.classList.remove('selected');
		});
		(this.current as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
		(this.current as HTMLElement).classList.add('selected');
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
		if (foundCorrectionInfo.page === -1) return;

		setTimeout(() => {
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
	 * select ai match resuli
	 * @param match
	 */
	selectAIInsights(match: Range) {
		const foundCorrectionInfo = this.findMatchWithStartAndEnd(
			this.host.contentTextMatches as SlicedMatch[][],
			match.start,
			match.end
		);
		if (foundCorrectionInfo.page === -1) return;
		setTimeout(() => {
			if (this.host.currentPage === foundCorrectionInfo.page + 1) {
				const components = this.children.toArray();
				const comp = components.find(comp => comp?.match?.start === match.start && comp?.match?.end === match.end);
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
					const comp = components.find(comp => comp?.match?.start === match.start && comp?.match?.end === match.end);
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
	 * remove select ai match result
	 * @param match
	 */
	removeSelectAIInsights(match: Range) {
		const foundCorrectionInfo = this.findMatchWithStartAndEnd(
			this.host.contentTextMatches as SlicedMatch[][],
			match.start,
			match.end
		);
		if (foundCorrectionInfo.page === -1) return;
		setTimeout(() => {
			if (this.host.currentPage === foundCorrectionInfo.page + 1) {
				const components = this.children.toArray();
				components.find(comp => comp?.match?.start === match.start && comp?.match?.end === match.end).focused = false;
			} else {
				this.children.changes.pipe(take(1)).subscribe(() => {
					const components = this.children.toArray();
					components.find(comp => comp?.match?.start === match.start && comp?.match?.end === match.end).focused = false;
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

				const currentSelectedCorrection = this._reportMatchesSvc.correctionSelect;
				if (
					!!currentSelectedCorrection &&
					textMatchClickEvent?.elem?.match?.start != currentSelectedCorrection.start &&
					textMatchClickEvent?.elem?.match?.end != currentSelectedCorrection.end
				)
					setTimeout(() => {
						const components = this.children?.toArray();
						components?.forEach(component => {
							if (
								component &&
								component?.match?.start === currentSelectedCorrection.start &&
								component?.match?.end === currentSelectedCorrection.end
							)
								component.focused = false;
						});
					});
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

		this._reportMatchesSvc.aiInsightsSelect$
			.pipe(
				untilDestroy(this),
				withLatestFrom(reportViewMode$),
				filter(
					([correctionSelect, viewModeData]) =>
						correctionSelect && viewModeData.viewMode === 'one-to-many' && !viewModeData.isHtmlView
				)
			)
			.subscribe(([aiInsightsSelect, _]) => {
				if (!aiInsightsSelect) return;
				if (aiInsightsSelect.isSelected) {
					this.selectAIInsights(aiInsightsSelect.resultRange);
				} else {
					this.removeSelectAIInsights(aiInsightsSelect.resultRange);
				}
			});

		this.host.onTextMatchSelectionEvent.subscribe((event: any) => {
			if (event.type === 'annotation-click') {
				const customMatches = document.querySelectorAll('.' + this.host.customViewMatcheClassName);
				const components = Array.from(customMatches);
				const clickedElement = components.find(c => (c as HTMLElement)?.dataset?.['id'] === event.id);
				this.current = clickedElement;
				components.forEach(c => {
					c.classList.remove('selected');
				});
				if (!clickedElement) return;

				(this.current as HTMLElement).classList.add('selected');
			}
		});
	}

	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
