import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	ContentChild,
	HostBinding,
	Input,
	OnDestroy,
	OnInit,
	TemplateRef,
} from '@angular/core';
import { ReportNgTemplatesService } from '../../../services/report-ng-templates.service';

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

	@Input() flexGrow: number;

	customActionsTemplateRef: TemplateRef<any>;
	sub: any;

	constructor(private _reportNgTemplatesSvc: ReportNgTemplatesService, private cdr: ChangeDetectorRef) {}

	ngOnInit(): void {
		if (this.flexGrow !== undefined && this.flexGrow !== null) this.flexGrowProp = this.flexGrow;
	}

	ngAfterViewInit(): void {
		this._initCustomActionsTemplatesRefs();
	}

	private _initCustomActionsTemplatesRefs() {
		this.sub = this._reportNgTemplatesSvc.reportTemplatesSubject$.subscribe(refs => {
			if (refs?.customActionsTemplate !== undefined && this.customActionsTemplateRef == undefined) {
				this.customActionsTemplateRef = refs?.customActionsTemplate as TemplateRef<any>;
				this.cdr.detectChanges();
			}
		});
	}

	hideReportActions() {
		this.display = 'none';
	}

	ngOnDestroy(): void {
		this.sub?.unsubscribe();
	}
}
