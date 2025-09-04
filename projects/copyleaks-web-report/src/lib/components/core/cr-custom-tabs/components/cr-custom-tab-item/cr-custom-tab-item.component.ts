import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ReportViewService } from '../../../../../services/report-view.service';
import { untilDestroy } from '../../../../../utils/until-destroy';

@Component({
	selector: 'cr-custom-tab-item',
	templateUrl: './cr-custom-tab-item.component.html',
	styleUrls: ['./cr-custom-tab-item.component.scss'],
	standalone: false,
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
	isTabResultSectionContentNotEmpty: boolean;

	constructor(private _reportViewSvc: ReportViewService) {}

	ngOnInit(): void {
		this._reportViewSvc.selectedCustomTabContent$.pipe(untilDestroy(this)).subscribe(content => {
			this.selected = content === this.tabTemplateContent;
		});

		if (!!this.tabId)
			this._reportViewSvc.reportViewMode$.pipe(untilDestroy(this)).subscribe(data => {
				if (data.selectedCustomTabId !== this.tabId) return;
				this._reportViewSvc.selectedCustomTabContent$.next(this.tabTemplateContent);
				this.checkIfTabResultSectionContentNotEmpty();
				if (this.isTabResultSectionContentNotEmpty)
					this._reportViewSvc.selectedCustomTabResultSectionContent$.next(this.tabTemplateResultSectionContent);
				else this._reportViewSvc.selectedCustomTabResultSectionContent$.next(null);
			});
	}

	clickEvent() {
		if (
			this._reportViewSvc.reportViewMode.selectedCustomTabId === this.tabId &&
			this.tabId != undefined &&
			this.tabId != null
		)
			return;

		this._reportViewSvc.selectedCustomTabContent$.next(this.tabTemplateContent);
		this.checkIfTabResultSectionContentNotEmpty();
		if (this.isTabResultSectionContentNotEmpty)
			this._reportViewSvc.selectedCustomTabResultSectionContent$.next(this.tabTemplateResultSectionContent);
		else this._reportViewSvc.selectedCustomTabResultSectionContent$.next(null);
		this._reportViewSvc.reportViewMode$.next({
			...this._reportViewSvc.reportViewMode,
			selectedCustomTabId: this.tabId ?? 'tab-id',
			suspectId: null,
			alertCode: null,
		});
		this._reportViewSvc.selectedAlert$.next(null);
	}

	checkIfTabResultSectionContentNotEmpty() {
		// Create an embedded view to inspect the content
		const embeddedView = this.tabTemplateResultSectionContent.createEmbeddedView(null);
		// Check if the embedded view contains any nodes
		this.isTabResultSectionContentNotEmpty = embeddedView.rootNodes.length > 0;
		embeddedView.destroy();
	}

	ngOnDestroy(): void {}
}

@Component({
	selector: 'cr-custom-tab-item-title',
	template: `
		<ng-content></ng-content>
	`,
	styleUrls: ['./cr-custom-tab-item.component.scss'],
	standalone: false,
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
	standalone: false,
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
	standalone: false,
})
export class CrCustomTabItemResultSectionComponent implements OnInit {
	constructor() {}

	ngOnInit(): void {}
}
