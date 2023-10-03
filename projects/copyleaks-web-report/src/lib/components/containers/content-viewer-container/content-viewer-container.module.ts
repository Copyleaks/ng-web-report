import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentViewerContainerComponent } from './content-viewer-container.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
	declarations: [ContentViewerContainerComponent],
	imports: [CommonModule, MatIconModule],
	exports: [ContentViewerContainerComponent],
})
export class ContentViewerContainerModule {}
