import {
	Component,
	EventEmitter,
	HostListener,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges,
	TemplateRef,
} from '@angular/core';
import { EResultPreviewType } from '../../../../../enums/copyleaks-web-report.enums';
import { IResultPreviewBase } from '../../../../../models/report-data.models';
import { ReportViewService } from '../../../../../services/report-view.service';
import { IResultItem } from '../models/report-result-item.models';
import { IPercentageResult } from '../percentage-result-item/models/percentage-result-item.models';
import { trigger, state, transition, animate, style } from '@angular/animations';
import { ReportNgTemplatesService } from '../../../../../services/report-ng-templates.service';
import { untilDestroy } from '../../../../../utils/until-destroy';
import { ReportDataService } from '../../../../../services/report-data.service';
import { MatDialog } from '@angular/material/dialog';
import { RemoveResultConfirmationDialogComponent } from '../../../../../dialogs/remove-result-confirmation-dialog/remove-result-confirmation-dialog.component';
import { IRemoveResultConfirmationDialogData } from '../../../../../dialogs/remove-result-confirmation-dialog/models/remove-result-confirmation-dialog.models';

@Component({
	selector: 'cr-report-results-item',
	templateUrl: './report-results-item.component.html',
	styleUrls: ['./report-results-item.component.scss'],
	animations: [
		trigger('fadeIn', [
			state('void', style({ opacity: 0 })),
			transition(':enter', [animate('0.5s ease-in', style({ opacity: 1 }))]),
		]),
	],
})
export class ReportResultsItemComponent implements OnInit, OnChanges, OnDestroy {
	@Input() resultItem: IResultItem;
	@Input() showLoader: boolean = false;
	@Input() showItemBody: boolean = true;
	@Input() excludeResult: boolean = false;
	@Input() isMobile: boolean = false;
	@Input() excludedResultsClick: boolean = false;
	@Input() reportViewSvc: ReportViewService;
	@Input() reportDataSvc: ReportDataService;
	@Input() reportNgTemplatesSvc: ReportNgTemplatesService;

	@Output() hiddenResultEvent = new EventEmitter<string>();
	@Output() showResultEvent = new EventEmitter<string>();

	percentageResult: IPercentageResult;
	previewResult: IResultPreviewBase;
	eResultPreviewType = EResultPreviewType;
	lockedResultItemTemplateRef: TemplateRef<IResultItem> | undefined;

	faviconExists: boolean = true;
	faviconURL: string;

	@HostListener('click', ['$event'])
	handleClick() {
		if (!this.resultItem || this.showLoader || !this.resultItem.resultDetails || this.excludeResult || this.isLocked)
			return;

		this.reportViewSvc?.selectedResult$.next(this.resultItem.resultDetails);
		this.reportViewSvc?.reportViewMode$.next({
			...this.reportViewSvc?.reportViewMode,
			viewMode: 'one-to-one',
			suspectId: this.resultItem.resultPreview.id,
			sourcePageIndex: 1,
			suspectPageIndex: 1,
			alertCode: undefined,
		});
		this.reportViewSvc?.selectedAlert$.next(null);
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

	get isLocked(): boolean {
		return !this.showLoader && (this.resultItem?.resultPreview?.isLocked ?? false);
	}

	constructor(private _matDialog: MatDialog) {}

	ngOnInit(): void {
		if (this.resultItem) {
			this.previewResult = this.resultItem.resultPreview;
			this.percentageResult = {
				resultItem: this.resultItem,
				showTooltip: true,
			};
		}

		if (this.resultItem?.resultPreview?.isLocked) {
			// check if custom locked result template was passed
			this.reportNgTemplatesSvc?.reportTemplatesSubject$.pipe(untilDestroy(this)).subscribe(refs => {
				if (refs?.lockedResultItemTemplateRef !== undefined)
					setTimeout(() => {
						this.lockedResultItemTemplateRef = refs?.lockedResultItemTemplateRef;
					});
			});
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

				if (this.resultItem.resultPreview.type === EResultPreviewType.Internet && this.resultItem?.resultPreview?.url) {
					const url = new URL(this.resultItem.resultPreview.url);
					this.faviconURL = url.host;
				}
			}
	}

	onFaviconError() {
		this.faviconExists = false;
	}

	onFaviconLoad() {
		this.faviconExists = true;
	}

	showResult() {
		this.showResultEvent.emit(this.previewResult.id);
		this.excludedResultsClick = true;
	}

	hideResult() {
		this.hiddenResultEvent.emit(this.previewResult.id);
		this.excludedResultsClick = false;
	}

	deleteResult() {
		this._matDialog.open(RemoveResultConfirmationDialogComponent, {
			maxWidth: '95%',
			minWidth: this.isMobile ? '95%' : '',
			width: this.isMobile ? '' : '670px',
			panelClass: 'filter-result-dailog',
			ariaLabel: $localize`Report Filter Options`,
			autoFocus: false,
			data: {
				isMobile: this.isMobile,
				reportDataSvc: this.reportDataSvc,
				deleteEndpoint: this.reportDataSvc?.reportEndpointConfig?.deleteResult,
				resultInfo: this.resultItem,
			} as IRemoveResultConfirmationDialogData,
		});
	}

	comapreResult() {
		this.reportViewSvc?.reportViewMode$.next({
			...this.reportViewSvc?.reportViewMode,
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

	ngOnDestroy(): void {}
}
