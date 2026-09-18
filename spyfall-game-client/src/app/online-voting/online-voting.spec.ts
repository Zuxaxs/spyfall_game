import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineVoting } from './online-voting';

describe('OnlineVoting', () => {
  let component: OnlineVoting;
  let fixture: ComponentFixture<OnlineVoting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnlineVoting],
    }).compileComponents();

    fixture = TestBed.createComponent(OnlineVoting);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
