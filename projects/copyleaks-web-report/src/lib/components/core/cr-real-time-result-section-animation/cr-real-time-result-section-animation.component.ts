import { trigger, transition, animate, style } from '@angular/animations';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'cr-real-time-result-section-animation',
    templateUrl: './cr-real-time-result-section-animation.component.html',
    styleUrls: ['./cr-real-time-result-section-animation.component.scss'],
    animations: [
        trigger('expandContainer', [
            transition(':enter', [
                style({ height: '0', opacity: 0, overflow: 'hidden' }),
                animate('800ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ height: '*', opacity: 1, overflow: 'hidden' })),
            ]),
            transition(':leave', [animate('200ms ease-in', style({ height: '0', opacity: 0, overflow: 'hidden' }))]),
        ]),
    ],
    standalone: false
})
export class CrRealTimeResultSectionAnimationComponent implements OnInit {
	counter: number = 1;
	interval: any;
	constructor() {}

	ngOnInit(): void {
		this.interval = setInterval(() => {
			this.counter++;
		}, 3000);
	}

	ngOnDestroy(): void {
		if (this.interval) {
			clearInterval(this.interval);
		}
	}
}
