import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Game {
  locations = signal<string[]>(['Flughafen', 'Krankenhaus', 'Schule', 'Strand', 'U-Bahn', 'Restaurant']);

  currentLocation = signal<string | null>(null);
  spyIndexes = signal<number[]>([]);
  playerCount = signal(0);
  spyCount = signal(0)
  roundDurationSeconds = signal(8 * 60);
  playerNames = signal<string[]>([]);

  constructor() {
    const saved = localStorage.getItem('spyfall-locations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 ) {
          this.locations.set(parsed);
        }
      } catch {
        //Kaputte Daten im Client-Speicher -> bei Standartdaten bleiben
      }
    }

    effect(() => {
      localStorage.setItem('spyfall-locations', JSON.stringify(this.locations()));
    })
  }


  recommendedSpyCount(playerCount: number): number {
    if (playerCount <= 8) return 1;
    if (playerCount <= 11) return 2;
    if (playerCount <= 15) return 3;
    return 4;
  }

  addLocation(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (this.locations().some(l => l.toLowerCase() === trimmed.toLowerCase())) return;
    this.locations.set([...this.locations(), trimmed]);
  }

  updateLocation(index: number, name:string){
    const trimmed = name.trim();
    if (!trimmed) return;
    const updated = [...this.locations()];
    updated[index] = trimmed;
    this.locations.set(updated);
  }

  removeLocation(index: number) {
    if (this.locations().length <= 3) return;
    const updated = [...this.locations()];
    updated.splice(index, 1);
    this.locations.set(updated);
  }

  startRound(playerCount: number, spyCount: number, roundMinutes: number, playerNames: string[]): void {
    if (playerCount < 3 || playerCount > 20) {
      console.log('Ungültige Spieleranzahl!');
      return;
    }
    if (spyCount < 1 || spyCount >= playerCount) {
      console.log('Ungültige Spionanzahl!');
      return;
    }
    if (roundMinutes < 1 || roundMinutes > 30) {
      console.log('Ungültige Rundendauer!');
      return;
    }

    this.playerCount.set(playerCount);
    this.spyCount.set(spyCount);
    this.roundDurationSeconds.set(roundMinutes * 60);
    this.playerNames.set(playerNames);

    const randomLocation = this.locations()[Math.floor(Math.random() * this.locations().length)];
    const spyIndexSet = new Set<number>();

    while (spyIndexSet.size < spyCount) {
      spyIndexSet.add(Math.floor(Math.random() * playerCount));
    }

    this.currentLocation.set(randomLocation);
    this.spyIndexes.set([...spyIndexSet]);
  }
}
