import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IGameSetting } from '../interfaces/game-setting.interface';
import { IWinner } from '../interfaces/winner.interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  readonly API_SERVER = 'https://starnavi-frontend-test-task.herokuapp.com/';

  constructor(private http: HttpClient) { }

  getGameSettings(): Observable<IGameSetting> {
    return this.http.get<IGameSetting>(this.API_SERVER + 'game-settings');
  }

  getWinners(): Observable<IWinner[]> {
    return this.http.get<IWinner[]>(this.API_SERVER + 'winners');
  }

  addWinner(winner: IWinner): Observable<IWinner> {
    return this.http.post<IWinner>(this.API_SERVER + 'winners', winner);
  }
}
