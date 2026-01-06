import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'decodeUri',
	standalone: false,
})
export class DecodeUriPipe implements PipeTransform {
	transform(value: string): string {
		return decodeURI(value);
	}
}
