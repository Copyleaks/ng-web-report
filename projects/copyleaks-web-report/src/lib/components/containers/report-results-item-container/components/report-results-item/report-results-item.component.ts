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
	ViewChild,
} from '@angular/core';
import { EPlatformType, EResultPreviewType } from '../../../../../enums/copyleaks-web-report.enums';
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
import { ReportMatchHighlightService } from '../../../../../services/report-match-highlight.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { DatePipe } from '@angular/common';
import { RESULT_TAGS_CODES } from '../../../../../constants/report-result-tags.constants';

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
	@ViewChild(MatMenuTrigger) public resultItemMenuTrigger: MatMenuTrigger;

	@Input() resultItem: IResultItem;
	@Input() showLoader: boolean = false;
	@Input() showItemBody: boolean = true;
	@Input() excludeView: boolean = false;
	@Input() isResultExcluded: boolean = false;
	@Input() isMobile: boolean = false;
	@Input() reportViewSvc: ReportViewService;
	@Input() reportDataSvc: ReportDataService;
	@Input() highlightService: ReportMatchHighlightService;
	@Input() reportNgTemplatesSvc: ReportNgTemplatesService;

	@Output() hiddenResultEvent = new EventEmitter<string>();
	@Output() showResultEvent = new EventEmitter<string>();

	percentageResult: IPercentageResult;
	previewResult: IResultPreviewBase;
	eResultPreviewType = EResultPreviewType;
	lockedResultItemTemplateRef: TemplateRef<IResultItem> | undefined;

	faviconExists: boolean = true;
	faviconURL: string;
	platformType: EPlatformType;
	copyMessage: string;
	docDirection: 'ltr' | 'rtl';

	RESULT_TAGS_CODES = RESULT_TAGS_CODES;

	@HostListener('click', ['$event'])
	handleClick() {
		if (!this.resultItem || this.showLoader || !this.resultItem.resultDetails || this.excludeView || this.isLocked)
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

	get isOwner(): boolean {
		return !!this.previewResult?.scanId;
	}

	get authorName() {
		if (
			this.previewResult?.metadata?.author &&
			!(this.previewResult?.scanId && this.resultItem?.resultPreview?.type === EResultPreviewType.Database)
		)
			return this.previewResult.metadata?.author;

		return null;
	}

	get resultType() {
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

	get firstTag() {
		if (!this.resultItem?.resultPreview?.tags || this.resultItem?.resultPreview?.tags.length === 0) return null;

		// Check if there is a tag in the tags list with the code 'ai-source-match' and return the first tag that is not the 'ai-source-match' tag
		const aiSourceMatchTag = this.resultItem?.resultPreview?.tags.find(
			tag => tag.code === RESULT_TAGS_CODES.AI_SOURCE_MATCH
		);
		if (aiSourceMatchTag) return aiSourceMatchTag;

		return this.resultItem.resultPreview.tags[0];
	}

	get numberOfTags() {
		return this.previewResult?.tags?.length ?? 0;
	}

	constructor(private _matDialog: MatDialog, private _datePipe: DatePipe) {}

	ngOnInit(): void {
		if (this.resultItem) {
			this.previewResult = this.resultItem.resultPreview;

			this._updateResultTags();

			this.percentageResult = {
				resultItem: this.resultItem,
				showTooltip: true,
			};
		}

		// check if custom locked result template was passed
		this.reportNgTemplatesSvc?.reportTemplatesSubject$.pipe(untilDestroy(this)).subscribe(refs => {
			if (refs?.lockedResultItemTemplateRef !== undefined)
				setTimeout(() => {
					this.lockedResultItemTemplateRef = refs?.lockedResultItemTemplateRef;
				});
		});

		if (this.reportViewSvc)
			this.reportViewSvc.documentDirection$.pipe(untilDestroy(this)).subscribe(dir => {
				this.docDirection = dir;
			});
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

				// Add the organization name to the tags list if available
				this._updateResultTags();
			}
	}

	private _updateResultTags() {
		// Add the date tag to the tags list if available which includes the creation date, last modification date and publish date
		if (
			(this.previewResult?.metadata?.creationDate ||
				this.previewResult?.metadata?.lastModificationDate ||
				this.previewResult?.metadata?.publishDate ||
				this.previewResult?.metadata?.submissionDate) &&
			!this.previewResult?.tags?.find(tag => tag.code === RESULT_TAGS_CODES.SUMMARY_DATE)
		) {
			const date =
				this.previewResult.metadata.creationDate ||
				this.previewResult.metadata.lastModificationDate ||
				this.previewResult.metadata.publishDate ||
				this.previewResult.metadata.submissionDate;
			this.previewResult?.tags?.unshift({
				title: this._datePipe.transform(date, 'MMM d, y, HH:mm:ss'),
				description: $localize`Published: ${
					this._datePipe.transform(this.previewResult.metadata.publishDate, "MMM d, y 'at' h:mm a") || 'not available'
				}.\nCreated: ${
					this._datePipe.transform(this.previewResult.metadata.creationDate, "MMM d, y 'at' h:mm a") || 'not available'
				}.\nLast modification: ${
					this._datePipe.transform(this.previewResult.metadata.lastModificationDate, "MMM d, y 'at' h:mm a") ||
					'not available'
				}.\nSubmission Date: ${
					this._datePipe.transform(this.previewResult.metadata.submissionDate, "MMM d, y 'at' h:mm a") ||
					'not available'
				}.`,
				code: RESULT_TAGS_CODES.SUMMARY_DATE,
			});
		}

		if (!!this.resultItem?.resultPreview?.metadata?.organization) {
			if (!this.previewResult.tags) this.previewResult.tags = [];
			if (this.previewResult.tags.find(tag => tag.code === RESULT_TAGS_CODES.ORGANIZATION) === undefined)
				this.previewResult?.tags?.unshift({
					title: this.resultItem?.resultPreview?.metadata?.organization,
					description: $localize`Organization Name`,
					code: RESULT_TAGS_CODES.ORGANIZATION,
				});
		}

		// Add the 'Your File' tag to the start of the tags array if the result is a database result and has a scanId and the platofrm that runs the report is APP
		if (
			this.resultItem?.resultPreview?.scanId &&
			this.resultItem?.resultPreview?.type === EResultPreviewType.Database
		) {
			if (!this.previewResult.tags) this.previewResult.tags = [];
			// push 'Your File' tag to the start of tags array
			if (this.previewResult.tags.find(tag => tag.code === RESULT_TAGS_CODES.YOUR_FILE) === undefined)
				this.previewResult?.tags?.unshift({
					title:
						this.reportViewSvc?.reportViewMode?.platformType === EPlatformType.APP
							? $localize`Your File`
							: $localize`Your Organization's File`,
					description:
						this.reportViewSvc?.reportViewMode?.platformType === EPlatformType.APP
							? $localize`This is your file`
							: $localize`This is uploaded by your organization`,
					code: RESULT_TAGS_CODES.YOUR_FILE,
				});
		}

		if (this.previewResult.tags)
			this.previewResult.tags = this.previewResult.tags.filter(
				tag =>
					tag.description !== 'File Name' &&
					tag.description.toLowerCase() !== 'last modification date' &&
					tag.description.toLowerCase() !== 'submission date' &&
					tag.description.toLowerCase() !== 'publish date'
			);

		// remove empty tags from the tags list
		if (this.previewResult?.tags)
			this.previewResult.tags = this.previewResult.tags.filter(tag => tag.title && tag.title.trim() !== '');

		// Check if there is a tag in the tags list with the code 'ai-source-match' and put it in the first place
		const aiSourceMatchTag = this.previewResult?.tags?.find(tag => tag.code === RESULT_TAGS_CODES.AI_SOURCE_MATCH);
		if (this.reportViewSvc.reportViewMode.platformType === EPlatformType.APP) {
			if (aiSourceMatchTag) {
				if (aiSourceMatchTag.title != 'AI Source Match') aiSourceMatchTag.title = 'AI Source Match';
				this.previewResult.tags = [
					aiSourceMatchTag,
					...this.previewResult.tags.filter(tag => tag.code !== RESULT_TAGS_CODES.AI_SOURCE_MATCH),
				];
			}
		} else {
			// remove the ai-source-match tag from the tags list if the platform is not APP
			this.previewResult.tags = this.resultItem.resultPreview.tags.filter(
				tag => tag.code !== RESULT_TAGS_CODES.AI_SOURCE_MATCH
			);
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
		this.isResultExcluded = false;
	}

	hideResult() {
		this.hiddenResultEvent.emit(this.previewResult.id);
		this.isResultExcluded = true;
		this.highlightService.clearAllMatchs();
		this.resultItemMenuTrigger?.closeMenu();
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
		this.highlightService.clearAllMatchs();
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

	openResultMenu(menuTrigger: MatMenuTrigger): void {
		menuTrigger?.openMenu();
	}

	copyResultURL() {
		if (!this.previewResult.url) return;
		navigator.clipboard.writeText(this.previewResult?.url).then(
			() => {
				this.copyMessage = $localize`URL copied!`;
				setTimeout(() => (this.copyMessage = ''), 3000); // Clear the message after 3 seconds
			},
			err => {
				console.error('Failed to copy text: ', err);
				this.copyMessage = $localize`Failed to copy text.`;
			}
		);
	}

	openResultURLInNewTab() {
		if (this.previewResult?.url) window.open(this.previewResult.url, '_blank');
	}

	ngOnDestroy(): void {}
}
