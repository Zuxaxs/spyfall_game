import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineLobby } from './online-lobby';

describe('OnlineLobby', () => {
  let component: OnlineLobby;
  let fixture: ComponentFixture<OnlineLobby>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnlineLobby],
    }).compileComponents();

    fixture = TestBed.createComponent(OnlineLobby);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
