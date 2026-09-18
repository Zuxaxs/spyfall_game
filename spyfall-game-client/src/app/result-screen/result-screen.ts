import { Component, inject, computed, signal } from '@angular/core';
import { Game } from '../game';
import { Router } from '@angular/router';

@Component({
  selector: 'app-result-screen',
  imports: [],
  templateUrl: './result-screen.html',
  styleUrl: './result-screen.css',
})
export class ResultScreen {
  game = inject(Game);
  router = inject(Router);

  showAnswer = signal(false);
  transitionsReady = signal(false);

  spyPlayerNames = computed(() =>
    [...this.game.spyIndexes()]
      .sort((a, b) => a - b)
      .map(i => this.game.playerNames()[i])
  );

  ngOnInit() {
    setTimeout(() => this.transitionsReady.set(true));
  }

  newRound() {
    this.router.navigate(['/local-setup']);
  }
}
