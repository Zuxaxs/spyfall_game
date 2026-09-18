import { Routes } from '@angular/router';
import { LocalSetup} from './local-setup/local-setup';
import { OnlineLobby } from './online-lobby/online-lobby';
import { StartScreen } from './start-screen/start-screen';
import { RoleReveal } from './role-reveal/role-reveal';
import { GameScreen } from './game-screen/game-screen';
import { ResultScreen } from './result-screen/result-screen';
import { SettingsPanel } from './settings-panel/settings-panel';
import { OnlineReveal } from './online-reveal/online-reveal';
import { OnlineGameScreen } from './online-game-screen/online-game-screen';
import { OnlineVoting } from './online-voting/online-voting';
import { OnlineResult } from './online-result/online-result';

export const routes: Routes = [
    { path: '', component: StartScreen},
    { path: 'local-setup', component: LocalSetup},
    { path: 'online-lobby', component: OnlineLobby},
    { path: 'reveal', component: RoleReveal},
    { path: 'game', component: GameScreen},
    { path: 'result', component: ResultScreen},
    { path: 'settings', component: SettingsPanel },
    { path: 'online-reveal', component: OnlineReveal},
    { path: 'online-game-screen', component: OnlineGameScreen},
    { path: 'online-voting', component: OnlineVoting},
    { path: 'online-result', component: OnlineResult},
];
