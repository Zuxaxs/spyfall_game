import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  roomCode = signal<string | null>(null);
  players = signal<{ id: string; name: string }[]>([]);
  joinError = signal<string | null>(null);
  hostId = signal<string | null>(null);
  roleData = signal<{ isSpy: boolean; location?: string } | null>(null);
  readyStatus = signal<{ readyCount: number; totalCount: number } | null>(null);
  roundEndTime = signal<number | null>(null);
  roundDurationSeconds = signal<number | null>(null);
  roundEnded = signal(false);
  roundPaused = signal(false)
  votingStarted = signal(false);
  votingPlayers = signal<{ id: string; name: string }[]>([]);
  finalResults = signal<{ location: string; spyNames: string[]; voteTally: { name: string; count: number }[] } | null>(null);
  lobbyReturnStatus = signal<{ count: number; total: number } | null>(null);
  locationPool = signal<string[]>([]);

  constructor() {
    this.socket = io(environment.socketUrl);
    this.socket.on('room-created', (data: { roomCode: string; players: { id: string; name: string }[]; hostId: string }) => {
      this.roomCode.set(data.roomCode);
      this.players.set(data.players);
      this.hostId.set(data.hostId);
      this.saveLastRoom(data.roomCode);
    });

    this.socket.on('players-updated', (data: { players: { id: string; name: string }[]; hostId: string }) => {
      this.players.set(data.players);
      this.hostId.set(data.hostId);
    });

    this.socket.on('join-error', (message: string) => {
      this.joinError.set(message);
      setTimeout(() => this.joinError.set(null), 3000);
    });

    this.socket.on('room-joined', (data: { roomCode: string; players: { id: string; name: string }[]; hostId: string }) => {
      this.roomCode.set(data.roomCode);
      this.players.set(data.players);
      this.hostId.set(data.hostId);
      this.saveLastRoom(data.roomCode);
    });

    this.socket.on('role-assigned', (data: { isSpy: boolean; location?: string }) => {
      this.roleData.set(data);
    });

    this.socket.on('ready-status', (data: { readyCount: number; totalCount: number }) => {
      this.readyStatus.set(data);
    });

    this.socket.on('round-started', (data: { endTime: number; durationSeconds: number }) => {
      this.roundEndTime.set(data.endTime);
      this.roundDurationSeconds.set(data.durationSeconds);
    });

    this.socket.on('round-paused', () => {
      this.roundPaused.set(true);
    });

    this.socket.on('round-resumed', (data: { endTime: number }) => {
      this.roundPaused.set(false);
      this.roundEndTime.set(data.endTime);
    });

    this.socket.on('voting-started', (data: { players: { id: string; name: string }[] }) => {
      this.votingStarted.set(true);
      this.votingPlayers.set(data.players);
    });

    this.socket.on('round-ended', (data: { location: string; spyNames: string[]; voteTally: { name: string; count: number }[] }) => {
      this.roundEnded.set(true);
      this.finalResults.set(data);
    });

    this.socket.on('connect', () => {
      const lastRoom = localStorage.getItem('spyfall-last-room');
      if (lastRoom) {
        this.socket.emit('rejoin', { playerId: this.playerId, roomCode: lastRoom });
      }
    });

    this.socket.on('rejoin-failed', () => {
      this.clearLastRoom();
      this.resetLocalState();
    });

    this.socket.on('lobby-return-status', (data: { count: number; total: number }) => {
      this.lobbyReturnStatus.set(data);
    });

    this.socket.on('location-pool', (data: { locations: string[] }) => {
      this.locationPool.set(data.locations);
    });
  }

  private getOrCreatePlayerId(): string {
    let id = localStorage.getItem('spyfall-player-id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('spyfall-player-id', id);
    }
    return id;
  }

  private saveLastRoom(roomCode: string) {
    localStorage.setItem('spyfall-last-room', roomCode);
  }

  private clearLastRoom() {
    localStorage.removeItem('spyfall-last-room');
  }

  playerId = this.getOrCreatePlayerId();

  createRoom(playerName: string) {
    this.socket.emit('create-room', { playerName, playerId: this.playerId });
  }

  joinRoom(roomCode: string, playerName: string) {
    this.socket.emit('join-room', { roomCode, playerName, playerId: this.playerId });
  }

  startGame(spyCount: number, roundMinutes: number, locations: string[]) {
    this.socket.emit('start-game', { spyCount, roundMinutes, locations });
  }

  pauseRound() {
    this.socket.emit('pause-round');
  }

  resumeRound() {
    this.socket.emit('resume-round');
  }

  endRound() {
    this.socket.emit('end-round');
  }

  castVote(votedForPlayerId: string) {
    this.socket.emit('cast-vote', { votedForPlayerId });
  }

  confirmBackInLobby() {
    this.socket.emit('return-to-lobby');
  }

  setReady() {
    this.socket.emit('player-ready');
  }

  get mySocketId(): string | undefined {
    return this.socket.id;
  }

  leaveRoom() {
    this.socket.emit('leave-room');
    this.resetLocalState();
    this.clearLastRoom();
  }

  private resetRoundState() {
    this.roleData.set(null);
    this.readyStatus.set(null);
    this.roundEndTime.set(null);
    this.roundDurationSeconds.set(null);
    this.roundEnded.set(false);
    this.roundPaused.set(false);
    this.votingStarted.set(false);
    this.votingPlayers.set([]);
    this.finalResults.set(null);
    this.locationPool.set([]);
  }

  private resetLocalState() {
    this.roomCode.set(null);
    this.players.set([]);
    this.hostId.set(null);
    this.resetRoundState();
  }

  returnToLobby() {
    this.resetRoundState();
  }
}
