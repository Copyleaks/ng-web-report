import { PercentPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'similarity',
    standalone: false
})
export class SimilarityPipe implements PipeTransform {
	constructor(private _percentPipe: PercentPipe) {}
	/**
	 * Works like @angular/common PercentPipe but when value is larger than 0
	 * and the result string is 0% , it returns < 1%.
	 * See `PercentPipe` for params info.
	 */
	transform(value: any, digitsInfo?: string, locale?: string): string | null {
		let result = this._percentPipe.transform(value, digitsInfo, locale);
		if (value > 1) {
			result = '100%';
		}
		return result;
	}
}
