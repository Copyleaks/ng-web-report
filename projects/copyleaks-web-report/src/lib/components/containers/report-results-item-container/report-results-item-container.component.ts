import { AfterViewInit, Component, HostBinding, Input, OnInit } from '@angular/core';
import { EResponsiveLayoutType } from '../../../enums/copyleaks-web-report.enums';
import { IResultItem } from './components/models/report-result-item.models';

@Component({
	selector: 'copyleaks-report-results-item-container',
	templateUrl: './report-results-item-container.component.html',
	styleUrls: ['./report-results-item-container.component.scss'],
})
export class ReportResultsItemContainerComponent implements OnInit, AfterViewInit {
	@HostBinding('style.display')
	displayProp = 'flex';

	@HostBinding('style.flex-grow')
	flexGrowProp: number;
	/**
	 * @Input {number} Flex grow property - flex-grow
	 */
	@Input() flexGrow: number;
	@Input() reportResponsive: EResponsiveLayoutType;
	@Input() resultItem: IResultItem | null = null;
	@Input() isMobile: boolean;
	/**
	 * @Input {boolean} Flag indicating whether to show the loading view or not.
	 */
	@Input() showLoadingView = false;

	constructor() {}

	ngOnInit(): void {}

	ngAfterViewInit(): void {}

	//#endregion
	ngOnDestroy() {}
}
