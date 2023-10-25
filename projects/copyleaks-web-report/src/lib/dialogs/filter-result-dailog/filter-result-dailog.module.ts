import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterResultDailogComponent } from './filter-result-dailog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SourceTypeFilterResultComponent } from './components/source-type-filter-result/source-type-filter-result.component';
import { MatchTypeFilterResultComponent } from './components/match-type-filter-result/match-type-filter-result.component';
import { GeneralFilterResultComponent } from './components/general-filter-result/general-filter-result.component';
import { IncludedTagsFilterResultComponent } from './components/included-tags-filter-result/included-tags-filter-result.component';
import { MetaFilterResultComponent } from './components/meta-filter-result/meta-filter-result.component';
import {
	MatSlideFilterResultComponent,
	MatSlideLogoFilterResultComponent,
} from './components/mat-slide-filter-result/mat-slide-filter-result.component';
import { FilterResultDailogService } from './services/filter-result-dailog.service';
import { ReportDataService } from '../../services/report-data.service';

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
	],
	exports: [FilterResultDailogComponent],
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
	],
	providers: [FilterResultDailogService, ReportDataService],
})
export class FilterResultDailogModule {}
