import { Component, Input, OnInit } from '@angular/core';
import { ILockResultItem } from './models/lock-result-item.models';

@Component({
	selector: 'cr-lock-result-item',
	templateUrl: './lock-result-item.component.html',
	styleUrls: ['./lock-result-item.component.scss'],
})
export class LockResultItemComponent implements OnInit {
	@Input() lockResultItem: ILockResultItem;

	constructor() {}
	ngOnInit(): void {}
}
