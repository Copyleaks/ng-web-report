import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { distinctUntilChanged, filter, map, takeUntil, withLatestFrom } from 'rxjs/operators';
import { ReportMatchHighlightService } from '../services/report-match-highlight.service';
import { ReportViewService } from '../services/report-view.service';
import { MatchJumpEvent } from '../models/report-iframe-events.models';
import { Subject } from 'rxjs';

@Directive({
	selector: '[crOriginalHtmlHelper]',
})
export class OriginalHtmlHelperComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();

	constructor(
		private _reportViewSvc: ReportViewService,
		private _highlightSvc: ReportMatchHighlightService,
		private _element: ElementRef<HTMLIFrameElement>
	) {}

	ngOnInit() {
		const { jump$ } = this._highlightSvc;
		const { reportViewMode$ } = this._reportViewSvc;

		const onOneToManyHtmlJump$ = jump$.pipe(
			withLatestFrom(reportViewMode$),
			distinctUntilChanged(),
			filter(
				([jumpForward, viewModeData]) =>
					(jumpForward === true || jumpForward === false) &&
					viewModeData.viewMode === 'one-to-many' &&
					viewModeData.isHtmlView
			),
			map(([jumpForward]) => jumpForward),
			takeUntil(this.destroy$)
		);
		onOneToManyHtmlJump$.subscribe(jumpForward => {
			this.messageFrame({ type: 'match-jump', forward: jumpForward } as MatchJumpEvent);
		});
	}

	protected get frame() {
		return this._element.nativeElement.contentWindow;
	}

	/**
	 * Send a message to the iframe using PostMessage API
	 * @param data the data to post
	 */
	protected messageFrame(data: any) {
		this.frame && this.frame.postMessage(data, '*');
	}

	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}
