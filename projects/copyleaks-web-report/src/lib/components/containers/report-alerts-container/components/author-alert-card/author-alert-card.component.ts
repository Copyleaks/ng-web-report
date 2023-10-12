import { Component, Input, OnInit } from '@angular/core';
import { IAuthorAlertCard } from './models/author-alert-card.models';

@Component({
	selector: 'cr-author-alert-card',
	templateUrl: './author-alert-card.component.html',
	styleUrls: ['./author-alert-card.component.scss'],
})
export class AuthorAlertCardComponent implements OnInit {
	@Input() authorAlert: IAuthorAlertCard;
	constructor() {}

	ngOnInit(): void {}
}
