import { Component, signal, computed, OnInit, OnDestroy, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../socket';
import { interval } from 'rxjs';

@Component({
  selector: 'app-online-game-screen',
  imports: [],
  templateUrl: './online-game-screen.html',
  styleUrl: './online-game-screen.css',
})
export class OnlineGameScreen implements OnInit, OnDestroy {
  router = inject(Router);
  socketService = inject(SocketService);

  locations = this.socketService.locationPool;

  showStopConfirm = signal(false);
  showLocations = signal(false);
  secondsLeft = signal(0);

  private intervalId: any;

  totalSeconds = computed(() => this.socketService.roundDurationSeconds() ?? 1);
  isPaused = computed(() => this.socketService.roundPaused());
  isHost = computed(() => this.socketService.playerId === this.socketService.hostId());

  minutes = computed(() => Math.floor(this.secondsLeft() / 60));
  seconds = computed(() => this.secondsLeft() % 60);

  radius = 100;
  circumference = 2 * Math.PI * this.radius;

  dashOffset = computed(() =>
    this.circumference * (1 - this.secondsLeft() / this.totalSeconds())
  );

  constructor() {
    effect(() => {
      if (this.socketService.votingStarted()) {
        this.router.navigate(['/online-voting']);
      }
    });
  }

  ngOnInit() {
    this.startInterval();
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && !this.isPaused()) {
      this.tick();
    }
  };

  private startInterval() {
    this.tick();
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  private tick() {
    if (this.isPaused()) return;
    const endTime = this.socketService.roundEndTime();
    if (!endTime) return;
    const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
    this.secondsLeft.set(remaining);

    if (remaining <= 0) {
      clearInterval(this.intervalId);
      if (this.isHost()) {
        this.socketService.endRound();
      }
    }
  }

  togglePause() {
    if (this.isPaused()) {
      this.socketService.resumeRound();
    } else {
      this.socketService.pauseRound();
    }
  }

  endRoundNow() {
    this.showStopConfirm.set(true);
  }

  confirmStop() {
    this.showStopConfirm.set(false);
    this.socketService.endRound();
  }
}
