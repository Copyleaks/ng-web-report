import { Component } from '@angular/core';
import { IResultItem } from 'projects/copyleaks-web-report/src/lib/components/containers/report-results-item-container/components/models/report-result-item.models';
import {
	IResultPreviewBase,
	ISourceMetadataSection,
	IStatistics,
} from 'projects/copyleaks-web-report/src/lib/models/report-data.models';

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
}
