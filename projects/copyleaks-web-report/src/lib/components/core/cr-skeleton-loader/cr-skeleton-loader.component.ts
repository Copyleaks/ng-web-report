import { Component, Input } from '@angular/core';
import { trigger, transition, useAnimation } from '@angular/animations';
import { fadeIn } from 'ng-animate';

@Component({
	selector: 'cr-skeleton-loader',
	templateUrl: './cr-skeleton-loader.component.html',
	styleUrls: ['./cr-skeleton-loader.component.scss'],
	animations: [trigger('fadeIn', [transition(':enter', useAnimation(fadeIn), { delay: 1 })])],
})
export class SkeletonLoaderComponent {
	@Input() showLoader = false;
	@Input() count = 1;
	@Input() appearance: '' | 'circle' | 'line' = 'line';
}
