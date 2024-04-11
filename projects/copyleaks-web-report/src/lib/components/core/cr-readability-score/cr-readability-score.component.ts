import { Component, ElementRef, HostBinding, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { IReadabilityScore, IWritingFeedbackStatistics } from '../../../models/report-data.models';
import { EReadabilityLevel } from '../../../enums/copyleaks-web-report.enums';

@Component({
	selector: 'cr-readability-score',
	templateUrl: './cr-readability-score.component.html',
	styleUrls: ['./cr-readability-score.component.scss'],
})
export class CrReadabilityScoreComponent implements OnInit, OnChanges {
	@HostBinding('style.display')
	display = 'flex';

	@HostBinding('style.flex-grow')
	flexGrowProp: number;

	@HostBinding('style.box-shadow')
	boxShadow: string;

	@ViewChild('alertsContainer') alertsContainerRef: ElementRef<HTMLDivElement>;
	@ViewChild('expansionPanel') expansionPanelRef: ElementRef;

	/**
	 * @Input {number} Flex grow property - flex-grow
	 */
	@Input() flexGrow: number;

	/**
	 * @Input {boolean} Flag indicating whether the view is a mobile or not.
	 */
	@Input() isMobile: boolean;

	@Input() readabilityInfo: IReadabilityScore;

	@Input() statisticsInfo: IWritingFeedbackStatistics;

	@Input() showLoadingView: boolean = false;

	hideAlerts: boolean;
	readabilityLevelText: string;

	get getReadabilityLevelText(): string {
		switch (this.readabilityInfo?.readabilityLevel) {
			case EReadabilityLevel.FifthGrader:
				return $localize`Readable for 5th grader`;
			case EReadabilityLevel.SixthGrader:
				return $localize`Readable for 6th grader`;
			case EReadabilityLevel.SeventhGrader:
				return $localize`Readable for 7th grader`;
			case EReadabilityLevel.EighthNinthGrader:
				return $localize`Readable for 8th-9th grader`;
			case EReadabilityLevel.TenthTwelfthGrader:
				return $localize`Readable for 10th-12th grader`;
			case EReadabilityLevel.CollegeStudent:
				return $localize`Readable for college student`;
			case EReadabilityLevel.CollegeGraduate:
				return $localize`Readable for college graduate`;
			case EReadabilityLevel.Professional:
				return $localize`Readable for professional`;
			default:
				return $localize`Unknown readability level`;
		}
	}

	EXPEND_TOOLTIP = $localize`Expend`;
	COLLAPSE_TOOLTIP = $localize`Collapse`;

	constructor() {}

	ngOnInit(): void {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['readabilityInfo']) {
			this.readabilityLevelText = this.getReadabilityLevelText;
		}

		if (changes['isMobile']) {
			if (changes['isMobile'].currentValue === true)
				this.boxShadow = '-2px -2px 8px 0px rgba(255, 255, 255, 0.5), 2px 2px 4px 0px rgba(0, 0, 0, 0.15)';
			else this.boxShadow = null;
		}
	}

	hideAlertsClick() {
		this.hideAlerts = true;
	}

	showAlertsClick() {
		this.hideAlerts = false;
	}
}
