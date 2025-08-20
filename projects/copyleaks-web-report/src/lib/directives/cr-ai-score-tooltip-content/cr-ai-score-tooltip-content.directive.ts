import { Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { ComponentRef, Directive, ElementRef, HostListener, Input } from '@angular/core';
import { CrAIScoreTooltipContentComponent } from './cr-ai-score-tooltip-content.component';
import { ComponentPortal } from '@angular/cdk/portal';

@Directive({
    selector: '[crAIScoreTooltipContent]',
    standalone: false
})
export class CrAIScoreTooltipContentDirective {
	private _overlayRef: OverlayRef;
	@Input() isResultTitle: boolean = false;
	@Input() tooltipText: string = '';
	@Input() tooltipPosition: string = 'top';
	@Input() isTooltipBar: boolean = false;

	constructor(
		private _overlay: Overlay,
		private _overlayPositionBuilder: OverlayPositionBuilder,
		private _elementRef: ElementRef
	) {}

	ngOnInit() {
		const positionStrategy = this._overlayPositionBuilder.flexibleConnectedTo(this._elementRef).withPositions([
			{
				originX: 'center',
				originY: 'top',
				overlayX: 'center',
				overlayY: 'bottom',
				offsetY: -8,
			},
		]);

		this._overlayRef = this._overlay.create({ positionStrategy });
	}

	/**
	 * Event listener for mouseenter event.
	 * Shows the tooltip when the mouse enters the element.
	 */
	@HostListener('mouseenter')
	@HostListener('focus')
	show() {
		let isOverflowing = false;
		if (this.isResultTitle && this.tooltipText) {
			isOverflowing = this._elementRef.nativeElement.scrollWidth > this._elementRef.nativeElement.clientWidth;
		}
		// Attach the component if it has not already attached to the overlay
		if (this._overlayRef && !this._overlayRef.hasAttached()) {
			const tooltipRef: ComponentRef<CrAIScoreTooltipContentComponent> = this._overlayRef.attach(
				new ComponentPortal(CrAIScoreTooltipContentComponent)
			);
			tooltipRef.instance.tooltipText = this.isResultTitle ? (isOverflowing ? this.tooltipText : '') : this.tooltipText;
			tooltipRef.instance.isTooltipBar = this.isTooltipBar;
		}
	}

	/**
	 * Event listener for mouseleave event.
	 * Hides the tooltip when the mouse leaves the element.
	 */
	@HostListener('mouseleave')
	@HostListener('blur')
	hide() {
		this.closeToolTip();
	}

	/**
	 * Cleans up the directive when it is destroyed.
	 */
	ngOnDestroy() {
		this.closeToolTip();
	}

	/**
	 * Closes the tooltip by detaching it from the overlay.
	 */
	private closeToolTip() {
		if (this._overlayRef) {
			this._overlayRef.detach();
		}
	}
}
