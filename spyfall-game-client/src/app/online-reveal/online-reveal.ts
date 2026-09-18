import { Component, inject, signal, effect, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../socket';

@Component({
  selector: 'app-online-reveal',
  imports: [],
  templateUrl: './online-reveal.html',
  styleUrl: './online-reveal.css',
})
export class OnlineReveal implements OnInit, OnDestroy {
  socketService = inject(SocketService);
  router = inject(Router);

  iAmReady = signal(false);
  countdownValue = signal<number | null>(3);

  private countdownIntervalId: any;

  constructor() {
    effect(() => {
      if (this.socketService.roundEndTime()) {
        this.router.navigate(['/online-game-screen']);
      }
    });
  }

  ngOnInit() {
    this.countdownIntervalId = setInterval(() => {
      const current = this.countdownValue();
      if (current === null || current <= 1) {
        clearInterval(this.countdownIntervalId);
        this.countdownValue.set(null);
      } else {
        this.countdownValue.set(current - 1);
      }
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.countdownIntervalId);
  }

  onReadyClick() {
    this.iAmReady.set(true);
    this.socketService.setReady();
  }
}