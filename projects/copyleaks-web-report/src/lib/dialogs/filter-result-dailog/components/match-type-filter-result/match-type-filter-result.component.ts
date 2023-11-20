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

	eFilterResultForm = EFilterResultForm;

	IDENTICAL_TEXT = $localize`Identical Text`;
	MINOR_CHANGES = $localize`Minor Changes`;
	PARAPHRASED = $localize`Paraphrased`;
	constructor(public filterService: FilterResultDailogService) {}
	ngOnInit() {}
}
