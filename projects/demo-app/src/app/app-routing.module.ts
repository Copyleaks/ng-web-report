import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: 'previews/:id',
		loadChildren: () =>
			import('./pages/demo-report-previews/demo-report-previews.module').then(mod => mod.DemoReportPreviewsModule),
	},
	{
		path: 'components',
		loadChildren: () =>
			import('./pages/demo-components-page/demo-components-page.module').then(mod => mod.DemoComponentsPageModule),
	},
	{
		path: 'layouts',
		loadChildren: () =>
			import('./pages/demo-layouts-page/demo-layouts-page.module').then(mod => mod.DemoLayoutsPageModule),
	},
	{
		path: 'v2/web-report/bundle/:scanId',
		loadChildren: () =>
			import('./pages/bundle-report-demo/bundle-report-demo.module').then(mod => mod.BundleReportDemoModule),
	},
	{
		path: '**',
		redirectTo: 'previews/default',
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
