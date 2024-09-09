import { Component, OnInit } from '@angular/core';
import { IResources } from './models/resources-container.models';

@Component({
	selector: 'copyleaks-resources-container',
	templateUrl: './resources-container.component.html',
	styleUrls: ['./resources-container.component.scss'],
})
export class ResourcesContainerComponent implements OnInit {
	resources: any;
	constructor() {}
	resourcesList: IResources[] = [
		{
			title: $localize`AI Detector FAQs`,
			description: $localize`Includes commonly asked questions about accuracy, model training, and more.`,
			link: 'https://copyleaks.com/blog/talking-to-students-about-ai',
		},
		{
			title: $localize`Bringing AI Into the classroom:talking to students about AI`,
			description: $localize`Strategies for opening the conversation between educators and students around utilizing AI and AI detectors in the classroom.`,
			link: 'https://copyleaks.com/blog/talking-to-students-about-ai',
		},
		{
			title: $localize`Check Out our help center`,
			description: $localize`Find answers to general questions, troubleshooting guides, and video tutorials.`,
			link: 'https://help.copyleaks.com/hc/en-us',
		},
	];
	ngOnInit(): void {}
}
