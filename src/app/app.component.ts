import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { KeyValue } from '@angular/common';
import { Subject, Observable, timer, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataService } from './shared/services/data.service';
import { GameSetting } from './shared/interfaces/game-setting.interface';
import { Field } from './shared/interfaces/field.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Game in dots';
  gameModes: GameSetting | any;
  isStarted = false;
  indexOfPaintedBox: number;
  fields: Field[] = [];
  form = new FormGroup({
    gamemode: new FormControl('', Validators.required),
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  timerObs$: Observable<any>;
  stopGame$: Subscription;
  onDestoy$ = new Subject();

  constructor(
    private dataService: DataService,
    private changeDetectRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.dataService.getGameSettings().subscribe(gameModes => this.gameModes = gameModes);
    this.gamemode.valueChanges.pipe(takeUntil(this.onDestoy$))
        .subscribe(data => this.isStarted = false);
  }

  get username() { return this.form.get('username'); }

  get gamemode() { return this.form.get('gamemode'); }

  onSubmit() {
    if (this.form.valid) {
      this.isStarted = true;
      const fieldCount = this.gamemode.value.field;
      this.generateFields(Math.pow(fieldCount, 2));
      this.startGame();
    }
  }

  generateFields(fieldCount: number) {
    const fields = [];
    let i = 0;
    while (i < fieldCount) {
      fields.push({ id: i + 1, isSelected: false, isRight: false, isActive: false });
      i++;
    }
    this.fields = fields;
  }

  startGame() {
    const gameSettingDelay = this.gamemode.value.delay;
    this.timerObs$ = timer(0, gameSettingDelay);
    this.stopGame$ = this.timerObs$.subscribe(() => {
      const notMarkedFields = this.fields.filter(item => !item.isSelected);
      if (notMarkedFields.length) {
        const index = this.getRandomInt(notMarkedFields.length);
        this.indexOfPaintedBox = this.fields.findIndex(item => item.id === notMarkedFields[index].id);
        this.changeDetectRef.detectChanges();
      } else {
        this.stopGame$.unsubscribe();
        alert('Game is ended!');
      }
    });
  }

  onSelect(index: number) {
    if (!this.fields[index].isSelected) {
      this.fields[index].isSelected = true;
      this.fields[index].isRight = this.indexOfPaintedBox === index;
    }
  }

  getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  originalOrder = (a: KeyValue<string, object>, b: KeyValue<string, object>): number => {
    return 0;
  }

  identify(index, item) {
    return item.id;
  }

  getFieldsContainerWidth() {
    return this.gamemode.value.field * 52 + 'px';
  }

  ngOnDestroy() {
    this.onDestoy$.next();
    this.onDestoy$.complete();
  }
}
