import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class StringsService {
  private readonly httpClient: HttpClient;
  private readonly strings: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
    this.httpClient.get<string[]>('/strings').subscribe((strings) => {
      this.strings.next(strings);
    });
  }

  getStrings(): Observable<string[]> {
    return this.strings;
  }
}
