import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'cr-spinner',
	templateUrl: './cr-spinner.component.html',
	styleUrls: ['./cr-spinner.component.scss'],
})
export class CrSpinnerComponent implements OnInit {
	/**
	 * The spinner size
	 * this will be the width/height of the spinner
	 * @type {string}
	 * @Input
	 */
	@Input() size = '100px';

	/**
	 * The spinner color
	 * @type {string}
	 * @Input
	 */
	@Input() color = '#17a1ff';

	constructor() {}

	ngOnInit() {}
}
