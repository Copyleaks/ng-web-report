import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonLoaderComponent } from './cr-skeleton-loader.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@NgModule({
	declarations: [SkeletonLoaderComponent],
	exports: [SkeletonLoaderComponent, NgxSkeletonLoaderModule],
	imports: [CommonModule, NgxSkeletonLoaderModule],
})
export class SkeletonLoaderModule {}
