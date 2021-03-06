import { Injectable } from '@angular/core';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }

  parseDate(d: Date) {
    const minutes = d.getMinutes() > 9 ? d.getMinutes() : `0${d.getMinutes()}`;
    const time = d.getHours() + ':' + minutes;
    const day = d.getDay() > 9 ? d.getDay() : `0${d.getDay()}`;
    const monthName = MONTHS[d.getMonth()];
    const year = d.getFullYear();
    return `${time}; ${day} ${monthName} ${year}`;
  }

  getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }
}
