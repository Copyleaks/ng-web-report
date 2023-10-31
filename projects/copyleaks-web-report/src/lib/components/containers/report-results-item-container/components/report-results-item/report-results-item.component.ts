import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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
	@Input() showItemBody: boolean = true;
	@Input() excludeResult: boolean = false;
	@Input() isMobile: boolean = false;
	@Output() hiddenResultEvent = new EventEmitter<string>();
	@Output() showResultEvent = new EventEmitter<string>();

	percentageResult: IPercentageResult;
	previewResult: IResultPreviewBase;
	eResultPreviewType = EResultPreviewType;
	excludedResultsClick: boolean = false;

	@HostListener('click', ['$event'])
	handleClick() {
		if (!this.resultItem || this.showLoader || !this.resultItem.resultDetails) return;

		this._reportViewSvc.selectedResult$.next(this.resultItem.resultDetails);
		this._reportViewSvc.reportViewMode$.next({
			...this._reportViewSvc.reportViewMode,
			viewMode: 'one-to-one',
			suspectId: this.resultItem.resultPreview.id,
			sourcePageIndex: 1,
			suspectPageIndex: 1,
			alertCode: undefined,
		});
	}

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
			this.previewResult = this.resultItem.resultPreview;
			this.percentageResult = {
				resultItem: this.resultItem,
				showTooltip: true,
			};
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		if ('resultItem' in changes)
			if (this.resultItem) {
				this.previewResult = this.resultItem.resultPreview;
				this.percentageResult = {
					resultItem: this.resultItem,
					showTooltip: true,
				};
			}
	}

	showResultById() {
		this.showResultEvent.emit(this.previewResult.id);
		this.excludedResultsClick = true;
	}

	hiddenResultById() {
		this.hiddenResultEvent.emit(this.previewResult.id);
		this.excludedResultsClick = false;
	}

	comapreResult() {
		this._reportViewSvc.reportViewMode$.next({
			...this._reportViewSvc.reportViewMode,
			viewMode: 'one-to-one',
			sourcePageIndex: 1,
			suspectPageIndex: 1,
			suspectId: this.previewResult.id,
		});
	}

	visitResultSource() {
		if (!this.previewResult.url) return;
		window.open(this.previewResult.url, '_blank');
	}
}
