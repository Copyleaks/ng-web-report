import { AfterContentInit, Component, ElementRef, HostBinding, HostListener, Input, Renderer2 } from '@angular/core';
import { Match, MatchType, ReportOrigin } from '../../../models/report-matches.models';
import scrollIntoView from 'scroll-into-view-if-needed';
import { ReportMatchHighlightService } from '../../../services/report-match-highlight.service';

@Component({
	selector: 'span[cr-match]',
	styleUrls: ['./cr-text-match.component.scss'],
	template: '<ng-content></ng-content>',
})
export class CrTextMatchComponent implements AfterContentInit {
	constructor(
		public element: ElementRef<HTMLElement>,
		private renderer: Renderer2,
		private _highlightService: ReportMatchHighlightService
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

		// If the match isn't AI, then trigger the match click event
		// also update the selection type according to the user click (with or without the shift for multi selection)
		this._highlightService.textMatchClicked({
			elem: this,
			broadcast: true,
			origin: this.origin,
			multiSelect: event && event.shiftKey,
		});
	}

	/**
	 * Life-cycle method
	 * Add a class to the native element that represents the match type
	 */
	ngAfterContentInit() {
		this.renderer.addClass(this.element.nativeElement, `cr-m-${this.match.type}`);
	}
}
