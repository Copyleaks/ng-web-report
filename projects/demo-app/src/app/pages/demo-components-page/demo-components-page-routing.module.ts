import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DemoComponentsPageComponent } from './demo-components-page.component';

const routes: Routes = [
  {
    path: '',
    component: DemoComponentsPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DemoComponentsPageRoutingModule {}
