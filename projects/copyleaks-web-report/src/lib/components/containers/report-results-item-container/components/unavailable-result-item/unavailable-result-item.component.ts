import { Component, Input, OnInit } from '@angular/core';
import { IUnavailableResultItem } from './models/unavailable-result-item.models';

@Component({
	selector: 'cr-unavailable-result-item',
	templateUrl: './unavailable-result-item.component.html',
	styleUrls: ['./unavailable-result-item.component.scss'],
})
export class UnavailableResultItemComponent implements OnInit {
	@Input() resultItem: IUnavailableResultItem;

	constructor() {}
	ngOnInit(): void {}
}
