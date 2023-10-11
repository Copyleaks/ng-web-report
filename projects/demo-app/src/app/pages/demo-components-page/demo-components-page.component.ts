import { Component } from '@angular/core';
import { IResultsActions } from 'projects/copyleaks-web-report/src/lib/components/containers/report-results-container/components/results-actions/models/results-actions.models';

@Component({
	selector: 'app-demo-components-page',
	templateUrl: './demo-components-page.component.html',
	styleUrls: ['./demo-components-page.component.scss'],
})
export class DemoComponentsPageComponent {
	resultsActions: IResultsActions = {
		totalResults: '23',
		totalExcluded: '17',
		totalFiltered: '14',
	};
}
