import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoweredByCopyleaksComponent } from './powered-by-copyleaks.component';

describe('PoweredByCopyleaksComponent', () => {
  let component: PoweredByCopyleaksComponent;
  let fixture: ComponentFixture<PoweredByCopyleaksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoweredByCopyleaksComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoweredByCopyleaksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
