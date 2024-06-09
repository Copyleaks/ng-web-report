import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ReportViewService } from '../../../../../services/report-view.service';
import { untilDestroy } from '../../../../../utils/until-destroy';

@Component({
	selector: 'cr-custom-tab-item',
	templateUrl: './cr-custom-tab-item.component.html',
	styleUrls: ['./cr-custom-tab-item.component.scss'],
})
export class CrCustomTabItemComponent implements OnInit {
	@ViewChild('tabTemplateTitle', { static: true }) tabTemplateTitle: TemplateRef<any>;
	@ViewChild('tabTemplateContent', { static: true }) tabTemplateContent: TemplateRef<any>;
	@ViewChild('tabTemplateResultSectionContent', { static: true }) tabTemplateResultSectionContent: TemplateRef<any>;

	/**
	 * @Input Flex grow property - flex-grow
	 */
	@Input() flexGrow: number;

	/**
	 * @Input Flex grow property - flex-grow
	 */
	@Input() tabId: string;

	selected: boolean = false;

	constructor(private _reportViewSvc: ReportViewService) {}

	ngOnInit(): void {
		this._reportViewSvc.selectedCustomTabContent$.pipe(untilDestroy(this)).subscribe(content => {
			this.selected = content === this.tabTemplateContent;
		});

		if (!!this.tabId)
			this._reportViewSvc.reportViewMode$.pipe(untilDestroy(this)).subscribe(data => {
				if (data.selectedCustomTabId !== this.tabId) return;
				this._reportViewSvc.selectedCustomTabContent$.next(this.tabTemplateContent);
				this._reportViewSvc.selectedCustomTabResultSectionContent$.next(this.tabTemplateResultSectionContent);
			});
	}

	clickEvent() {
		this._reportViewSvc.selectedCustomTabContent$.next(this.tabTemplateContent);
		this._reportViewSvc.selectedCustomTabResultSectionContent$.next(this.tabTemplateResultSectionContent);
		this._reportViewSvc.reportViewMode$.next({
			...this._reportViewSvc.reportViewMode,
			selectedCustomTabId: this.tabId,
			suspectId: null,
			alertCode: null,
		});
	}

	ngOnDestroy(): void {}
}

@Component({
	selector: 'cr-custom-tab-item-title',
	template: `
		<ng-content></ng-content>
	`,
	styleUrls: ['./cr-custom-tab-item.component.scss'],
})
export class CrCustomTabItemTitleComponent implements OnInit {
	constructor() {}

	ngOnInit(): void {}
}

@Component({
	selector: 'cr-custom-tab-item-content',
	template: `
		<ng-content></ng-content>
	`,
	styleUrls: ['./cr-custom-tab-item.component.scss'],
})
export class CrCustomTabItemContentComponent implements OnInit {
	constructor() {}

	ngOnInit(): void {}
}

@Component({
	selector: 'cr-custom-tab-item-result-section-content',
	template: `
		<ng-content></ng-content>
	`,
	styleUrls: ['./cr-custom-tab-item.component.scss'],
})
export class CrCustomTabItemResultSectionComponent implements OnInit {
	constructor() {}

	ngOnInit(): void {}
}
