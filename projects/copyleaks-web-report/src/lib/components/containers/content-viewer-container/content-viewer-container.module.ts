import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentViewerContainerComponent } from './content-viewer-container.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReportTextMatchComponent } from '../../../directives/report-text-match/report-text-match.component';
import { ClsPaginatorModule } from '../../core/cls-paginator/cls-paginator.module';
import { PoweredByCopyleaksModule } from '../../core/powered-by-copyleaks/powered-by-copyleaks.module';
import { OriginalTextHelperDirective } from '../../../directives/original-text-helper.directive';
import { OriginalHtmlHelperComponent } from '../../../directives/original-html-helper.directive';
import { SourceHtmlHelperComponent } from '../../../directives/source-html-helper.directive';
import { SuspectHtmlHelperComponent } from '../../../directives/suspect-html-helper.directive';
import { SourceTextHelperDirective } from '../../../directives/source-text-helper.directive';
import { SuspectTextHelperDirective } from '../../../directives/suspect-text-helper.directive';

@NgModule({
	declarations: [
		ContentViewerContainerComponent,
		ReportTextMatchComponent,
		OriginalTextHelperDirective,
		OriginalHtmlHelperComponent,
		SourceHtmlHelperComponent,
		SuspectHtmlHelperComponent,
		SourceTextHelperDirective,
		SuspectTextHelperDirective,
	],
	imports: [CommonModule, MatIconModule, MatTooltipModule, ClsPaginatorModule, PoweredByCopyleaksModule],
	exports: [ContentViewerContainerComponent],
})
export class ContentViewerContainerModule {}