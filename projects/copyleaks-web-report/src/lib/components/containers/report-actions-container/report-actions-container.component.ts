import {
	AfterViewInit,
	Component,
	ElementRef,
	HostBinding,
	Input,
	OnDestroy,
	OnInit,
	TemplateRef,
	ViewChild,
} from '@angular/core';
import { ReportNgTemplatesService } from '../../../services/report-ng-templates.service';
import { untilDestroy } from '../../../utils/until-destroy';

@Component({
	selector: 'copyleaks-report-actions-container',
	templateUrl: './report-actions-container.component.html',
	styleUrls: ['./report-actions-container.component.scss'],
})
export class ReportActionsContainerComponent implements OnInit, AfterViewInit, OnDestroy {
	@HostBinding('style.display')
	display = 'flex';

	@HostBinding('style.flex-grow')
	flexGrowProp: number;

	@ViewChild('actionsContainer', { static: true }) actionsContainer: ElementRef;

	/**
	 * @Input {number} Flex grow property - flex-grow
	 */
	@Input() flexGrow: number;

	/**
	 * @Input {boolean} Flag indicating whether to show the loading view or not.
	 */
	@Input() showLoadingView = false;

	@Input() companyLogo: string = null;

	customActionsTemplateRef: TemplateRef<any>;
	customTemplateRefSub: any;

	constructor(private _reportNgTemplatesSvc: ReportNgTemplatesService) {}

	ngOnInit(): void {
		if (this.flexGrow !== undefined && this.flexGrow !== null) this.flexGrowProp = this.flexGrow;
	}

	ngAfterViewInit(): void {
		this._initCustomActionsTemplatesRefs();
	}

	/**
	 * Initializes the report custom actions with the reference which could be provided in the templates service.
	 * Also starts a subscription for the custom actions reference changes
	 */
	private _initCustomActionsTemplatesRefs() {
		// Read the report custom actions template reference if it is alredy provided.
		if (this._reportNgTemplatesSvc.reportTemplatesRefs?.customActionsTemplate)
			setTimeout(() => {
				this.customActionsTemplateRef = this._reportNgTemplatesSvc.reportTemplatesRefs
					?.customActionsTemplate as TemplateRef<any>;
			});

		// Starts a subscription for the custom actions reference changes
		this._reportNgTemplatesSvc.reportTemplatesSubject$.pipe(untilDestroy(this)).subscribe(refs => {
			if (refs?.customActionsTemplate !== undefined && this.customActionsTemplateRef == undefined)
				setTimeout(() => {
					this.customActionsTemplateRef = refs?.customActionsTemplate as TemplateRef<any>;
				});
		});
	}

	get showReportActions() {
		const containerDiv = this.actionsContainer?.nativeElement;
		return containerDiv?.children?.length > 0;
	}

	ngOnDestroy(): void {}
}
