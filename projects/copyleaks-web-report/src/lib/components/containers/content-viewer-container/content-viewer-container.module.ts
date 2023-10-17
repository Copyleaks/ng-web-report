import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OriginalHtmlHelperComponent } from '../../../directives/original-html-helper.directive';
import { OriginalTextHelperDirective } from '../../../directives/original-text-helper.directive';
import { ReportTextMatchComponent } from '../../core/report-text-match/report-text-match.component';
import { SourceHtmlHelperComponent } from '../../../directives/source-html-helper.directive';
import { SourceTextHelperDirective } from '../../../directives/source-text-helper.directive';
import { SuspectHtmlHelperComponent } from '../../../directives/suspect-html-helper.directive';
import { SuspectTextHelperDirective } from '../../../directives/suspect-text-helper.directive';
import { ClsPaginatorModule } from '../../core/cls-paginator/cls-paginator.module';
import { ContentViewerContainerComponent } from './content-viewer-container.component';
import { PoweredByModule } from '../../core/powered-by/powered-by.module';

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
	imports: [CommonModule, MatIconModule, MatTooltipModule, ClsPaginatorModule, PoweredByModule],
	exports: [ContentViewerContainerComponent],
})
export class ContentViewerContainerModule {}
