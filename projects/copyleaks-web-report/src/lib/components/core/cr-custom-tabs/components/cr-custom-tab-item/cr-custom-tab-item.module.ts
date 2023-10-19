import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
	CrCustomTabItemComponent,
	CrCustomTabItemContentComponent,
	CrCustomTabItemTitleComponent,
} from './cr-custom-tab-item.component';

@NgModule({
	declarations: [CrCustomTabItemComponent, CrCustomTabItemContentComponent, CrCustomTabItemTitleComponent],
	imports: [CommonModule],
	exports: [CrCustomTabItemComponent, CrCustomTabItemContentComponent, CrCustomTabItemTitleComponent],
})
export class CrCustomTabItemModule {}
