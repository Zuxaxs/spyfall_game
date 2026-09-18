import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../socket';

@Component({
  selector: 'app-online-result',
  imports: [],
  templateUrl: './online-result.html',
  styleUrl: './online-result.css',
})
export class OnlineResult {
  socketService = inject(SocketService);
  router = inject(Router);

  showAnswer = signal(false);
  results = this.socketService.finalResults;

  newRound() {
    this.socketService.returnToLobby();
    this.router.navigate(['/online-lobby']);
  }
}