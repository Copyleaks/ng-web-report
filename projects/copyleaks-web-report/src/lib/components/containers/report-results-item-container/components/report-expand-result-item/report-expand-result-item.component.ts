import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { EResultPreviewType } from '../../../../../enums/copyleaks-web-report.enums';
import { ReportViewService } from '../../../../../services/report-view.service';
import { IResultItem } from '../models/report-result-item.models';
import { IPercentageResult } from '../percentage-result-item/models/percentage-result-item.models';
import { ReportMatchHighlightService } from '../../../../../services/report-match-highlight.service';

@Component({
	selector: 'cr-report-expand-result-item',
	templateUrl: './report-expand-result-item.component.html',
	styleUrls: ['./report-expand-result-item.component.scss'],
})
export class ReportExpandResultItemComponent implements OnInit, OnChanges {
	@Input() resultItem: IResultItem | null = null;
	/**
	 * @Input {boolean} Flag indicating whether to show the loading view or not.
	 */
	@Input() showLoadingView = false;

	@Output() excludeResultEvent = new EventEmitter<string>();

	percentageResult: IPercentageResult;
	showMorePercentage: boolean = false;
	eResultPreviewType = EResultPreviewType;
	exclude: boolean = false;

	faviconExists: boolean = true;
	faviconURL: string;

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

	EXCLUDE_RESULT_TOOLTIP = $localize`Exclude result`;
	INCLUDE_RESULT_TOOLTIP = $localize`Include result`;

	constructor(public reportViewSvc: ReportViewService, private _highlightService: ReportMatchHighlightService) {}

	ngOnInit(): void {}

	ngOnChanges(changes: SimpleChanges): void {
		if ('resultItem' in changes && changes['resultItem'].currentValue) {
			this.percentageResult = {
				resultItem: changes['resultItem'].currentValue,
				title: $localize`Plagiarism Detection`,
				showArrowButton: true,
				stackedBarHeight: '8px',
				stackedBarBackgroundColor: '#EBF3F5',
			};

			if (
				changes['resultItem'].currentValue.resultPreview?.type === EResultPreviewType.Internet &&
				changes['resultItem'].currentValue.resultPreview?.url
			) {
				const url = new URL(changes['resultItem'].currentValue.resultPreview.url);
				this.faviconURL = url.host;
			}
		}
	}

	clickBack() {
		this.reportViewSvc.reportViewMode$.next({
			...this.reportViewSvc.reportViewMode,
			viewMode: 'one-to-many',
			suspectId: undefined,
			sourcePageIndex: 1,
			suspectPageIndex: 1,
			alertCode: undefined,
		});

		this.reportViewSvc.selectedAlert$.next(null);

		this._highlightService.clear();
	}

	excludeResult() {
		this.exclude = !this.exclude;
		this.excludeResultEvent.emit(this.resultItem?.resultPreview.id);
	}

	onFaviconError() {
		this.faviconExists = false;
	}

	onFaviconLoad() {
		this.faviconExists = true;
	}
}
