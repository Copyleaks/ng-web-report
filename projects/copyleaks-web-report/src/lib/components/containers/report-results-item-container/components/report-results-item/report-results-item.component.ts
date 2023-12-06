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

	@Output() hiddenResultEvent = new EventEmitter<string>();
	@Output() showResultEvent = new EventEmitter<string>();

	percentageResult: IPercentageResult;
	previewResult: IResultPreviewBase;
	eResultPreviewType = EResultPreviewType;
	lockedResultItemTemplateRef: TemplateRef<IResultItem> | undefined;

	@HostListener('click', ['$event'])
	handleClick() {
		if (!this.resultItem || this.showLoader || !this.resultItem.resultDetails || this.excludeResult || this.isLocked)
			return;

		this._reportViewSvc.selectedResult$.next(this.resultItem.resultDetails);
		this._reportViewSvc.reportViewMode$.next({
			...this._reportViewSvc.reportViewMode,
			viewMode: 'one-to-one',
			suspectId: this.resultItem.resultPreview.id,
			sourcePageIndex: 1,
			suspectPageIndex: 1,
			alertCode: undefined,
		});
		this._reportViewSvc.selectedAlert$.next(null);
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

	constructor(private _reportViewSvc: ReportViewService, private _reportNgTemplatesSvc: ReportNgTemplatesService) {}

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
			this._reportNgTemplatesSvc.reportTemplatesSubject$.pipe(untilDestroy(this)).subscribe(refs => {
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

	ngOnDestroy(): void {}
}
