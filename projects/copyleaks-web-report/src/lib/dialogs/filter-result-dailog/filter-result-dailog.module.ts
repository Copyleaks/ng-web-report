import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { ReportResultsContainerModule } from '../../components/containers/report-results-container/report-results-container.module';
import { ReportDataService } from '../../services/report-data.service';
import { ExcludedResultsDailogComponent } from './components/excluded-results-dailog/excluded-results-dailog.component';
import { GeneralFilterResultComponent } from './components/general-filter-result/general-filter-result.component';
import { IncludedTagsFilterResultComponent } from './components/included-tags-filter-result/included-tags-filter-result.component';
import {
	MatSlideFilterResultComponent,
	MatSlideLogoFilterResultComponent,
} from './components/mat-slide-filter-result/mat-slide-filter-result.component';
import { MatchTypeFilterResultComponent } from './components/match-type-filter-result/match-type-filter-result.component';
import { MetaFilterResultComponent } from './components/meta-filter-result/meta-filter-result.component';
import { SourceTypeFilterResultComponent } from './components/source-type-filter-result/source-type-filter-result.component';
import { FilterResultDailogComponent } from './filter-result-dailog.component';
import { FilterResultDailogService } from './services/filter-result-dailog.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
@NgModule({
	declarations: [
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
	exports: [FilterResultDailogComponent],
	providers: [FilterResultDailogService, ReportDataService],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		MatIconModule,
		FlexLayoutModule,
		MatSlideToggleModule,
		MatDividerModule,
		MatSliderModule,
		MatCheckboxModule,
		MatChipsModule,
		ReportResultsContainerModule,
		MatButtonModule,
		MatInputModule,
	],
})
export class FilterResultDailogModule {}
