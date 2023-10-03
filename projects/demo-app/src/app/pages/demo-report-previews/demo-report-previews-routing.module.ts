import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DemoReportPreviewsComponent } from './demo-report-previews.component';

const routes: Routes = [
	{
		path: '',
		component: DemoReportPreviewsComponent,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class DemoReportPreviewsRoutingModule {}
