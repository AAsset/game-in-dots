import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameSetting } from '../interfaces/game-setting.interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  readonly API_SERVER = 'https://starnavi-frontend-test-task.herokuapp.com/';

  constructor(private http: HttpClient) { }

  getGameSettings(): Observable<GameSetting> {
    return this.http.get<GameSetting>(this.API_SERVER + 'game-settings');
  }
}
