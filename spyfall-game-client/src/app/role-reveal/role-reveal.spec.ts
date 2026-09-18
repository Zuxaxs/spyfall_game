import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleReveal } from './role-reveal';

describe('RoleReveal', () => {
  let component: RoleReveal;
  let fixture: ComponentFixture<RoleReveal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleReveal],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleReveal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
