import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineReveal } from './online-reveal';

describe('OnlineReveal', () => {
  let component: OnlineReveal;
  let fixture: ComponentFixture<OnlineReveal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnlineReveal],
    }).compileComponents();

    fixture = TestBed.createComponent(OnlineReveal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
