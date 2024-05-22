import { AfterViewInit, Component, HostBinding, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { EResponsiveLayoutType } from '../../../enums/copyleaks-web-report.enums';
import { IResultItem } from './components/models/report-result-item.models';
import { ReportDataService } from '../../../services/report-data.service';

@Component({
	selector: 'copyleaks-report-results-item-container',
	templateUrl: './report-results-item-container.component.html',
	styleUrls: ['./report-results-item-container.component.scss'],
})
export class ReportResultsItemContainerComponent implements OnInit, AfterViewInit, OnChanges {
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

	/**
	 * @Input Flag indicating whether the content has masked text or not.
	 */
	@Input() hasMaskedContent: boolean;

	/**
	 * @Input Flag indicating whether the content has masked text or not.
	 */
	@Input() hideMaskedContentDisclaimer: { flag: boolean } = {
		flag: false,
	};

	constructor(private _reportDataSvc: ReportDataService) {}

	ngOnInit(): void {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['hideMaskedContentDisclaimer']) {
			// save this property in the local storage to keep the state of the disclaimer
			this._saveHideFlagInLocalStorage();
		}
	}

	ngAfterViewInit(): void {}

	excludeResultToggle(resultId: string) {
		const isFound = !!this._reportDataSvc.excludedResultsIds?.find(id => id === resultId);
		if (isFound)
			this._reportDataSvc.excludedResultsIds$.next([
				...(this._reportDataSvc.excludedResultsIds?.filter(id => id !== resultId) ?? []),
			]);
		else this._reportDataSvc.excludedResultsIds$.next([...(this._reportDataSvc.excludedResultsIds ?? []), resultId]);
	}

	closeDisclaimer() {
		this.hideMaskedContentDisclaimer.flag = true;
		this._saveHideFlagInLocalStorage();
	}

	private _saveHideFlagInLocalStorage() {
		try {
			localStorage.setItem('hideMaskedContentDisclaimer', JSON.stringify(this.hideMaskedContentDisclaimer));
		} catch (error) {
			console.error('Error saving disclaimer hide flag in local storage: ', error);
		}
	}

	//#endregion
	ngOnDestroy() {}
}
