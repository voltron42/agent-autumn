import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorPrinterService {

  constructor() { }

  printError(error:any):void {
    console.log(error);
  }
}
