import { Component, Input, OnInit } from '@angular/core';
import { EFilterResultForm } from '../../models/filter-result-dailog.enum';
import { FilterResultDailogService } from '../../services/filter-result-dailog.service';

@Component({
	selector: 'cr-general-filter-result',
	templateUrl: './general-filter-result.component.html',
	styleUrls: ['./general-filter-result.component.scss'],
	standalone: false,
})
export class GeneralFilterResultComponent implements OnInit {
	/**
	 * @Input {number} Total number of alerts related to the report or content
	 */
	@Input() totalAlerts: number = 0;

	/**
	 * @Input {number} Total number of results detected from the same author
	 */
	@Input() totalSameAuthor: number = 0;

	eFilterResultForm = EFilterResultForm;

	SHOW_ONLY_TOP = $localize`Show only the top 100 results`;
	ALERTS = $localize`Alerts`;
	SAME_AUTH_SUB = $localize`Same author submissions`;

	constructor(public filterService: FilterResultDailogService) {}
	ngOnInit() {}
}
