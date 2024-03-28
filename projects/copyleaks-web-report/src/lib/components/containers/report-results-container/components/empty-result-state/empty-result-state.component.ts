import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'cr-empty-result-state',
	templateUrl: './empty-result-state.component.html',
	styleUrls: ['./empty-result-state.component.scss'],
})
export class EmptyResultStateComponent implements OnInit {
	@Input() message: string;

	constructor() {}

	ngOnInit(): void {}
}
