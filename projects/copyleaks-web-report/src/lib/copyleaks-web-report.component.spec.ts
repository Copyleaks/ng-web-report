import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyleaksWebReportComponent } from './copyleaks-web-report.component';

describe('CopyleaksWebReportComponent', () => {
  let component: CopyleaksWebReportComponent;
  let fixture: ComponentFixture<CopyleaksWebReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CopyleaksWebReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyleaksWebReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
