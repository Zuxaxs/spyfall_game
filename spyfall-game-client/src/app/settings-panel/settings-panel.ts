import { Component, inject, signal } from '@angular/core';
import { Game } from '../game';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings-panel',
  imports: [],
  templateUrl: './settings-panel.html',
  styleUrl: './settings-panel.css',
})
export class SettingsPanel {
  game = inject(Game);
  router = inject(Router);
  newLocationName = signal('');

  addLocation() {
    this.game.addLocation(this.newLocationName());
    this.newLocationName.set('');
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
