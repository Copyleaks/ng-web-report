import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'fileName',
	standalone: false,
})
export class FileNamePipe implements PipeTransform {
	transform(fileName: string): string {
		return this._cleanFileName(fileName);
	}

	private _cleanFileName(fileName: string): string {
		// Replace multiple periods with a single period
		let cleanedFileName = fileName.replace(/\.{2,}/g, '.');

		// Remove any invalid characters that are not allowed in file names
		cleanedFileName = cleanedFileName.replace(/[<>:"/\\|?*\x00-\x1F]/g, '');

		// Ensure there are no trailing periods or spaces
		cleanedFileName = cleanedFileName.trim().replace(/\.$/, '');

		return cleanedFileName;
	}
}
