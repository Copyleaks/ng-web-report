import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentViewerContainerComponent } from './content-viewer-container.component';

@NgModule({
  declarations: [ContentViewerContainerComponent],
  imports: [CommonModule],
  exports: [ContentViewerContainerComponent],
})
export class ContentViewerContainerModule {}
