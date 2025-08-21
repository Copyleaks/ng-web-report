import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
	selector: 'cr-result-disclaimer',
	templateUrl: './cr-result-disclaimer.component.html',
	styleUrls: ['./cr-result-disclaimer.component.scss'],
	standalone: false,
})
export class CrResultDisclaimerComponent implements OnInit {
	@Output() onCloseDisclaimer: EventEmitter<any> = new EventEmitter<any>();

	constructor() {}

	ngOnInit(): void {}

	closeDisclaimer() {
		this.onCloseDisclaimer.emit(null);
	}
}

@Component({
	selector: 'cr-result-disclaimer-title',
	template: `
		<ng-content></ng-content>
	`,
	styleUrls: [],
	standalone: false,
})
export class CrResultDisclaimerTitleComponent implements OnInit {
	constructor() {}

	ngOnInit(): void {}
}

@Component({
	selector: 'cr-result-disclaimer-description',
	template: `
		<ng-content></ng-content>
	`,
	styleUrls: [],
	standalone: false,
})
export class CrResultDisclaimerDescriptionComponent implements OnInit {
	constructor() {}

	ngOnInit(): void {}
}
