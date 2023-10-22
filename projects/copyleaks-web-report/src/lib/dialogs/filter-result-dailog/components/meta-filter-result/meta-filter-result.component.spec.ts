import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetaFilterResultComponent } from './meta-filter-result.component';

describe('MetaFilterResultComponent', () => {
  let component: MetaFilterResultComponent;
  let fixture: ComponentFixture<MetaFilterResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetaFilterResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetaFilterResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
