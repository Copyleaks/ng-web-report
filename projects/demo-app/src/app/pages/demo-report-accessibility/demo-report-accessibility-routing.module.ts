import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DemoReportAccessibilityComponent } from './demo-report-accessibility.component';

const routes: Routes = [
	{
		path: '',
		component: DemoReportAccessibilityComponent,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class DemoReportAccessibilityRoutingModule {}
