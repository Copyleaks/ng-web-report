import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FilterResultDailogService } from '../../services/filter-result-dailog.service';
import { EFilterResultForm } from '../../models/filter-result-dailog.enum';

@Component({
	selector: 'cr-match-type-filter-result',
	templateUrl: './match-type-filter-result.component.html',
	styleUrls: ['./match-type-filter-result.component.scss'],
})
export class MatchTypeFilterResultComponent implements OnInit {
	@Input() identicalTotal: number = 0;
	@Input() minorChangesTotal: number = 0;
	@Input() paraphrasedTotal: number = 0;

	matchTypeForm: FormGroup;
	eFilterResultForm = EFilterResultForm;
	constructor(private filterService: FilterResultDailogService) {}
	ngOnInit() {
		this.matchTypeForm = this.filterService.matchTypeFormGroup;
	}
}
