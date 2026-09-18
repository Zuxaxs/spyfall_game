import { Component, inject, signal, effect } from '@angular/core';
import { Game } from '../game';
import { Router } from '@angular/router';
import { CounterInput } from '../counter-input/counter-input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-local-setup',
  imports: [CounterInput, FormsModule],
  templateUrl: './local-setup.html',
  styleUrl: './local-setup.css',
})

export class LocalSetup {
  game = inject(Game);
  router = inject(Router);
  playerCount = signal(3);
  spyCount = signal(1);
  roundMinutes = signal(8);
  showHint = signal(false); 
  playerNames = signal<string[]>(['', '', '']);
  newLocationName = signal('');

  constructor() {
    const saved = sessionStorage.getItem('spyfall-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.playerCount == 'number') this.playerCount.set(parsed.playerCount);
        if (typeof parsed.spyCount === 'number') this.spyCount.set(parsed.spyCount);
        if (typeof parsed.roundMinutes === 'number') this.roundMinutes.set(parsed.roundMinutes);
        if (Array.isArray(parsed.playerNames)) this.playerNames.set(parsed.playerNames);
      } catch {
        //Ungültige Werte im Speicher -> Standartwerte übernehmen
      }
    }

    effect(() => {
      sessionStorage.setItem('spyfall-settings', JSON.stringify ({
        playerCount: this.playerCount(),
        spyCount: this.spyCount(),
        roundMinutes: this.roundMinutes(),
        playerNames: this.playerNames(),
      }));
    });
  }

  setPlayerCount(value: number) {
    this.playerCount.set(value);

    const current = this.playerNames();
    if (value > current.length) {
      // neue leere Felder anhängen
      this.playerNames.set([...current, ...Array(value - current.length).fill('')]);
    } else if (value < current.length) {
      // überzählige Felder abschneiden
      this.playerNames.set(current.slice(0, value));
    }
  }

  updatePlayerName(index: number, value: string) {
    const updated = [...this.playerNames()];
    updated[index] = value;
    this.playerNames.set(updated);
  }

  startGame() {
    const names = this.playerNames().map((name, i) => name.trim() || `Spieler ${i + 1}`);
    this.game.startRound(this.playerCount(), this.spyCount(), this.roundMinutes(), names);
    this.router.navigate(['/reveal']);
  }
}