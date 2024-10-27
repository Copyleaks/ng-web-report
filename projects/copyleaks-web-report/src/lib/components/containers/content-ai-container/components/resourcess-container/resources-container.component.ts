import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IResources } from './models/resources-container.models';
import { MatTooltip } from '@angular/material/tooltip';

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

	@ViewChild('resourcesTooltipView') resourcesTooltipView: MatTooltip;

	isOpen: boolean = false;
	resourcessTooltip: string;
	constructor() {}
	resourcesList: IResources[] = [];

	ngOnInit(): void {
		this.resourcessTooltip = $localize`Learn more about AI content, how to talk about it with students and writers, our testing methodology and more with our resources.`;
		this.resourcesList = [
			{
				title: $localize`Start Here`,
				description: $localize`Learn the fundamentals of AI insights.`,
				buttontext: $localize`Watch Video`,
				link: 'https://vimeo.com/1019805684?share=copy',
			},
			{
				title: $localize`AI Detector FAQs`,
				description: $localize`Includes commonly asked questions about accuracy, model training, and more.`,
				link: 'https://copyleaks.com/blog/talking-to-students-about-ai',
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
}
