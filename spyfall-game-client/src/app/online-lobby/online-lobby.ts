import { Component, inject, signal, computed, effect, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../socket';
import { FormsModule } from '@angular/forms';
import { CounterInput } from '../counter-input/counter-input';
import { Game } from '../game';

@Component({
  selector: 'app-online-lobby',
  imports: [FormsModule, CounterInput],
  templateUrl: './online-lobby.html',
  styleUrl: './online-lobby.css',
})
export class OnlineLobby implements OnInit {
  socketService = inject(SocketService);
  router = inject(Router);
  game = inject(Game);

  mode = signal<'choice' | 'create' | 'join'>('choice');
  playerName = signal('');
  joinCode = signal('');

  spyCount = signal(1);
  roundMinutes = signal(8);

  constructor() {
    effect(() => {
      if (this.socketService.roleData()) {
        this.router.navigate(['/online-reveal']);
      }
    });
  }


  isHost = computed(() => this.socketService.playerId === this.socketService.hostId());

  ngOnInit() {
    this.socketService.confirmBackInLobby();
  }

  allPlayersBack = computed(() => {
    const status = this.socketService.lobbyReturnStatus();
    return !status || status.count >= status.total;
  });

  canStart = computed(() =>
    this.isHost() &&
    this.socketService.players().length >= 3 &&
    this.allPlayersBack()
  );

  onCreateRoom() {
    this.socketService.createRoom(this.playerName());
  }

  onJoinRoom() {
    this.socketService.joinRoom(this.joinCode(), this.playerName());
  }

  onStartGame() {
    this.socketService.startGame(this.spyCount(), this.roundMinutes(), this.game.locations());
  }

  onLeaveRoom() {
    this.socketService.leaveRoom();
    this.mode.set('choice');
    this.playerName.set('');
    this.joinCode.set('');
  }
}

