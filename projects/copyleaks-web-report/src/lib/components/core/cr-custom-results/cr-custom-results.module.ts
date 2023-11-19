import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrCustomResultsComponent } from './cr-custom-results.component';
import { CrCustomResultsBoxContentModule } from './components/cr-custom-results-box-content/cr-custom-results-box-content.module';
import { ReportResultsContainerModule } from '../../containers/report-results-container/report-results-container.module';

@NgModule({
	declarations: [CrCustomResultsComponent],
	imports: [CommonModule, CrCustomResultsBoxContentModule, ReportResultsContainerModule],
	exports: [CrCustomResultsComponent],
})
export class CrCustomResultsModule {}
