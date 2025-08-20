import { Directive, ElementRef, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { distinctUntilChanged, filter, map, withLatestFrom } from 'rxjs/operators';
import {
	CorrectionSelectEvent,
	MatchGroupSelectEvent,
	MatchJumpEvent,
	MatchSelectEvent,
} from '../models/report-iframe-events.models';
import { ReportMatchHighlightService } from '../services/report-match-highlight.service';
import { ReportViewService } from '../services/report-view.service';
import { untilDestroy } from '../utils/until-destroy';
import { ALERTS } from '../constants/report-alerts.constants';
import { ReportDataService } from '../services/report-data.service';
import { AIScanResult } from '../models/report-matches.models';

@Directive({
    selector: '[crOriginalHtmlHelper]',
    standalone: false
})
export class OriginalHtmlHelperComponent implements OnInit, OnDestroy {
	/** sets the seamsless attribute to the iframe */
	@HostBinding('attr.seamless') readonly seamless = true;

	constructor(
		private _reportViewSvc: ReportViewService,
		private _reportDataSvc: ReportDataService,
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
					(viewModeData.viewMode === 'one-to-many' ||
						viewModeData.viewMode === 'writing-feedback' ||
						viewModeData.viewMode === 'only-ai') &&
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

		this._highlightSvc.correctionSelect$
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

		this._highlightSvc.aiInsightsSelect$
			.pipe(
				untilDestroy(this),
				withLatestFrom(reportViewMode$),
				filter(([selectResult, viewModeData]) => {
					return (
						selectResult && viewModeData.alertCode === ALERTS.SUSPECTED_AI_TEXT_DETECTED && viewModeData.isHtmlView
					);
				})
			)
			.subscribe(([selectResult, _]) => {
				const validSelectedAlert = this._reportDataSvc.scanResultsPreviews?.notifications?.alerts?.find(
					a => a.code === ALERTS.SUSPECTED_AI_TEXT_DETECTED
				);
				if (validSelectedAlert) {
					var scanResult = JSON.parse(validSelectedAlert.additionalData) as AIScanResult;
					const index = scanResult.explain.patterns.text.chars.starts.findIndex(
						s => s === selectResult.resultRange.start
					);
					this.messageFrame({ type: 'match-group-select', groupId: index } as MatchGroupSelectEvent);
				}
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
