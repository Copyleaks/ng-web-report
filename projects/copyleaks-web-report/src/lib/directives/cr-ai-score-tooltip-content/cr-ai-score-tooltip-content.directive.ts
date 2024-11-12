import { Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { Directive, ElementRef, HostListener } from '@angular/core';
import { CrAIScoreTooltipContentComponent } from './cr-ai-score-tooltip-content.component';
import { ComponentPortal } from '@angular/cdk/portal';

@Directive({
	selector: '[crAIScoreTooltipContent]',
})
export class CrAIScoreTooltipContentDirective {
	private _overlayRef: OverlayRef;

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
	show() {
		// Attach the component if it has not already attached to the overlay
		if (this._overlayRef && !this._overlayRef.hasAttached()) {
			this._overlayRef.attach(new ComponentPortal(CrAIScoreTooltipContentComponent));
		}
	}

	/**
	 * Event listener for mouseleave event.
	 * Hides the tooltip when the mouse leaves the element.
	 */
	@HostListener('mouseleave')
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
