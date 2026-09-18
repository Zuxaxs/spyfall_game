import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterInput } from './counter-input';

describe('CounterInput', () => {
  let component: CounterInput;
  let fixture: ComponentFixture<CounterInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CounterInput],
    }).compileComponents();

    fixture = TestBed.createComponent(CounterInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
