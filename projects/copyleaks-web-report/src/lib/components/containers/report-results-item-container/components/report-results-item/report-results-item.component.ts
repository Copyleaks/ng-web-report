import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { EResultPreviewType } from 'projects/copyleaks-web-report/src/lib/enums/copyleaks-web-report.enums';
import { IResultPreviewBase } from 'projects/copyleaks-web-report/src/lib/models/report-data.models';
import { ReportViewService } from 'projects/copyleaks-web-report/src/lib/services/report-view.service';
import { IResultItem } from '../models/report-result-item.models';
import { IPercentageResult } from '../percentage-result-item/models/percentage-result-item.models';

@Component({
	selector: 'cr-report-results-item',
	templateUrl: './report-results-item.component.html',
	styleUrls: ['./report-results-item.component.scss'],
})
export class ReportResultsItemComponent implements OnInit, OnChanges {
	@Input() resultItem: IResultItem;
	@Input() showLoader: boolean = false;
	@Output() hiddenResultEvent = new EventEmitter<string>();

	percentageResult: IPercentageResult;
	previewResult: IResultPreviewBase;
	eResultPreviewType = EResultPreviewType;

	get authorName() {
		if (this.previewResult) {
			switch (this.previewResult.type) {
				case EResultPreviewType.Internet:
					return 'Internet Result';
				case EResultPreviewType.Database:
					return 'Internal Database Result';
				case EResultPreviewType.Batch:
					return 'Batch Result';
				case EResultPreviewType.Repositroy:
					return 'Repository Result';
				default:
					return '';
			}
		}
		return '';
	}
	constructor(private _reportViewSvc: ReportViewService) {}

	ngOnInit(): void {
		if (this.resultItem) {
			this.previewResult = this.resultItem.previewResult;
			this.percentageResult = {
				resultItem: this.resultItem,
				showTooltip: true,
			};
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		if ('resultItem' in changes)
			if (this.resultItem) {
				this.previewResult = this.resultItem.previewResult;
				this.percentageResult = {
					resultItem: this.resultItem,
					showTooltip: true,
				};
			}
	}

	hiddenResultById() {
		this.hiddenResultEvent.emit(this.previewResult.id);
	}

	comapreResult() {
		this._reportViewSvc.reportViewMode$.next({
			isHtmlView: true,
			viewMode: 'one-to-one',
			sourcePageIndex: 1,
			suspectId: this.previewResult.id,
		});
	}
}
