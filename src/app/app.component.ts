import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataService } from './shared/services/data.service';
import { GameSetting } from './shared/interfaces/game-setting.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Game in dots';
  gameModes!: GameSetting;
  form = new FormGroup({
    gamemode: new FormControl('', Validators.required),
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.getGameSettings().subscribe(gameModes => this.gameModes = gameModes);
  }

  get username() { return this.form.get('username'); }

  get gamemode() { return this.form.get('gamemode'); }

  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}
