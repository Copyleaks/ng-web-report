import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
	selector: 'cr-mat-slide-filter-result',
	templateUrl: './mat-slide-filter-result.component.html',
	styleUrls: ['./mat-slide-filter-result.component.scss'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => MatSlideFilterResultComponent),
			multi: true,
		},
	],
})
export class MatSlideFilterResultComponent implements OnInit, ControlValueAccessor {
	@Input() title: string;
	value: boolean;
	updateParentControllerValue: (value: boolean) => void;
	ngOnInit(): void {}

	writeValue(result: boolean): void {
		this.value = result;
	}

	registerOnChange(fn: any): void {
		this.updateParentControllerValue = fn;
	}

	registerOnTouched(fn: any): void {}
	onInputChange(value: string) {}

	chanegValue(event: MatSlideToggleChange) {
		this.value = event.checked;
		this.updateParentControllerValue(this.value);
	}
}

@Component({
	selector: 'mat-slide-logo',
	template: '<ng-content></ng-content>',
})
export class MatSlideLogoFilterResultComponent {}
