import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'removeProtocol',
    standalone: false
})
export class RemoveProtocolPipe implements PipeTransform {
	transform(url: string): string {
		if (!url) {
			return '';
		}

		// Use regex to remove protocol and "www."
		return url.replace(/^(https?:\/\/)?(www\.)?/, '');
	}
}
