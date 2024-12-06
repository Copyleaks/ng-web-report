import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'formaDecimalNumber',
})
export class FormaDecimalNumberPipe implements PipeTransform {
	transform(value: number): string {
		// Check if the number is an integer
		if (value >= 1) {
			return Math.round(value).toLocaleString(); // Return integers unchanged
		}

		// For numbers with decimal places, round to the desired significant figures
		const decimalPosition = Math.floor(Math.log10(Math.abs(value)));

		const factor = Math.pow(10, -decimalPosition);

		// Round to significant figures without altering whole numbers
		const roundedValue = Math.round(value * factor) / factor;

		return roundedValue > 999 ? roundedValue.toLocaleString() : roundedValue.toString();
	}
}
