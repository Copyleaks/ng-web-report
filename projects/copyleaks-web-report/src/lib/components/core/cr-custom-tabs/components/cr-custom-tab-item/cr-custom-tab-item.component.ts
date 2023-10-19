import { Component, HostBinding, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';

@Component({
	selector: 'cr-custom-tab-item',
	templateUrl: './cr-custom-tab-item.component.html',
	styleUrls: ['./cr-custom-tab-item.component.scss'],
})
export class CrCustomTabItemComponent implements OnInit {
	@ViewChild('tabTemplate', { static: true }) tabTemplate: TemplateRef<any>;

	/**
	 * @Input Flex grow property - flex-grow
	 */
	@Input() flexGrow: number;

	constructor() {}

	ngOnInit(): void {}

	clickEvent() {}
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
