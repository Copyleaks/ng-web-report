import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { IWritingFeedbackCorrectionViewModel } from '../../../models/report-data.models';
import { EWritingFeedbackCategories } from '../../../enums/copyleaks-web-report.enums';
import { getCorrectionCategoryTitle, getCorrectionCategoryDescription } from '../../../utils/enums-helpers';
import { ReportDataService } from '../../../services/report-data.service';
import { untilDestroy } from '../../../utils/until-destroy';
import { trigger, state, transition, animate, style } from '@angular/animations';
import { ReportMatchesService } from '../../../services/report-matches.service';
import { ReportMatchHighlightService } from '../../../services/report-match-highlight.service';

@Component({
	selector: 'cr-correction',
	templateUrl: './cr-correction.component.html',
	styleUrls: ['./cr-correction.component.scss'],
	animations: [
		trigger('fadeIn', [
			state('void', style({ opacity: 0 })),
			transition(':enter', [animate('0.5s ease-in', style({ opacity: 1 }))]),
		]),
	],
})
/**
 * Represents the correction component used for displaying and interacting with a writing feedback correction.
 */
export class CrCorrectionComponent implements OnInit, OnDestroy {
	@HostListener('click', ['$event'])
	handleClick(_): void {
		if (this.isExcludeView || this.showLoadingView || !this.reportMatchesSvc) return;
		this.reportMatchesSvc.correctionSelect$.next(this.correction);
	}

	/**
	 * @Input Represents the correction for the writing feedback.
	 */
	@Input() correction: IWritingFeedbackCorrectionViewModel;

	/**
	 * @Input {boolean} Flag indicating whether the view is for the execluded correction view.
	 */
	@Input() isExcludeView: boolean = false;

	/**
	 * @Input {boolean} Flag indicating whether to show the correction description or not.
	 */
	@Input() hideDescription: boolean = false;

	/**
	 * @Input Service for all the report data.
	 */
	@Input() reportDataSvc: ReportDataService;

	/**
	 * @Input Service for report matches and corrections.
	 */
	@Input() reportMatchesSvc: ReportMatchesService;

	/**
	 * @Input Service for report match highlight.
	 */
	@Input() highlightService: ReportMatchHighlightService;

	/**
	 * @Input {boolean} Flag indicating whether to show the loading view or not.
	 */
	@Input() showLoadingView: boolean = false;

	/**
	 * Emits an event when a category is selected.
	 * @event selectCategory
	 * @type {EventEmitter<EWritingFeedbackCategories>}
	 */
	@Output() selectCategory = new EventEmitter<EWritingFeedbackCategories>();

	isExcluded: boolean = false;
	excludedTooltipText: string;
	isMenuAccessible: boolean = true;

	get getCorrectionType(): string {
		return getCorrectionCategoryTitle(this.correction?.type);
	}

	get getCorrectionDescription(): string {
		return getCorrectionCategoryDescription(this.correction?.type);
	}

	EWritingFeedbackTypes = EWritingFeedbackCategories;
	correctionDescription: string;
	correctionType: string;
	constructor() {}

	ngOnInit(): void {
		if (this.reportDataSvc)
			this.reportDataSvc.excludedCorrections$.pipe(untilDestroy(this)).subscribe(excludedCorrections => {
				if (!excludedCorrections) return;
				if (!excludedCorrections.find(ec => ec.end === this.correction.end && ec.start === this.correction.start)) {
					this.isExcluded = false;
					this.excludedTooltipText = $localize`Ignore correction`;
				} else {
					this.isExcluded = true;
					this.excludedTooltipText = $localize`Include correction`;
				}
			});
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['correction']) {
			this.correctionType = this.getCorrectionType;
			this.correctionDescription = this.getCorrectionDescription;

			if (this.correction.type === EWritingFeedbackCategories.Space) {
				this.correction.correctionText = this.replaceExtraSpacesWithSpan(this.correction.correctionText);
				this.correction.wrongText = this.replaceExtraSpacesWithSpan(this.correction.wrongText);
			}
		}
	}

	replaceExtraSpacesWithSpan(correctionText) {
		const regex = /( {2,})/g;
		const replacementFunction = correction => {
			let result = ' ';
			for (let i = 1; i < correction.length; i++) {
				result += `<span class="duplicated-space">&nbsp;</span>`;
			}
			return result;
		};
		return correctionText.replace(regex, replacementFunction);
	}

	ignoreCorrection() {
		if (
			!this.reportDataSvc.excludedCorrections?.find(
				ec => ec.end === this.correction?.end && ec.start === this.correction?.start
			)
		) {
			this.reportDataSvc.excludedCorrections$.next([
				...(this.reportDataSvc.excludedCorrections ?? []),
				this.correction,
			]);
			this.highlightService.clearAllMatchs();
		}
	}

	excludeToggle() {
		if (
			!this.reportDataSvc.excludedCorrections?.find(
				ec => ec.end === this.correction?.end && ec.start === this.correction?.start
			)
		)
			this.reportDataSvc.excludedCorrections$.next([
				...(this.reportDataSvc.excludedCorrections ?? []),
				this.correction,
			]);
		else
			this.reportDataSvc.excludedCorrections$.next([
				...(this.reportDataSvc.excludedCorrections ?? []).filter(
					ec => ec.end !== this.correction?.end && ec.start !== this.correction?.start
				),
			]);
	}

	goToCorrectionCategoryView(event?: KeyboardEvent) {
		if (!event) this.selectCategory.emit(this.correction?.type);
		else {
			if (event.key === 'Enter') {
				this.selectCategory.emit(this.correction?.type);
			}
		}
	}

	openResultMenu(menuTrigger: any): void {
		if (this.isMenuAccessible) {
			menuTrigger?.openMenu();
		}
	}

	ngOnDestroy(): void {}
}
