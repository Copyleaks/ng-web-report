import { AfterViewInit, Component, ElementRef, HostBinding, Input, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'copyleaks-content-viewer-container',
	templateUrl: './content-viewer-container.component.html',
	styleUrls: ['./content-viewer-container.component.scss'],
})
export class ContentViewerContainerComponent implements OnInit {
	@HostBinding('style.flex-grow')
	flexGrowProp: number;

	/**
	 * @Input {string} The content viewer HTML value
	 */
	@Input() contentHtml: string;

	/**
	 * @Input {boolean} Flag indicating whether to show the content title or not.
	 */
	@Input() hideTitleContainer = false;

	/**
	 * @Input {boolean} Flag indicating whether to show the content paginator or not.
	 */
	@Input() hidePaginatorContainer = false;

	/**
	 * @Input {number} Flex grow property - flex-grow
	 */
	@Input() flexGrow: number;

	constructor() {}

	ngOnInit(): void {
		if (this.flexGrow !== undefined && this.flexGrow !== null) this.flexGrowProp = this.flexGrow;
	}
}
