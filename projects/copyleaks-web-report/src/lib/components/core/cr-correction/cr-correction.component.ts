import { Component, HostListener, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { IWritingFeedbackCorrectionViewModel } from '../../../models/report-data.models';
import { EWritingFeedbackCategories } from '../../../enums/copyleaks-web-report.enums';
import { getCorrectionCategoryTitle, getCorrectionCategoryDescription } from '../../../utils/enums-helpers';
import { ReportDataService } from '../../../services/report-data.service';
import { untilDestroy } from '../../../utils/until-destroy';
import { trigger, state, transition, animate, style } from '@angular/animations';
import { ReportMatchesService } from '../../../services/report-matches.service';

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
export class CrCorrectionComponent implements OnInit, OnDestroy {
	@HostListener('click', ['$event'])
	handleClick(_): void {
		if (this.isExcludeView || this.showLoadingView || !this.reportMatchesSvc) return;
		this.reportMatchesSvc.correctionSelect$.next(this.correction);
	}

	@Input() correction: IWritingFeedbackCorrectionViewModel;

	/**
	 * @Input {boolean} Flag indicating whether the view is for the execluded correction dialog view.
	 */
	@Input() isExcludeView: boolean = false;

	/**
	 * @Input {boolean} Flag indicating whether the view is for the execluded correction dialog view.
	 */
	@Input() hideDescription: boolean = false;

	/**
	 * @Input {boolean} Flag indicating whether the view is for the execluded correction dialog view.
	 */
	@Input() reportDataSvc: ReportDataService;

	/**
	 * @Input {boolean} Flag indicating whether the view is for the execluded correction dialog view.
	 */
	@Input() reportMatchesSvc: ReportMatchesService;

	/**
	 * @Input {boolean} Flag indicating whether to show the loading view or not.
	 */
	@Input() showLoadingView: boolean = false;

	isExcluded: boolean = false;
	excludedTooltipText: string;

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
		}
	}

	ignoreCorrection() {
		if (
			!this.reportDataSvc.excludedCorrections?.find(
				ec => ec.end === this.correction?.end && ec.start === this.correction?.start
			)
		)
			this.reportDataSvc.excludedCorrections$.next([
				...(this.reportDataSvc.excludedCorrections ?? []),
				this.correction,
			]);
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

	ngOnDestroy(): void {}
}