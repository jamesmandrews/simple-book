import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  private printRequestedSubject = new Subject<void>();
  public printRequested$ = this.printRequestedSubject.asObservable();

  requestPrint(): void {
    this.printRequestedSubject.next();
  }
}
