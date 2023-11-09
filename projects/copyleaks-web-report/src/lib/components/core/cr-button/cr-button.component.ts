import { Component, Input, OnInit } from '@angular/core';
import { ClsButtonColor } from './models/cr-button.models';

/**
 * Class representing a new design for the Copyleaks Button.
 */
@Component({
	selector: 'cr-button',
	templateUrl: './cr-button.component.html',
	styleUrls: ['./cr-button.component.scss'],
})
export class CrButtonComponent implements OnInit {
	/**
	 * Flag that indicates whether the button is disabled or not
	 * @Input
	 */
	@Input() disabled: boolean = false;

	/**
	 * The button tooltip text content
	 * @Input
	 */
	@Input() buttonTooltip: string = '';

	/**
	 * Flag that indicates whether the button is disabled or not
	 * @Input
	 */
	@Input() showSpinner: boolean = false;

	/**
	 *  The button aria label
	 * @Input
	 */
	@Input() ariaLabel: string = '';

	// Button style properties
	/**
	 * The button theme color
	 * @Input
	 */
	@Input() color: ClsButtonColor = 'primary';

	/**
	 * Flag that indicates whether the button is outlined or not (only the text & the border will be the same as the theme color)
	 * @Input
	 */
	@Input() outlined: boolean = false;

	/**
	 * The width of the button (e.g. '100px' or '100%')
	 * @Input
	 */
	@Input() width: string = '';

	/**
	 * The height of the button (e.g. '100px')
	 * @Input
	 */
	@Input() height: string = '';

	// Button icon properties
	/**
	 * The name of the button icon
	 * @Input
	 */
	@Input() icon: string = '';

	/**
	 * Flag that indicates whether the button is just an icon or not
	 * @Input
	 */
	@Input() onlyIcon: boolean = false;

	/**
	 * The size of the buttons icon
	 * @Input
	 */
	@Input() iconSize: string = '20px';

	// Link button properties

	/**
	 * Flag that indicates whether the button is link or not
	 * @Input
	 */
	@Input() isLink: boolean = false;

	/**
	 * Flag that indicates whether the button will have a shadow or not
	 * @Input
	 */
	@Input() addShadow: boolean = false;

	/**
	 * The link URL
	 * @Input
	 */
	@Input() href: string = '';

	/**
	 * The link target
	 * @Input
	 */
	@Input() traget: string = '_blank';
	/**
	 * The tab index
	 * @Input
	 */
	@Input() tabindex: number = 0;
	/**
	 * The tab index
	 * @Input
	 */
	@Input() padding: string;
	/*
	 * Indicates where the icon will be position relative to the text
	 * @Input
	 */
	@Input() isIconRighToText: boolean = false;

	/**
	 * The font-weight of the button text.
	 * @Input
	 */
	@Input() fontWeight: string = '500';

	/**
	 * The font-size of the button text.
	 * @Input
	 */
	@Input() fontSize: string = '16px';

	/**
	 * Getter for the filled button classes names (put together)
	 */
	get filledButtonColorClassName(): string {
		return `${this.color}-filled-button${this.disabled ? '-disabled' : ''}`;
	}

	/**
	 * Getter for the outlined button classes names (put together)
	 */
	get outlinedButtonColorClassName(): string {
		return `${this.color}-outlined-button${this.disabled ? '-disabled' : ''}`;
	}

	/**
	 * Getter for the link button classes names (put together)
	 */
	get linkButtonColorClassName(): string {
		return `${this.color}-link-button${this.disabled ? '-disabled' : ''}`;
	}

	/**
	 * Getter for the icon button classes names (put together)
	 */
	get iconButtonColorClassName(): string {
		return `${this.color}-icon-button${this.disabled ? '-disabled' : ''}`;
	}

	iconStyle: any = {};
	buttonStyle: any = {};

	constructor() {}

	ngOnInit(): void {
		// check if the icon property is added, and if so update the icon style
		if (this.icon)
			this.iconStyle = {
				'font-size': this.iconSize,
				width: this.iconSize,
				height: this.iconSize,
			};

		// Apply button style.
		this.buttonStyle = {
			...this.buttonStyle,
			width: this.width,
			height: this.height,
			'font-weight': this.fontWeight,
			'font-size': this.fontSize,
		};

		// check if the button shadow property is added, and if so update the button accordingly
		if (this.addShadow)
			this.buttonStyle = {
				...this.buttonStyle,
				'box-shadow': '2px 2px 4px rgba(0, 0, 0, 0.15), -2px -2px 8px rgba(255, 255, 255, 0.5)',
			};

		if (this.padding)
			this.buttonStyle = {
				...this.buttonStyle,
				padding: this.padding,
			};
	}
}
