import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DemoComponentsPageRoutingModule } from './demo-components-page-routing.module';
import { DemoComponentsPageComponent } from './demo-components-page.component';
import { PoweredByModule } from 'projects/copyleaks-web-report/src/lib/components/powered-by/powered-by.module';

@NgModule({
	declarations: [DemoComponentsPageComponent],
	imports: [CommonModule, DemoComponentsPageRoutingModule, PoweredByModule],
})
export class DemoComponentsPageModule {}
