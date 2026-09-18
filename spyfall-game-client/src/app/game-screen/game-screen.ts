import { Component, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from '../game';

@Component({
  selector: 'app-game-screen',
  imports: [],
  templateUrl: './game-screen.html',
  styleUrl: './game-screen.css',
})
export class GameScreen implements OnInit, OnDestroy{
  router = inject(Router);
  game = inject(Game);

  showStopConfirm = signal(false);
  showLocations = signal(false);
  totalSeconds = this.game.roundDurationSeconds();
  secondsLeft = signal(this.totalSeconds);
  isPaused = signal(false);
  private intervalId: any;
  private endTime = 0;

  minutes = computed(() => Math.floor(this.secondsLeft() / 60));
  seconds = computed(() => this.secondsLeft() % 60);

  radius = 100;
  circumference = 2 * Math.PI * this.radius;

  dashOffset = computed(() =>
    this.circumference * (1 - this.secondsLeft() / this.totalSeconds)
  );

  ngOnInit() {
    this.endTime = Date.now() + this.totalSeconds * 1000;
    this.startInterval();
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && !this.isPaused()) {
      this.tick();
    }
  };

  private startInterval() {
    this.intervalId = setInterval(() => this.tick(),1000);
  }

  private tick() {
    const remaining = Math.max(0, Math.round((this.endTime - Date.now()) / 1000));
    this.secondsLeft.set(remaining);

    if (remaining <= 0) {
      clearInterval(this.intervalId);
      this.router.navigate(['/result']);
    }
  }

  togglePause() {
    if (this.isPaused()) {
      this.endTime = Date.now() + this.secondsLeft() * 1000;
      this.startInterval();
    } else {
      clearInterval(this.intervalId);
    }
    this.isPaused.update(p => !p);
  }

  endRoundNow() {
    this.showStopConfirm.set(true);
  }

  confirmStop() {
    this.showStopConfirm.set(false);
    clearInterval(this.intervalId);
    this.router.navigate(['/result']);
  }
}
