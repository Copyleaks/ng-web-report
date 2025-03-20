import {
	ApplicationRef,
	ComponentFactoryResolver,
	ComponentRef,
	Directive,
	ElementRef,
	EmbeddedViewRef,
	HostListener,
	Injector,
	Input,
} from '@angular/core';
import { CrReportScoreTooltipContentComponent } from './cr-report-score-tooltip-content.component';
import { IReportScoreTooltipModel } from '../../models/report-view.models';
import { EReportScoreTooltipPosition, EResponsiveLayoutType } from '../../enums/copyleaks-web-report.enums';
import { ReportViewService } from '../../services/report-view.service';

@Directive({
	selector: '[crReportScoreTooltip]',
})
export class ReportScoreTooltipDirective {
	@Input() crReportScoreTooltip: IReportScoreTooltipModel | null = null;
	@Input() crReportScoreTooltipPosition: EReportScoreTooltipPosition = EReportScoreTooltipPosition.DEFAULT;
	@Input() reportViewService: ReportViewService;

	private componentRef: ComponentRef<any> | null = null;

	constructor(
		private elementRef: ElementRef,
		private appRef: ApplicationRef,
		private componentFactoryResolver: ComponentFactoryResolver,
		private injector: Injector
	) {}

	@HostListener('mouseenter')
	@HostListener('focus')
	onMouseEnter(): void {
		if (this.reportViewService.reportResponsiveMode.mode == EResponsiveLayoutType.Mobile) return;

		if (this.componentRef === null && !this._areAllPropsUndefined) {
			const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
				CrReportScoreTooltipContentComponent
			);
			this.componentRef = componentFactory.create(this.injector);
			this.appRef.attachView(this.componentRef.hostView);
			const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
			document.body.appendChild(domElem);
			this._setTooltipComponentProperties();
		}
	}

	@HostListener('mouseleave')
	@HostListener('blur')
	onMouseLeave(): void {
		this.destroy();
	}

	private _setTooltipComponentProperties() {
		if (this.componentRef !== null) {
			this.componentRef.instance.scoreStats = this.crReportScoreTooltip;
			this.componentRef.instance.reportViewService = this.reportViewService;
			this.componentRef.instance.position = this.crReportScoreTooltipPosition;

			const { left, right, top, bottom } = this.elementRef.nativeElement.getBoundingClientRect();

			switch (this.crReportScoreTooltipPosition) {
				case EReportScoreTooltipPosition.BELOW: {
					this.componentRef.instance.left = Math.round((right - left) / 2 + left);
					this.componentRef.instance.top = Math.round(bottom);
					break;
				}
				case EReportScoreTooltipPosition.ABOVE: {
					this.componentRef.instance.left = Math.round((right - left) / 2 + left);
					this.componentRef.instance.top = Math.round(top - 10);
					break;
				}
				case EReportScoreTooltipPosition.RIGHT: {
					this.componentRef.instance.left = Math.round(right);
					this.componentRef.instance.top = Math.round(top + (bottom - top) / 2);
					break;
				}
				case EReportScoreTooltipPosition.LEFT: {
					this.componentRef.instance.left = Math.round(left);
					this.componentRef.instance.top = Math.round(top + (bottom - top) / 2);
					break;
				}
				default: {
					break;
				}
			}
		}
	}
	private get _areAllPropsUndefined(): boolean {
		return (
			this.crReportScoreTooltip?.aiPct === undefined &&
			this.crReportScoreTooltip?.humanPct === undefined &&
			this.crReportScoreTooltip?.identicalPct === undefined &&
			this.crReportScoreTooltip?.minorChangesPct === undefined &&
			this.crReportScoreTooltip?.paraphrasedPct === undefined
		);
	}

	ngOnDestroy(): void {
		this.destroy();
	}

	destroy(): void {
		if (this.componentRef !== null) {
			this.appRef.detachView(this.componentRef.hostView);
			this.componentRef.destroy();
			this.componentRef = null;
		}
	}
}
