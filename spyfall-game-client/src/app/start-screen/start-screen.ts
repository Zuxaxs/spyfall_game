import { Component, inject, effect, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../socket';

@Component({
  selector: 'app-start-screen',
  imports: [],
  templateUrl: './start-screen.html',
  styleUrl: './start-screen.css',
})
export class StartScreen {
  router = inject(Router);
  socketService = inject(SocketService);

  showSettings = signal(false);

  constructor() {
    effect(() => {
      if (this.socketService.roundEnded()) {
        this.router.navigate(['/online-result']);
      } else if (this.socketService.votingStarted()) {
        this.router.navigate(['/online-voting']);
      } else if (this.socketService.roundEndTime()) {
        this.router.navigate(['/online-game-screen']);
      } else if (this.socketService.roleData()) {
        this.router.navigate(['/online-reveal']);
      } else if (this.socketService.roomCode()) {
        this.router.navigate(['/online-lobby']);
      }
    });
  }

  goLocal() {
    this.router.navigate(['/local-setup']);
  }

  goOnline() {
    this.router.navigate(['/online-lobby']);
  }

    goToLocations() {
    this.router.navigate(['/settings']);
  }
}