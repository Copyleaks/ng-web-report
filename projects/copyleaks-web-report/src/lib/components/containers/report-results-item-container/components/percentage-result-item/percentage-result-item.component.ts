import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ISourceMetadataSection, IStatistics } from '../../../../../models/report-data.models';
import { EMatchType } from './models/percentage-result-item.enum';
import { IPercentageResult } from './models/percentage-result-item.models';
import { ReportDataService } from '../../../../../services/report-data.service';
import { ReportViewService } from '../../../../../services/report-view.service';
import { untilDestroy } from '../../../../../utils/until-destroy';

@Component({
	selector: 'cr-percentage-result-item',
	templateUrl: './percentage-result-item.component.html',
	styleUrls: ['./percentage-result-item.component.scss'],
})
export class PercentageResultItemComponent implements OnInit, OnChanges {
	@Input() percentageResult: IPercentageResult;
	@Input() reportDataSvc: ReportDataService;
	@Input() reportViewService: ReportViewService;
	@Input() excludeResult: boolean = false;

	showPlagiarismPercentages: boolean = false;
	metadataSource: ISourceMetadataSection;
	iStatisticsResult: IStatistics;
	similarWords: number;
	eMatchType = EMatchType;

	PERCENTAGE_BTN_EXPEND_TOOLTIP = $localize`Expand`;
	PERCENTAGE_BTN_COLLAPSE_TOOLTIP = $localize`Collapse`;
	docDirection: 'ltr' | 'rtl';

	constructor() {}

	get stackedBarHeight() {
		return this.percentageResult?.stackedBarHeight || '8px';
	}

	get stackedBarBackgroundColor() {
		return this.percentageResult?.stackedBarBackgroundColor || '#fbffff';
	}
	ngOnInit(): void {
		if (this.reportViewService)
			this.reportViewService.documentDirection$.pipe(untilDestroy(this)).subscribe(dir => {
				this.docDirection = dir;
			});
	}

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

	ngOnDestroy(): void {}
}
