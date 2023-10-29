import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OriginalHtmlHelperComponent } from '../../../directives/original-html-helper.directive';
import { OriginalTextHelperDirective } from '../../../directives/original-text-helper.directive';
import { CrTextMatchComponent } from '../../core/cr-text-match/cr-text-match.component';
import { SourceHtmlHelperComponent } from '../../../directives/source-html-helper.directive';
import { SourceTextHelperDirective } from '../../../directives/source-text-helper.directive';
import { SuspectHtmlHelperComponent } from '../../../directives/suspect-html-helper.directive';
import { SuspectTextHelperDirective } from '../../../directives/suspect-text-helper.directive';
import { CrPaginatorModule } from '../../core/cr-paginator/cr-paginator.module';
import { ContentViewerContainerComponent } from './content-viewer-container.component';
import { CrPoweredByModule } from '../../core/cr-powered-by/cr-powered-by.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@NgModule({
	declarations: [
		ContentViewerContainerComponent,
		CrTextMatchComponent,
		OriginalTextHelperDirective,
		OriginalHtmlHelperComponent,
		SourceHtmlHelperComponent,
		SuspectHtmlHelperComponent,
		SourceTextHelperDirective,
		SuspectTextHelperDirective,
	],
	imports: [
		CommonModule,
		MatIconModule,
		MatTooltipModule,
		CrPaginatorModule,
		CrPoweredByModule,
		NgxSkeletonLoaderModule,
	],
	exports: [ContentViewerContainerComponent],
})
export class ContentViewerContainerModule {}
