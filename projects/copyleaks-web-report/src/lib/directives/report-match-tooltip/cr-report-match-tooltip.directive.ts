import { Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, Directive, ElementRef, HostListener, Input } from '@angular/core';
import { CrReportMatchTooltipContentComponent } from './cr-report-match-tooltip-content.component';
import { MatchType } from '../../models/report-matches.models';

@Directive({
    selector: '[crReportMatchTooltip]',
    standalone: false
})
export class CrReportMatchTooltipDirective {
	/**
	 * Data to be passed to the tooltip component.
	 */
	@Input(`crReportMatchTooltip`) data: any;

	/**
	 * Type of the report match.
	 */
	@Input() crReportMatchTooltipType: MatchType;

	private _overlayRef: OverlayRef;

	constructor(
		private _overlay: Overlay,
		private _overlayPositionBuilder: OverlayPositionBuilder,
		private _elementRef: ElementRef
	) {}

	/**
	 * Initializes the directive.
	 */
	ngOnInit() {
		if (!this.data) {
			return;
		}

		const positionStrategy = this._overlayPositionBuilder.flexibleConnectedTo(this._elementRef).withPositions([
			{
				originX: 'center',
				originY: 'top',
				overlayX: 'center',
				overlayY: 'bottom',
				offsetY: 1,
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
			const tooltipRef: ComponentRef<CrReportMatchTooltipContentComponent> = this._overlayRef.attach(
				new ComponentPortal(CrReportMatchTooltipContentComponent)
			);

			switch (this.crReportMatchTooltipType) {
				case MatchType.writingFeedback:
					tooltipRef.instance.correctionData = this.data;
					break;
				default:
					break;
			}
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
