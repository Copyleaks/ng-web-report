import { Directive, ElementRef, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { distinctUntilChanged, filter, map, withLatestFrom } from 'rxjs/operators';
import { CorrectionSelectEvent, MatchJumpEvent, MatchSelectEvent } from '../models/report-iframe-events.models';
import { ReportMatchHighlightService } from '../services/report-match-highlight.service';
import { ReportViewService } from '../services/report-view.service';
import { untilDestroy } from '../utils/until-destroy';
import { ReportMatchesService } from '../services/report-matches.service';

@Directive({
	selector: '[crOriginalHtmlHelper]',
})
export class OriginalHtmlHelperComponent implements OnInit, OnDestroy {
	/** sets the seamsless attribute to the iframe */
	@HostBinding('attr.seamless') readonly seamless = true;

	constructor(
		private _reportViewSvc: ReportViewService,
		private _reportMatchesSvc: ReportMatchesService,
		private _highlightSvc: ReportMatchHighlightService,
		private _element: ElementRef<HTMLIFrameElement>
	) {}

	ngOnInit() {
		const { jump$, originalHtml$ } = this._highlightSvc;
		const { reportViewMode$ } = this._reportViewSvc;

		const onOneToManyHtmlJump$ = jump$.pipe(
			withLatestFrom(reportViewMode$),
			distinctUntilChanged(),
			filter(
				([jumpForward, viewModeData]) =>
					(jumpForward === true || jumpForward === false) &&
					(viewModeData.viewMode === 'one-to-many' || viewModeData.viewMode === 'writing-feedback') &&
					viewModeData.isHtmlView
			),
			map(([jumpForward]) => jumpForward),
			untilDestroy(this)
		);
		onOneToManyHtmlJump$.subscribe(jumpForward => {
			this.messageFrame({ type: 'match-jump', forward: jumpForward } as MatchJumpEvent);
		});

		// handle 'Clear Match' event
		originalHtml$
			.pipe(
				untilDestroy(this),
				filter(m => m === null)
			)
			.subscribe(_ => {
				this.messageFrame({ type: 'match-select', index: -1 } as MatchSelectEvent);
			});

		this._reportMatchesSvc.correctionSelect$
			.pipe(
				untilDestroy(this),
				withLatestFrom(reportViewMode$),
				filter(
					([correctionSelect, viewModeData]) =>
						correctionSelect && viewModeData.viewMode === 'writing-feedback' && viewModeData.isHtmlView
				)
			)
			.subscribe(([correctionSelect, _]) => {
				this.frame.postMessage(
					{ type: 'correction-select', gid: correctionSelect.index } as CorrectionSelectEvent,
					'*'
				);
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

	ngOnDestroy() {}
}
