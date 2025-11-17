import { AfterContentInit, Component, ElementRef, HostBinding, HostListener, Input, Renderer2 } from '@angular/core';
import { Match, MatchType, ReportOrigin } from '../../../models/report-matches.models';
import scrollIntoView from 'scroll-into-view-if-needed';
import { ReportMatchHighlightService } from '../../../services/report-match-highlight.service';
import { ISelectExplainableAIResult } from '../../../models/report-ai-results.models';
import { ReportViewService } from '../../../services/report-view.service';
//import { ISelectExplainableAIResult } from '../../../models/report-ai-results.models';

@Component({
	selector: 'span[cr-match]',
	styleUrls: ['./cr-text-match.component.scss'],
	template: '<ng-content></ng-content>',
	standalone: false,
})
export class CrTextMatchComponent implements AfterContentInit {
	constructor(
		public element: ElementRef<HTMLElement>,
		private renderer: Renderer2,
		private _highlightService: ReportMatchHighlightService,
		private _reportViewService: ReportViewService
	) {}

	// tslint:disable-next-line:no-input-rename
	@Input('cr-match')
	public match: Match;

	@Input()
	public origin: ReportOrigin;

	private _focused = false;
	/** focused flag, if set to `true` the element will be highlighted */
	@HostBinding('class.cr-highlight')
	public get focused() {
		return this._focused;
	}
	public set focused(value: boolean) {
		this._focused = value;
		if (value) {
			scrollIntoView(this.element.nativeElement, {
				behavior: 'smooth',
				block: 'center',
				skipOverflowHiddenElements: true,
			});
		}
	}

	/**
	 * emits the element through the match click event
	 */
	@HostListener('click', ['$event'])
	public click(event) {
		if (this.match.type === MatchType.aiText) return;

		if (this._reportViewService.reportViewMode.isHtmlView && this.origin === 'original') {
			this._reportViewService.reportViewMode$.next({ ...this._reportViewService.reportViewMode, isHtmlView: false });
		}
		// clear window selection
		document.getSelection()?.removeAllRanges();

		if (this.match.type === MatchType.aiExplain) {
			const selectAIMachText = !this._focused;
			this._highlightService.aiInsightsShowResult$.next({
				resultRange: {
					start: this.match.start,
					end: this.match.end,
				},
				isSelected: selectAIMachText,
			} as ISelectExplainableAIResult);
		} else {
			// If the match isn't AI, then trigger the match click event
			// also update the selection type according to the user click (with or without the shift for multi selection)
			this._highlightService.textMatchClicked({
				elem: this,
				broadcast: true,
				origin: this.origin,
				multiSelect: event && event.shiftKey,
			});
		}
	}

	@HostListener('mouseenter')
	public hoverIn(): void {
		if (this.match.type !== MatchType.manualExclusion) {
			return;
		}
		setTimeout(() => {
			// find all html elements with the same group id and add hover class
			const groupId = this.match.txtGid;
			const elements = document.querySelectorAll(`[data-txt-gid="${groupId}"]`);

			elements.forEach(el => {
				el.classList.add('selected');
			});
		});
	}

	@HostListener('mouseleave')
	public hoverOut(): void {
		if (this.match.type !== MatchType.manualExclusion) {
			return;
		}

		setTimeout(() => {
			// find all html elements with the same group id and remove hover class
			const groupId = this.match.txtGid;
			const elements = document.querySelectorAll(`[data-txt-gid="${groupId}"]`);
			elements.forEach(el => {
				el.classList.remove('selected');
			});
		});
	}

	/**
	 * Life-cycle method
	 * Add a class to the native element that represents the match type
	 */
	ngAfterContentInit() {
		if (this.match.type === MatchType.aiExplain) {
			this.renderer.addClass(this.element.nativeElement, `cr-m-${MatchType.aiExplain}-${this.match.proportionType}`);
		} else {
			this.renderer.addClass(this.element.nativeElement, `cr-m-${this.match.type}`);
		}
	}
}
