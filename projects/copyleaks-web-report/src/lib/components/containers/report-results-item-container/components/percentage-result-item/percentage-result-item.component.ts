import { Component, OnInit } from '@angular/core';
import { IMatchType } from '../models/report-result-item.models';

@Component({
	selector: 'cr-percentage-result-item',
	templateUrl: './percentage-result-item.component.html',
	styleUrls: ['./percentage-result-item.component.scss'],
})
export class PercentageResultItemComponent implements OnInit {
	matchTypeList: IMatchType[] = [
		{
			name: 'identical',
			percentageMatch: 88,
		},
		{
			name: 'minorChanges',
			percentageMatch: 2,
		},
		{
			name: 'paraphrased',
			percentageMatch: 2,
		},
	];
	identicalResult: number = 88;
	minorChangesResult: number = 2;
	paraphrasedResult: number = 2;
	matchedWords: number = 80;
	constructor() {}

	ngOnInit(): void {}
}
