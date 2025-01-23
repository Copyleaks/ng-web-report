import { NgModule } from '@angular/core';
import { CommonModule, PercentPipe } from '@angular/common';
import { RemoveProtocolPipe } from './remove-protocol.pipe';

@NgModule({
	declarations: [RemoveProtocolPipe],
	exports: [RemoveProtocolPipe],
	providers: [PercentPipe],
	imports: [CommonModule],
})
export class RemoveProtocolPipeModule {}
