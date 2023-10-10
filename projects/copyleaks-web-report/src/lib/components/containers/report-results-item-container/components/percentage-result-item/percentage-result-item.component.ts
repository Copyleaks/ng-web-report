import { Component, Input, OnInit } from '@angular/core';
import { IMatchType } from '../models/report-result-item.models';
import { ISourceMetadataSection, IStatistics } from 'projects/copyleaks-web-report/src/lib/models/report-data.models';

@Component({
	selector: 'cr-percentage-result-item',
	templateUrl: './percentage-result-item.component.html',
	styleUrls: ['./percentage-result-item.component.scss'],
})
export class PercentageResultItemComponent implements OnInit {
	@Input() metadataSource: ISourceMetadataSection = {
		words: 250,
		excluded: 25,
	};

	@Input() iStatisticsResult: IStatistics = {
		identical: 88,
		minorChanges: 2,
		relatedMeaning: 2,
	};

	@Input() similarWords: number = 80;

	identicalPercentage: number = 0;
	minorChangesPercentage: number = 0;
	paraphrasedPercentage: number = 0;
	similarWordsPercentage: number = 0;
	constructor() {}

	ngOnInit(): void {
		if (this.iStatisticsResult && this.metadataSource) {
			this.identicalPercentage =
				this.iStatisticsResult.identical / (this.metadataSource.words - this.metadataSource.excluded);
			this.minorChangesPercentage =
				this.iStatisticsResult.minorChanges / (this.metadataSource.words - this.metadataSource.excluded);
			this.paraphrasedPercentage =
				this.iStatisticsResult.relatedMeaning / (this.metadataSource.words - this.metadataSource.excluded);
			this.similarWordsPercentage = this.similarWords / (this.metadataSource.words - this.metadataSource.excluded);
		}
	}
}
