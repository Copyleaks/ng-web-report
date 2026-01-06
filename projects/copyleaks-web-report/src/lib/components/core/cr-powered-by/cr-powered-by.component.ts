import { Component, HostListener, OnInit } from '@angular/core';

@Component({
	selector: 'cr-powered-by',
	templateUrl: './cr-powered-by.component.html',
	styleUrls: ['./cr-powered-by.component.scss'],
	standalone: false,
})
export class CrPoweredByComponent implements OnInit {
	@HostListener('click', ['$event'])
	handleClick() {
		window.open('https://copyleaks.com', '_blank');
	}

	constructor() {}

	ngOnInit(): void {}
}
