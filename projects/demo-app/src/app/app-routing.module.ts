import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: 'previews/:type/:id',
		loadChildren: () =>
			import('./pages/demo-report-previews/demo-report-previews.module').then(mod => mod.DemoReportPreviewsModule),
	},
	{
		path: 'layouts',
		loadChildren: () =>
			import('./pages/demo-layouts-page/demo-layouts-page.module').then(mod => mod.DemoLayoutsPageModule),
	},
	{
		path: 'accessibility/:type/:id',
		loadChildren: () =>
			import('./pages/demo-report-accessibility/demo-report-accessibility.module').then(
				mod => mod.DemoReportAccessibilityModule
			),
	},
	{
		path: 'accessibility',
		redirectTo: 'accessibility/bundle/sample-report',
	},
	{
		path: '**',
		redirectTo: 'previews/bundle/sample-report',
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
