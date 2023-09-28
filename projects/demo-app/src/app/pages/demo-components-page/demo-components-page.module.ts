import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DemoComponentsPageRoutingModule } from './demo-components-page-routing.module';
import { DemoComponentsPageComponent } from './demo-components-page.component';


@NgModule({
  declarations: [
    DemoComponentsPageComponent
  ],
  imports: [
    CommonModule,
    DemoComponentsPageRoutingModule
  ]
})
export class DemoComponentsPageModule { }
