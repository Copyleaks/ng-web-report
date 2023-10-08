import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'cr-results-actions',
	templateUrl: './results-actions.component.html',
	styleUrls: ['./results-actions.component.scss'],
})
export class ResultsActionsComponent implements OnInit {
	@Input() totalResults: string;
	@Input() totalExcluded: string;
	@Input() totalFiltered: string;

	showSearchFiled: boolean;
	constructor() {}

	ngOnInit(): void {}

	showSearch() {
		this.showSearchFiled = !this.showSearchFiled;
	}

	startSearch() {}

	showFilterDialog() {}
}
