import { Component, Input } from '@angular/core';
import { trigger, transition, useAnimation } from '@angular/animations';

@Component({
    selector: 'cr-skeleton-loader',
    templateUrl: './cr-skeleton-loader.component.html',
    styleUrls: ['./cr-skeleton-loader.component.scss'],
    standalone: false
})
export class SkeletonLoaderComponent {
	@Input() showLoader = false;
	@Input() count = 1;
	@Input() appearance: '' | 'circle' | 'line' = 'line';
}
