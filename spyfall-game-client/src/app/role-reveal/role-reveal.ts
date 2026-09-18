import { Component, signal, computed, inject } from '@angular/core';
import { Game } from '../game';
import { Router } from '@angular/router';

@Component({
  selector: 'app-role-reveal',
  imports: [],
  templateUrl: './role-reveal.html',
  styleUrl: './role-reveal.css',
})
export class RoleReveal {
  game = inject(Game);
  router = inject(Router);

  currentPlayerIndex = signal(0);
  isRevealed = signal(false);

  isSpy = computed(() => this.game.spyIndexes().includes(this.currentPlayerIndex()));
  currentPlayerName = computed(() => this.game.playerNames()[this.currentPlayerIndex()]);
  
  reveal() {
    this.isRevealed.set(true);
  }

  nextPlayer() {
    this.isRevealed.set(false);

    setTimeout(() => {
      if(this.currentPlayerIndex() + 1 >= this.game.playerCount()) {
        console.log("Alle Karten gezeigt, Spiel kann beginnen!");
        this.router.navigate(['/game']);
      }
      else {
        this.currentPlayerIndex.update(i => i + 1 );
      }
    },600);
  }

}
