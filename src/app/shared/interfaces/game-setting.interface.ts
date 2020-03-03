export interface IGameSetting {
  easyMode: IMode;
  normalMode: IMode;
  hardMode: IMode;
}

export interface IMode {
  field: number;
  delay: number;
}
