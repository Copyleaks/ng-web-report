import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DemoLayoutsPageComponent } from './demo-layouts-page.component';

const routes: Routes = [
  {
    path: '',
    component: DemoLayoutsPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DemoLayoutsPageRoutingModule {}
