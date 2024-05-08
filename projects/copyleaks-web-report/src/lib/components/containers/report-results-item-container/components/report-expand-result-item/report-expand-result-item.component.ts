import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { EPlatformType, EResultPreviewType } from '../../../../../enums/copyleaks-web-report.enums';
import { ReportViewService } from '../../../../../services/report-view.service';
import { IResultItem } from '../models/report-result-item.models';
import { IPercentageResult } from '../percentage-result-item/models/percentage-result-item.models';
import { ReportMatchHighlightService } from '../../../../../services/report-match-highlight.service';
import { DatePipe } from '@angular/common';

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

	constructor(
		public reportViewSvc: ReportViewService,
		private _highlightService: ReportMatchHighlightService,
		private _datePipe: DatePipe
	) {}

	ngOnInit(): void {
		this._updateResultTags();
	}

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

			this._updateResultTags();
		}
	}

	private _updateResultTags() {
		// Add the date tag to the tags list if available which includes the creation date, last modification date and publish date
		if (
			(this.resultItem?.resultPreview?.metadata?.creationDate ||
				this.resultItem?.resultPreview?.metadata?.lastModificationDate ||
				this.resultItem?.resultPreview?.metadata?.publishDate) &&
			!this.resultItem.resultPreview.tags.find(tag => tag.code === 'summary-date')
		) {
			const date =
				this.resultItem.resultPreview.metadata.creationDate ||
				this.resultItem.resultPreview.metadata.lastModificationDate ||
				this.resultItem.resultPreview.metadata.publishDate;
			this.resultItem.resultPreview.tags.push({
				title: this._datePipe.transform(date, 'MMM d, y, HH:mm:ss'),
				description: $localize`Published: ${
					this._datePipe.transform(this.resultItem.resultPreview.metadata.publishDate, "MMM d, y 'at' h:mm a") ||
					'not available'
				}.\n
            Created: ${
							this._datePipe.transform(this.resultItem.resultPreview.metadata.creationDate, "MMM d, y 'at' h:mm a") ||
							'not available'
						}.\n
            Last modification: ${
							this._datePipe.transform(
								this.resultItem.resultPreview.metadata.lastModificationDate,
								"MMM d, y 'at' h:mm a"
							) || 'not available'
						}.`,
				code: 'summary-date',
			});
		}

		// Add the organization name to the tags list if available
		if (!!this.resultItem?.resultPreview?.metadata?.organization) {
			if (!this.resultItem.resultPreview.tags) this.resultItem.resultPreview.tags = [];
			if (this.resultItem.resultPreview.tags.find(tag => tag.code === 'organization') === undefined)
				this.resultItem.resultPreview.tags.unshift({
					title: this.resultItem?.resultPreview?.metadata?.organization,
					description: $localize`Organization Name`,
					code: 'organization',
				});
		}

		// Add the 'Your File' tag to the start of the tags array if the result is a database result and has a scanId and the platofrm that runs the report is APP
		if (
			this.resultItem?.resultPreview?.scanId &&
			this.resultItem?.resultPreview?.type === EResultPreviewType.Database
		) {
			if (!this.resultItem.resultPreview.tags) this.resultItem.resultPreview.tags = [];
			// push 'Your File' tag to the start of tags array
			if (this.resultItem.resultPreview.tags.find(tag => tag.code === 'your-file') === undefined)
				this.resultItem.resultPreview.tags.unshift({
					title:
						this.reportViewSvc?.reportViewMode?.platformType === EPlatformType.APP
							? $localize`Your File`
							: $localize`Your Organization's File`,
					description:
						this.reportViewSvc?.reportViewMode?.platformType === EPlatformType.APP
							? $localize`This is your file`
							: $localize`This is uploaded by your organization`,
					code: 'your-file',
				});
		}

		if (this.resultItem?.resultPreview?.tags)
			this.resultItem.resultPreview.tags = this.resultItem.resultPreview.tags.filter(
				tag =>
					tag.description !== 'File Name' &&
					tag.description.toLowerCase() !== 'last modification date' &&
					tag.description.toLowerCase() !== 'submission date' &&
					tag.description.toLowerCase() !== 'publish date'
			);
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
