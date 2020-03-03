import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { KeyValue } from '@angular/common';
import { Subject, Observable, timer, Subscription, zip } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataService } from './shared/services/data.service';
import { IGameSetting } from './shared/interfaces/game-setting.interface';
import { IField } from './shared/interfaces/field.interface';
import { IWinner } from './shared/interfaces/winner.interface';
import { LiveDataSource } from './shared/utils/live-datasource';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Game in dots';
  gameModes!: IGameSetting;
  isStarted = false;
  indexOfPaintedBox: number;
  fields: IField[] = [];
  fieldsContainerWidth: string;
  displayedColumns = ['position', 'name', 'date'];
  dataSource = new LiveDataSource();
  form = new FormGroup({
    gamemode: new FormControl('', Validators.required),
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  timerObs$: Observable<any>;
  stopGame$: Subscription;
  onDestroy$ = new Subject();

  constructor(
    private dataService: DataService,
    private changeDetectRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const data: Observable<[IGameSetting, IWinner[]]> = zip(
      this.dataService.getGameSettings(),
      this.dataService.getWinners()
    );
    data.pipe( takeUntil(this.onDestroy$) )
        .subscribe(([gameModes, winners]: [IGameSetting, IWinner[]]) => {
          this.gameModes = gameModes;
          this.dataSource.data.next(winners);
        });

    this.gamemode.valueChanges.pipe(takeUntil(this.onDestroy$))
        .subscribe(() => this.isStarted = false);
  }

  get username() { return this.form.get('username'); }

  get gamemode() { return this.form.get('gamemode'); }

  onSubmit() {
    if (this.form.valid) {
      this.isStarted = true;
      const fieldCount = this.gamemode.value.field;
      this.fieldsContainerWidth = fieldCount * 52 + 'px';
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

  trackByFn(index, item) {
    return index;
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
