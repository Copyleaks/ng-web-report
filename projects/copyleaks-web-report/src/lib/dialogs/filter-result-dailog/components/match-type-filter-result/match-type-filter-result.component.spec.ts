import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchTypeFilterResultComponent } from './match-type-filter-result.component';

describe('MatchTypeFilterResultComponent', () => {
  let component: MatchTypeFilterResultComponent;
  let fixture: ComponentFixture<MatchTypeFilterResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatchTypeFilterResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchTypeFilterResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
