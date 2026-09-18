import { Component, input, model, effect } from '@angular/core';

@Component({
  selector: 'app-counter-input',
  imports: [],
  templateUrl: './counter-input.html',
  styleUrl: './counter-input.css',
})
export class CounterInput {
  label = input('');
  min = input(0);
  max = input (999);
  value = model(0);

  constructor() {
    effect(() => {
      const clamped = Math.min(Math.max(this.value(), this.min()), this.max());
      if (clamped !== this.value()) {
        this.value.set(clamped);
      }
    });
  }

  decrement() {
    if (this.value() > this.min()) {
      this.value.update(v => v - 1);
    }
  }

  increment() {
    if (this.value() < this.max()) {
      this.value.update(v => v + 1);
    }
  }
}
