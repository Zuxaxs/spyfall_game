import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalSetup } from './local-setup';

describe('LocalSetup', () => {
  let component: LocalSetup;
  let fixture: ComponentFixture<LocalSetup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalSetup],
    }).compileComponents();

    fixture = TestBed.createComponent(LocalSetup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
