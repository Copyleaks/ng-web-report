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

	/**
	 * @Input Flex grow property - flex-grow
	 */
	@Input() flexGrow: number;

	selected: boolean = false;

	constructor(private _reportViewSvc: ReportViewService) {}

	ngOnInit(): void {
		this._reportViewSvc.selectedCustomTabContent$.pipe(untilDestroy(this)).subscribe(content => {
			this.selected = content === this.tabTemplateContent;
		});
	}

	clickEvent() {
		this._reportViewSvc.selectedCustomTabContent$.next(this.tabTemplateContent);
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
