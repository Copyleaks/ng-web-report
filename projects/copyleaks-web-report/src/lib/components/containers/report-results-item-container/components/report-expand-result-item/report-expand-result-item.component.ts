import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EResultPreviewType } from 'projects/copyleaks-web-report/src/lib/enums/copyleaks-web-report.enums';
import { IResultItem } from '../models/report-result-item.models';
import { ReportViewService } from 'projects/copyleaks-web-report/src/lib/services/report-view.service';
import { IPercentageResult } from '../percentage-result-item/models/percentage-result-item.models';

@Component({
	selector: 'cr-report-expand-result-item',
	templateUrl: './report-expand-result-item.component.html',
	styleUrls: ['./report-expand-result-item.component.scss'],
})
export class ReportExpandResultItemComponent implements OnInit {
	@Input() resultItem: IResultItem;
	@Input() languageResult: string[] = ['Chips', 'Chips'];
	@Output() excludeResultEvent = new EventEmitter<string>();

	percentageResult: IPercentageResult;
	showMorePercentage: boolean = false;
	eResultPreviewType = EResultPreviewType;
	exclude: boolean = false;

	get authorName() {
		if (this.resultItem.previewResult) {
			switch (this.resultItem.previewResult.type) {
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
			this.percentageResult = {
				resultItem: this.resultItem,
				title: 'Plagiarism Detection',
				showArrowButton: true,
				stackedBarHeight: '8px',
				stackedBarBackgroundColor: '#EBF3F5',
			};
		}
	}

	clickBack() {
		this._reportViewSvc.reportViewMode$.next({
			isHtmlView: true,
			viewMode: 'one-to-many',
			sourcePageIndex: 1,
		});
	}

	excludeResult() {
		this.exclude = !this.exclude;
		this.excludeResultEvent.emit(this.resultItem.previewResult.id);
	}
}
