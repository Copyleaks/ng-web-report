import {
	Directive,
	ElementRef,
	ComponentRef,
	EmbeddedViewRef,
	HostListener,
	Injector,
	Input,
	OnDestroy,
	ViewContainerRef,
} from '@angular/core';
import { CrReportScoreTooltipContentComponent } from './cr-report-score-tooltip-content.component';
import { IReportScoreTooltipModel } from '../../models/report-view.models';
import { EReportScoreTooltipPosition, EResponsiveLayoutType } from '../../enums/copyleaks-web-report.enums';
import { ReportViewService } from '../../services/report-view.service';

@Directive({
    selector: '[crReportScoreTooltip]',
    standalone: false
})
export class ReportScoreTooltipDirective implements OnDestroy {
	@Input() crReportScoreTooltip: IReportScoreTooltipModel | null = null;
	@Input() crReportScoreTooltipPosition: EReportScoreTooltipPosition = EReportScoreTooltipPosition.DEFAULT;
	@Input() reportViewService!: ReportViewService;

	private componentRef: ComponentRef<CrReportScoreTooltipContentComponent> | null = null;

	constructor(private elementRef: ElementRef, private injector: Injector, private vcr: ViewContainerRef) {}

	@HostListener('mouseenter')
	@HostListener('focus')
	onMouseEnter(): void {
		if (this.reportViewService.reportResponsiveMode.mode === EResponsiveLayoutType.Mobile) {
			return;
		}
		if (!this.componentRef && !this._areAllPropsUndefined) {
			// 1) Create and insert the component in one go:
			this.componentRef = this.vcr.createComponent(CrReportScoreTooltipContentComponent, { injector: this.injector });

			// 2) Trigger change detection
			this.componentRef.changeDetectorRef.detectChanges();

			// 3) Move its host element under <body>
			const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
			document.body.appendChild(domElem);

			// 4) Set inputs & positioning
			this._setTooltipComponentProperties();
		}
	}

	@HostListener('mouseleave')
	@HostListener('blur')
	onMouseLeave(): void {
		this.destroy();
	}

	private _setTooltipComponentProperties(): void {
		if (!this.componentRef) return;

		Object.assign(this.componentRef.instance, {
			scoreStats: this.crReportScoreTooltip,
			reportViewService: this.reportViewService,
			position: this.crReportScoreTooltipPosition,
		});

		const { left, right, top, bottom } = this.elementRef.nativeElement.getBoundingClientRect();

		switch (this.crReportScoreTooltipPosition) {
			case EReportScoreTooltipPosition.BELOW:
				this.componentRef.instance.left = Math.round((right - left) / 2 + left);
				this.componentRef.instance.top = Math.round(bottom);
				break;
			case EReportScoreTooltipPosition.ABOVE:
				this.componentRef.instance.left = Math.round((right - left) / 2 + left);
				this.componentRef.instance.top = Math.round(top - 10);
				break;
			case EReportScoreTooltipPosition.RIGHT:
				this.componentRef.instance.left = Math.round(right);
				this.componentRef.instance.top = Math.round(top + (bottom - top) / 2);
				break;
			case EReportScoreTooltipPosition.LEFT:
				this.componentRef.instance.left = Math.round(left);
				this.componentRef.instance.top = Math.round(top + (bottom - top) / 2);
				break;
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

	private destroy(): void {
		if (this.componentRef) {
			// No need to detach via ApplicationRef—destroy handles cleanup
			this.componentRef.destroy();
			this.componentRef = null;
		}
	}
}
