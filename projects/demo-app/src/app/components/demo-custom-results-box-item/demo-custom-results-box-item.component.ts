import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IDemoCustomResultsBoxItem } from './models/demo-custom-results-box-item.models';

@Component({
	selector: 'demo-custom-results-box-item',
	templateUrl: './demo-custom-results-box-item.component.html',
	styleUrls: ['./demo-custom-results-box-item.component.scss'],
})
export class DemoCustomResultsBoxItemComponent implements OnInit {
	@Input() lockResultItem: IDemoCustomResultsBoxItem;
	@Output() OnButtonClick = new EventEmitter();

	constructor() {}
	ngOnInit(): void {}
}
