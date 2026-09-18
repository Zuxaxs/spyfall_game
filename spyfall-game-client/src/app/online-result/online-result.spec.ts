import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineResult } from './online-result';

describe('OnlineResult', () => {
  let component: OnlineResult;
  let fixture: ComponentFixture<OnlineResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnlineResult],
    }).compileComponents();

    fixture = TestBed.createComponent(OnlineResult);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
