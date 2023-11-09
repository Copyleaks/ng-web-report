import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FilterResultDailogService } from '../../services/filter-result-dailog.service';
import { EFilterResultForm } from '../../models/filter-result-dailog.enum';

@Component({
	selector: 'cr-general-filter-result',
	templateUrl: './general-filter-result.component.html',
	styleUrls: ['./general-filter-result.component.scss'],
})
export class GeneralFilterResultComponent implements OnInit {
	@Input() totalAlerts: number = 0;
	@Input() totalSameAuthor: number = 0;

	eFilterResultForm = EFilterResultForm;

	constructor(public filterService: FilterResultDailogService) {}
	ngOnInit() {}
}
