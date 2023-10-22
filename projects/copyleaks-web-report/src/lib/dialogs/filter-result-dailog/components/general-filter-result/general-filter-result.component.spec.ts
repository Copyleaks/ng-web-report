import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralFilterResultComponent } from './general-filter-result.component';

describe('GeneralFilterResultComponent', () => {
  let component: GeneralFilterResultComponent;
  let fixture: ComponentFixture<GeneralFilterResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralFilterResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralFilterResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
