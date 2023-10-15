import { Component } from '@angular/core';
import { IResultItem } from 'projects/copyleaks-web-report/src/lib/components/containers/report-results-item-container/components/models/report-result-item.models';
import { IResultsActions } from 'projects/copyleaks-web-report/src/lib/components/containers/report-results-container/components/results-actions/models/results-actions.models';
import { IAuthorAlertCard } from 'projects/copyleaks-web-report/src/lib/components/containers/report-alerts-container/components/author-alert-card/models/author-alert-card.models';
import { ECompleteResultNotificationAlertSeverity } from 'projects/copyleaks-web-report/src/lib/enums/copyleaks-web-report.enums';
import { ICompleteResultNotificationAlert } from 'projects/copyleaks-web-report/src/lib/models/report-data.models';

@Component({
	selector: 'app-demo-components-page',
	templateUrl: './demo-components-page.component.html',
	styleUrls: ['./demo-components-page.component.scss'],
})
export class DemoComponentsPageComponent {
	resultItem: IResultItem = {
		previewResult: {
			id: '00fe0c8338',
			introduction: 'No introduction available.',
			matchedWords: 400,
			tags: [],
			title: 'Copyleaks Internal Database',
			type: 3,
			url: 'url.com/slug/slug/123xyz..',
		},

		iStatisticsResult: {
			identical: 88,
			minorChanges: 2,
			relatedMeaning: 2,
		},
		metadataSource: {
			words: 100,
			excluded: 0,
		},
	};
	resultsActions: IResultsActions = {
		totalResults: '23',
		totalExcluded: '17',
		totalFiltered: '14',
	};

	alert: ICompleteResultNotificationAlert = {
		additionalData:
			'\'{"results":[{"classification":2,"probability":0.91045016,"matches":[{"text":{"chars":{"starts":[0],"lengths":[4005]},"words":{"starts":[0],"lengths":[661]}}}]}],"summary":{"human":0.0,"ai":1.0},"modelVersion":"v3","translationProvider":0,"scannedDocument":{}}',
		code: 'suspected-ai-text',
		helpLink: 'https://wikivisually.com/wiki/Martina_Gedeck',
		message: 'We are unable to verify that the text was written by a human.',
		severity: ECompleteResultNotificationAlertSeverity.VeryHigh,
		title: 'Suspected Cheating: AI Text detected',
	};

	authorAlert: IAuthorAlertCard = {
		title: '3/10 Submissions',
		message: 'This author has been repeatedly using AI text',
	};
}
