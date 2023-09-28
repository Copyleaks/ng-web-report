import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'copyleaks-content-viewer-container',
  templateUrl: './content-viewer-container.component.html',
  styleUrls: ['./content-viewer-container.component.scss'],
})
export class ContentViewerContainerComponent implements OnInit {
  @HostBinding('style.flex-grow')
  flexGrowProp: number;

  @Input() hideTitleContainer = false;

  @Input() hidePaginatorContainer = false;

  @Input() flexGrow: number;

  ngOnInit(): void {
    if (this.flexGrow !== undefined && this.flexGrow !== null)
      this.flexGrowProp = this.flexGrow;
  }
}
