import { NgModule } from '@angular/core';
import { CommonModule, PercentPipe } from '@angular/common';
import { FileNamePipe } from './file-name.pipe';

@NgModule({
	declarations: [FileNamePipe],
	exports: [FileNamePipe],
	providers: [PercentPipe],
	imports: [CommonModule],
})
export class FileNamePipeModule {}
