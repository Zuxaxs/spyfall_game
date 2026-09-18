import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultScreen } from './result-screen';

describe('ResultScreen', () => {
  let component: ResultScreen;
  let fixture: ComponentFixture<ResultScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
