import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'cr-author-alert-card',
	templateUrl: './author-alert-card.component.html',
	styleUrls: ['./author-alert-card.component.scss'],
})
export class AuthorAlertCardComponent implements OnInit {
	@Input() authorAlertMessage: string;
	@Input() authorAlertTitle: string;
	constructor() {}

	ngOnInit(): void {}
}
