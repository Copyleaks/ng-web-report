import { Component, Input, OnInit } from '@angular/core';
import { EFilterResultForm } from '../../models/filter-result-dailog.enum';
import { FilterResultDailogService } from '../../services/filter-result-dailog.service';

@Component({
	selector: 'cr-match-type-filter-result',
	templateUrl: './match-type-filter-result.component.html',
	styleUrls: ['./match-type-filter-result.component.scss'],
	standalone: false,
})
export class MatchTypeFilterResultComponent implements OnInit {
	/**
	 * @Input {number} Total number of results identified as identical matches
	 */
	@Input() identicalTotal: number = 0;

	/**
	 * @Input {number} Total number of results with minor changes from the original content
	 */
	@Input() minorChangesTotal: number = 0;

	/**
	 * @Input {number} Total number of results identified as paraphrased content
	 */
	@Input() paraphrasedTotal: number = 0;

	eFilterResultForm = EFilterResultForm;

	IDENTICAL_TEXT = $localize`Identical Text`;
	MINOR_CHANGES = $localize`Minor Changes`;
	PARAPHRASED = $localize`Paraphrased`;
	constructor(public filterService: FilterResultDailogService) {}
	ngOnInit() {}
}
