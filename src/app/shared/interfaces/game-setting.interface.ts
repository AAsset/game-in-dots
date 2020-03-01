export interface GameSetting {
  easyMode: Mode;
  normalMode: Mode;
  hardMode: Mode;
}

export interface Mode {
  field: number;
  delay: number;
}
