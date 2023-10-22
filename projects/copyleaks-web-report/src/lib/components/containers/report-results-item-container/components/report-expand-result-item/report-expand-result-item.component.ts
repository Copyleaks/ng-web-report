import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { EResultPreviewType } from 'projects/copyleaks-web-report/src/lib/enums/copyleaks-web-report.enums';
import { ReportViewService } from 'projects/copyleaks-web-report/src/lib/services/report-view.service';
import { IResultItem } from '../models/report-result-item.models';
import { IPercentageResult } from '../percentage-result-item/models/percentage-result-item.models';

@Component({
	selector: 'cr-report-expand-result-item',
	templateUrl: './report-expand-result-item.component.html',
	styleUrls: ['./report-expand-result-item.component.scss'],
})
export class ReportExpandResultItemComponent implements OnInit, OnChanges {
	@Input() resultItem: IResultItem | null = null;
	@Input() languageResult: string[] = [];
	@Output() excludeResultEvent = new EventEmitter<string>();

	percentageResult: IPercentageResult;
	showMorePercentage: boolean = false;
	eResultPreviewType = EResultPreviewType;
	exclude: boolean = false;

	get authorName() {
		if (this.resultItem?.resultPreview) {
			switch (this.resultItem?.resultPreview.type) {
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

	ngOnInit(): void {}

	ngOnChanges(changes: SimpleChanges): void {
		if ('resultItem' in changes && changes['resultItem'].currentValue) {
			this.percentageResult = {
				resultItem: changes['resultItem'].currentValue,
				title: 'Plagiarism Detection',
				showArrowButton: true,
				stackedBarHeight: '8px',
				stackedBarBackgroundColor: '#EBF3F5',
			};
		}
	}

	clickBack() {
		this._reportViewSvc.reportViewMode$.next({
			...this._reportViewSvc.reportViewMode,
			viewMode: 'one-to-many',
			suspectId: undefined,
		});
	}

	excludeResult() {
		this.exclude = !this.exclude;
		this.excludeResultEvent.emit(this.resultItem?.resultPreview.id);
	}
}
