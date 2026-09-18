import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineGameScreen } from './online-game-screen';

describe('OnlineGameScreen', () => {
  let component: OnlineGameScreen;
  let fixture: ComponentFixture<OnlineGameScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnlineGameScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(OnlineGameScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
