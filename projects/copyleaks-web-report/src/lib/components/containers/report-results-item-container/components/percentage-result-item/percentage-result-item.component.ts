import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ISourceMetadataSection, IStatistics } from '../../../../../models/report-data.models';
import { IResultItem } from '../models/report-result-item.models';
import { EMatchType } from './models/percentage-result-item.enum';
import { IPercentageResult } from './models/percentage-result-item.models';

@Component({
	selector: 'cr-percentage-result-item',
	templateUrl: './percentage-result-item.component.html',
	styleUrls: ['./percentage-result-item.component.scss'],
})
export class PercentageResultItemComponent implements OnInit, OnChanges {
	@Input() percentageResult: IPercentageResult;

	showPlagiarismPercentages: boolean = false;
	metadataSource: ISourceMetadataSection;
	iStatisticsResult: IStatistics;
	similarWords: number;
	eMatchType = EMatchType;

	constructor() {}

	get stackedBarHeight() {
		return this.percentageResult?.stackedBarHeight || '4px';
	}

	get stackedBarBackgroundColor() {
		return this.percentageResult?.stackedBarBackgroundColor || '#fbffff';
	}
	ngOnInit(): void {}

	ngOnChanges(changes: SimpleChanges): void {
		if ('percentageResult' in changes) {
			if (this.percentageResult?.resultItem) {
				this.metadataSource = this.percentageResult.resultItem.metadataSource;
				this.iStatisticsResult = this.percentageResult.resultItem.iStatisticsResult;
				this.similarWords =
					this.percentageResult.resultItem.iStatisticsResult.identical +
					this.percentageResult.resultItem.iStatisticsResult.minorChanges +
					this.percentageResult.resultItem.iStatisticsResult.relatedMeaning;
			}
		}
	}

	getMatchTypePercentage(eMatchType: EMatchType) {
		if (this.iStatisticsResult && this.metadataSource) {
			const result = this.metadataSource.words - this.metadataSource.excluded;
			switch (eMatchType) {
				case EMatchType.Identical: {
					return this.iStatisticsResult.identical / result;
				}
				case EMatchType.MinorChanges: {
					return this.iStatisticsResult.minorChanges / result;
				}
				case EMatchType.Paraphrased: {
					return this.iStatisticsResult.relatedMeaning / result;
				}
				case EMatchType.SimilarWords: {
					return this.similarWords / result;
				}
				case EMatchType.OmittedWords: {
					return this.metadataSource.excluded / this.metadataSource.words;
				}
				default: {
					return 0;
				}
			}
		}

		return 0;
	}
}
