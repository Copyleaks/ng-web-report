import { Component, Input, OnInit } from '@angular/core';
import { IResultsActions } from './models/results-actions.models';

@Component({
	selector: 'cr-results-actions',
	templateUrl: './results-actions.component.html',
	styleUrls: ['./results-actions.component.scss'],
})
export class ResultsActionsComponent implements OnInit {
	@Input() resultsActions: IResultsActions | null;

	showSearchFiled: boolean = false;
	constructor() {}

	ngOnInit(): void {}

	showSearch() {
		this.showSearchFiled = !this.showSearchFiled;
	}

	startSearch() {}

	showFilterDialog() {}
}
