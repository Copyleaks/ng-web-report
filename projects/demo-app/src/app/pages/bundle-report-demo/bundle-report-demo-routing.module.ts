import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BundleReportDemoComponent } from './bundle-report-demo.component';

const routes: Routes = [
	{
		path: '',
		component: BundleReportDemoComponent,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class BundleReportDemoRoutingModule {}
