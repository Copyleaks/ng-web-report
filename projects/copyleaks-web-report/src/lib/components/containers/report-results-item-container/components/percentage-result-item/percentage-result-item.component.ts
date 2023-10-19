import { Component, Input, OnInit } from '@angular/core';
import { ISourceMetadataSection, IStatistics } from 'projects/copyleaks-web-report/src/lib/models/report-data.models';
import { IResultItem } from '../models/report-result-item.models';

@Component({
	selector: 'cr-percentage-result-item',
	templateUrl: './percentage-result-item.component.html',
	styleUrls: ['./percentage-result-item.component.scss'],
})
export class PercentageResultItemComponent implements OnInit {
	@Input() resultItem: IResultItem;
	@Input() showTooltip: boolean = false;
	showMorePercentage: boolean = false;
	metadataSource: ISourceMetadataSection;
	iStatisticsResult: IStatistics;
	similarWords: number;

	get identicalPercentage() {
		if (this.iStatisticsResult && this.metadataSource) {
			return this.iStatisticsResult.identical / (this.metadataSource.words - this.metadataSource.excluded);
		}
		return 0;
	}

	get minorChangesPercentage() {
		if (this.iStatisticsResult && this.metadataSource) {
			return this.iStatisticsResult.minorChanges / (this.metadataSource.words - this.metadataSource.excluded);
		}
		return 0;
	}

	get paraphrasedPercentage() {
		if (this.iStatisticsResult && this.metadataSource) {
			return this.iStatisticsResult.relatedMeaning / (this.metadataSource.words - this.metadataSource.excluded);
		}
		return 0;
	}

	get similarWordsPercentage() {
		if (this.iStatisticsResult && this.metadataSource) {
			return this.similarWords / (this.metadataSource.words - this.metadataSource.excluded);
		}
		return 0;
	}

	constructor() {}

	ngOnInit(): void {
		if (this.resultItem) {
			this.metadataSource = this.resultItem.metadataSource;
			this.iStatisticsResult = this.resultItem.iStatisticsResult;
			this.similarWords = this.resultItem.previewResult.matchedWords;
		}
	}
}
