import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IResources } from './models/resources-container.models';
import { MatTooltip } from '@angular/material/tooltip';
import { ReportAIResultsService } from '../../../../../services/report-ai-results.service';

@Component({
	selector: 'copyleaks-resources-container',
	templateUrl: './resources-container.component.html',
	styleUrls: ['./resources-container.component.scss'],
})
export class ResourcesContainerComponent implements OnInit {
	/**
	 * @Input {boolean} A flag indicating if the component is in loading state
	 */
	@Input() isLoading: boolean = false;

	/**
	 * @Input {boolean} A flag indicating if the component is in mobile view
	 */
	@Input() isMobile: boolean = false;

	/**
	 * @Input {boolean} A flag indicating if no results were found
	 */
	@Input() noResults: boolean = false;

	@ViewChild('resourcesTooltipView') resourcesTooltipView: MatTooltip;

	isOpen: boolean = false;
	resourcessTooltip: string;
	resourcesList: IResources[] = [];

	constructor(private _reportAIResultsService: ReportAIResultsService) {}

	ngOnInit(): void {
		this.resourcessTooltip = $localize`Learn more about AI content, how to talk about it with students and writers, our testing methodology and more with our resources.`;
		this.resourcesList = [
			{
				title: $localize`Start Here`,
				description: $localize`Learn the fundamentals of AI Logic.`,
				buttontext: $localize`Watch video`,
				link: 'https://player.vimeo.com/video/1019805684?h=bb3cb5d73e',
				isVideo: true,
			},
			{
				title: $localize`AI Detector FAQs`,
				description: $localize`Includes commonly asked questions about accuracy, model training, and more.`,
				link: 'https://copyleaks.com/wp-content/uploads/2023/05/ai-content-detector-faqs.pdf',
			},
			{
				title: $localize`Bringing AI Into The Classroom : Talking To Students About AI`,
				description: $localize`Strategies for opening the conversation between educators and students around utilizing AI and AI detectors in the classroom.`,
				link: 'https://copyleaks.com/blog/talking-to-students-about-ai',
			},
			{
				title: $localize`Check Out Our Help Center`,
				description: $localize`Find answers to general questions, troubleshooting guides, and video tutorials.`,
				link: 'https://help.copyleaks.com/hc/en-us',
			},
		];
	}

	startVideo(event, link) {
		event.preventDefault();
		this._reportAIResultsService.resourcesStartExplainableVideo$.next({
			startVideo: true,
			link: link,
		});
	}
}
