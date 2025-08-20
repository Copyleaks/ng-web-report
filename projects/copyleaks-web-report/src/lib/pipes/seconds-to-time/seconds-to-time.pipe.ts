import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'secondsToTime',
    standalone: false
})
export class SecondsToTimePipe implements PipeTransform {
	transform(value: number): string {
		if (!value && value !== 0) {
			return '';
		}

		const hours: number = Math.floor(value / 3600);
		const minutes: number = Math.floor((value % 3600) / 60);
		const seconds: number = Math.floor(value % 60);

		let timeParts = [];
		if (hours > 0) {
			timeParts.push($localize`${hours} Hour${hours > 1 ? 's' : ''}`);
		}
		if (minutes > 0) {
			timeParts.push($localize`${minutes} Minute${minutes > 1 ? 's' : ''}`);
		}
		if (seconds > 0 || value === 0) {
			// To handle the 0 second case
			timeParts.push($localize`${seconds} Second${seconds === 1 ? '' : 's'}`);
		}

		// Combine time parts with "and" before the last element if more than one element exists
		let result = '';
		if (timeParts.length > 1) {
			// Join all elements with ", " except the last one, then add " and " before the last element
			result = timeParts.slice(0, -1).join(', ') + $localize` and ` + timeParts.slice(-1);
		} else {
			result = timeParts.join('');
		}

		return result;
	}
}
