import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { KeyValue } from '@angular/common';
import { Subject, Observable, timer, Subscription, zip } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataService } from './shared/services/data.service';
import { HelperService } from './shared/services/helper.service';
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
  gameModes: IGameSetting | any;
  isStarted = false;
  indexOfPaintedBox = -1;
  fields: IField[] = [];
  fieldsContainerWidth: string;
  displayedColumns = ['position', 'name', 'date'];
  dataSource = new LiveDataSource();
  userPoint = 0;
  computerPoint = 0;
  message = '';
  form = new FormGroup({
    gamemode: new FormControl('', Validators.required),
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  timerObs$: Observable<any>;
  stopGame$: Subscription;
  onDestroy$ = new Subject();

  constructor(
    private dataService: DataService,
    private helperService: HelperService,
    private changeDetectRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const data: Observable<[IGameSetting, IWinner[]]> = zip(
      this.dataService.getGameSettings(),
      this.dataService.getWinners()
    );
    data.pipe(takeUntil(this.onDestroy$))
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
      this.reset();
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
      fields.push({ id: i + 1, isSelected: false, isRight: false });
      i++;
    }
    this.fields = fields;
  }

  startGame() {
    const gameSettingDelay = this.gamemode.value.delay;
    this.timerObs$ = timer(0, gameSettingDelay);
    this.stopGame$ = this.timerObs$.subscribe(() => {
      this.checkForUserSelection();
      const hasWinner = this.userPoint > this.fields.length / 2 || this.computerPoint > this.fields.length / 2;
      if (hasWinner) {
        this.stopGame$.unsubscribe();
        const winnerName = this.userPoint > this.computerPoint ? this.username.value : 'Computer';
        this.message = `Winner is ${winnerName} (${winnerName}- ${this.userPoint}/ Computer- ${this.computerPoint})!`;
        const winnerData = {
          id: 0,
          winner: winnerName,
          date: this.fetchDate()
        };
        this.sendWinner(winnerData);
      } else {
        const notMarkedFields = this.fields.filter(item => !item.isSelected);
        const index = this.helperService.getRandomInt(notMarkedFields.length);
        this.indexOfPaintedBox = this.fields.findIndex(item => item.id === notMarkedFields[index].id);
      }
      this.changeDetectRef.detectChanges();
    });
  }

  sendWinner(winnerData: IWinner) {
    this.dataService.addWinner(winnerData)
        .subscribe((data: IWinner[] | any) => this.dataSource.data.next(data));
  }

  onSelect(index: number) {
    if (this.indexOfPaintedBox === index) {
      this.fields[index].isSelected = true;
      this.fields[index].isRight = true;
      this.userPoint++;
    } else {
      this.fields[this.indexOfPaintedBox].isSelected = true;
      this.computerPoint++;
    }
  }

  checkForUserSelection() {
    if (this.fields[this.indexOfPaintedBox] && !this.fields[this.indexOfPaintedBox].isSelected) {
      this.fields[this.indexOfPaintedBox].isSelected = true;
      this.computerPoint++;
    }
  }

  reset() {
    if (this.stopGame$) {
      this.stopGame$.unsubscribe();
    }
    this.message = '';
    this.fields = [];
    this.fieldsContainerWidth = '0px';
    this.indexOfPaintedBox = -1;
    this.userPoint = 0;
    this.computerPoint = 0;
  }

  fetchDate() {
    return this.helperService.parseDate(new Date());
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
