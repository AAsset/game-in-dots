export interface IGameSetting {
  easyMode: Mode;
  normalMode: Mode;
  hardMode: Mode;
}

export interface IMode {
  field: number;
  delay: number;
}
