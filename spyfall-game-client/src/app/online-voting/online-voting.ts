import { Component, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../socket';

@Component({
  selector: 'app-online-voting',
  imports: [],
  templateUrl: './online-voting.html',
  styleUrl: './online-voting.css',
})
export class OnlineVoting {
  socketService = inject(SocketService);
  router = inject(Router);

  hasVoted = signal(false);

  constructor() {
    effect(() => {
      if (this.socketService.roundEnded()) {
        this.router.navigate(['/online-result']);
      }
    });
  }

  vote(playerId: string) {
    this.socketService.castVote(playerId);
    this.hasVoted.set(true);
  }
}
