import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
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
		path: '**',
		redirectTo: 'components',
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
