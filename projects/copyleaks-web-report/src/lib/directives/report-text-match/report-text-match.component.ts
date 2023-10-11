import {
	AfterContentInit,
	Component,
	ElementRef,
	EventEmitter,
	HostBinding,
	HostListener,
	Input,
	Output,
	Renderer2,
} from '@angular/core';
import { Match, ReportOrigin } from '../../models/report-matches.models';
import scrollIntoView from 'scroll-into-view-if-needed';
import { ReportMatchHighlightService } from '../../services/report-match-highlight.service';

@Component({
	selector: 'span[cr-match]',
	styleUrls: ['./report-text-match.component.scss'],
	template: '<ng-content></ng-content>',
})
export class ReportTextMatchComponent implements AfterContentInit {
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

	@Output() matchSelected = new EventEmitter<Match>();

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
				block: 'nearest',
				skipOverflowHiddenElements: true,
			});
		}
	}

	/**
	 * emits the element through the match click event
	 */
	@HostListener('click')
	public click() {
		this.matchSelected.emit(this.match);
		this._highlightService.textMatchClicked({ elem: this, broadcast: true, origin: this.origin });
	}

	/**
	 * Life-cycle method
	 * Add a class to the native element that represents the match type
	 */
	ngAfterContentInit() {
		this.renderer.addClass(this.element.nativeElement, `cr-m-${this.match.type}`);
	}
}
