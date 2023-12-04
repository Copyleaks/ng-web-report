import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CrActionsComponent } from './components/core/cr-report-actions/cr-actions.component';
import { CopyleaksWebReportComponent } from './copyleaks-web-report.component';
import { ReportErrorsService } from './services/report-errors.service';
import {
	CrCustomTabItemComponent,
	CrCustomTabItemContentComponent,
	CrCustomTabItemTitleComponent,
} from './components/core/cr-custom-tabs/components/cr-custom-tab-item/cr-custom-tab-item.component';
import { CrCustomTabsComponent } from './components/core/cr-custom-tabs/cr-custom-tabs.component';
import { CrCustomEmptyResultsComponent } from './components/core/cr-custom-empty-results/cr-custom-empty-results.component';
import { CrCustomResultsBoxContentComponent } from './components/core/cr-custom-results/components/cr-custom-results-box-content/cr-custom-results-box-content.component';
import { CrCustomResultsComponent } from './components/core/cr-custom-results/cr-custom-results.component';
import { ResultsActionsComponent } from './components/containers/report-results-container/components/results-actions/results-actions.component';
import { ReportResultsItemComponent } from './components/containers/report-results-item-container/components/report-results-item/report-results-item.component';
import { MatIconModule } from '@angular/material/icon';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { CrButtonModule } from './components/core/cr-button/cr-button.module';
import { ReportResultsContainerComponent } from './components/containers/report-results-container/report-results-container.component';
import { EmptyResultStateComponent } from './components/containers/report-results-container/components/empty-result-state/empty-result-state.component';
import { LockResultItemComponent } from './components/containers/report-results-item-container/components/lock-result-item/lock-result-item.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CrPaginatorModule } from './components/core/cr-paginator/cr-paginator.module';
import { CrPoweredByModule } from './components/core/cr-powered-by/cr-powered-by.module';
import { ContentViewerContainerComponent } from './components/containers/content-viewer-container/content-viewer-container.component';
import { CrTextMatchComponent } from './components/core/cr-text-match/cr-text-match.component';
import { OriginalHtmlHelperComponent } from './directives/original-html-helper.directive';
import { OriginalTextHelperDirective } from './directives/original-text-helper.directive';
import { SourceHtmlHelperComponent } from './directives/source-html-helper.directive';
import { SourceTextHelperDirective } from './directives/source-text-helper.directive';
import { SuspectHtmlHelperComponent } from './directives/suspect-html-helper.directive';
import { SuspectTextHelperDirective } from './directives/suspect-text-helper.directive';
import { ReportActionsContainerComponent } from './components/containers/report-actions-container/report-actions-container.component';
import { ReportAlertsContainerComponent } from './components/containers/report-alerts-container/report-alerts-container.component';
import { AlertCardComponent } from './components/containers/report-alerts-container/components/alert-card/alert-card.component';
import { AuthorAlertCardComponent } from './components/containers/report-alerts-container/components/author-alert-card/author-alert-card.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { ReportExpandResultItemComponent } from './components/containers/report-results-item-container/components/report-expand-result-item/report-expand-result-item.component';
import { ReportResultsItemContainerComponent } from './components/containers/report-results-item-container/report-results-item-container.component';
import { SimilarityPipeModule } from './pipes/similarity-pipe/similarity-pipe.module';
import { CrReportScoreTooltipModule } from './directives/report-score-tooltip/cr-report-score-tooltip-content.module';
import { PercentageResultItemComponent } from './components/containers/report-results-item-container/components/percentage-result-item/percentage-result-item.component';
import { ReportTabsContainerComponent } from './components/containers/report-tabs-container/report-tabs-container.component';
import { OneToManyReportLayoutDesktopComponent } from './components/layouts/one-to-many/one-to-many-report-layout-desktop/one-to-many-report-layout-desktop.component';
import { OneToManyReportLayoutMobileComponent } from './components/layouts/one-to-many/one-to-many-report-layout-mobile/one-to-many-report-layout-mobile.component';
import { OneToOneReportLayoutDesktopComponent } from './components/layouts/one-to-one/one-to-one-report-layout-desktop/one-to-one-report-layout-desktop.component';
import { OneToOneReportLayoutMobileComponent } from './components/layouts/one-to-one/one-to-one-report-layout-mobile/one-to-one-report-layout-mobile.component';
import { OnlyAiReportLayoutMobileComponent } from './components/layouts/only-ai/only-ai-report-layout-mobile/only-ai-report-layout-mobile.component';
import { OnlyAiReportLayoutDesktopComponent } from './components/layouts/only-ai/only-ai-report-layout-desktop/only-ai-report-layout-desktop.component';
import { ExcludedResultsDailogComponent } from './dialogs/filter-result-dailog/components/excluded-results-dailog/excluded-results-dailog.component';
import { GeneralFilterResultComponent } from './dialogs/filter-result-dailog/components/general-filter-result/general-filter-result.component';
import { IncludedTagsFilterResultComponent } from './dialogs/filter-result-dailog/components/included-tags-filter-result/included-tags-filter-result.component';
import {
	MatSlideFilterResultComponent,
	MatSlideLogoFilterResultComponent,
} from './dialogs/filter-result-dailog/components/mat-slide-filter-result/mat-slide-filter-result.component';
import { MatchTypeFilterResultComponent } from './dialogs/filter-result-dailog/components/match-type-filter-result/match-type-filter-result.component';
import { MetaFilterResultComponent } from './dialogs/filter-result-dailog/components/meta-filter-result/meta-filter-result.component';
import { SourceTypeFilterResultComponent } from './dialogs/filter-result-dailog/components/source-type-filter-result/source-type-filter-result.component';
import { FilterResultDailogComponent } from './dialogs/filter-result-dailog/filter-result-dailog.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReportViewService } from './services/report-view.service';
import { ReportDataService } from './services/report-data.service';
import { ReportRealtimeResultsService } from './services/report-realtime-results.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FilterResultDailogService } from './dialogs/filter-result-dailog/services/filter-result-dailog.service';
import { ReportMatchHighlightService } from './services/report-match-highlight.service';
import { ReportMatchesService } from './services/report-matches.service';
import { ReportNgTemplatesService } from './services/report-ng-templates.service';
import { ReportStatisticsService } from './services/report-statistics.service';

@NgModule({
	declarations: [
		CopyleaksWebReportComponent,
		CrActionsComponent,
		CrCustomTabsComponent,
		CrCustomTabItemComponent,
		CrCustomTabItemContentComponent,
		CrCustomTabItemTitleComponent,
		CrCustomEmptyResultsComponent,
		CrCustomResultsComponent,
		CrCustomResultsBoxContentComponent,
		ResultsActionsComponent,
		ReportResultsItemComponent,
		ReportResultsContainerComponent,
		EmptyResultStateComponent,
		LockResultItemComponent,
		ContentViewerContainerComponent,
		CrTextMatchComponent,
		OriginalTextHelperDirective,
		OriginalHtmlHelperComponent,
		SourceHtmlHelperComponent,
		SuspectHtmlHelperComponent,
		SourceTextHelperDirective,
		SuspectTextHelperDirective,
		ReportActionsContainerComponent,
		ReportAlertsContainerComponent,
		AlertCardComponent,
		AuthorAlertCardComponent,
		ReportResultsItemContainerComponent,
		ReportExpandResultItemComponent,
		PercentageResultItemComponent,
		ReportTabsContainerComponent,
		OneToManyReportLayoutDesktopComponent,
		OneToManyReportLayoutMobileComponent,
		OneToOneReportLayoutDesktopComponent,
		OneToOneReportLayoutMobileComponent,
		OnlyAiReportLayoutDesktopComponent,
		OnlyAiReportLayoutMobileComponent,
		FilterResultDailogComponent,
		SourceTypeFilterResultComponent,
		MatchTypeFilterResultComponent,
		GeneralFilterResultComponent,
		IncludedTagsFilterResultComponent,
		MetaFilterResultComponent,
		MatSlideFilterResultComponent,
		MatSlideLogoFilterResultComponent,
		ExcludedResultsDailogComponent,
	],
	imports: [
		CommonModule,
		MatIconModule,
		NgxSkeletonLoaderModule,
		FormsModule,
		MatFormFieldModule,
		ReactiveFormsModule,
		FlexLayoutModule,
		MatChipsModule,
		MatMenuModule,
		MatInputModule,
		MatButtonModule,
		MatDialogModule,
		ScrollingModule,
		CrButtonModule,
		MatTooltipModule,
		CrPaginatorModule,
		CrPoweredByModule,
		MatExpansionModule,
		SimilarityPipeModule,
		CrReportScoreTooltipModule,
		MatSlideToggleModule,
		MatDividerModule,
		MatSliderModule,
		MatCheckboxModule,
		MatProgressBarModule,
	],
	exports: [
		CopyleaksWebReportComponent,
		CrActionsComponent,
		CrCustomTabsComponent,
		CrCustomTabItemComponent,
		CrCustomTabItemContentComponent,
		CrCustomTabItemTitleComponent,
		CrCustomEmptyResultsComponent,
		CrCustomResultsComponent,
		CrCustomResultsBoxContentComponent,
		EmptyResultStateComponent,
		LockResultItemComponent,
	],
	providers: [
		ReportErrorsService,
		ReportViewService,
		ReportDataService,
		ReportRealtimeResultsService,
		FilterResultDailogService,
		ReportNgTemplatesService,
		ReportMatchesService,
		ReportMatchHighlightService,
		ReportStatisticsService,
	],
})
export class CopyleaksWebReportModule {}
