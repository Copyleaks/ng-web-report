import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'cr-mat-slide-filter-result',
	templateUrl: './mat-slide-filter-result.component.html',
	styleUrls: ['./mat-slide-filter-result.component.scss'],
})
export class MatSlideFilterResultComponent implements OnInit {
	constructor() {}
	@Input() title: string;
	ngOnInit(): void {}
}

@Component({
	selector: 'mat-slide-logo',
	template: '<ng-content></ng-content>',
})
export class MatSlideLogoFilterResultComponent {}
