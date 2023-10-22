import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncludedTagsFilterResultComponent } from './included-tags-filter-result.component';

describe('IncludedTagsFilterResultComponent', () => {
  let component: IncludedTagsFilterResultComponent;
  let fixture: ComponentFixture<IncludedTagsFilterResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncludedTagsFilterResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncludedTagsFilterResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
