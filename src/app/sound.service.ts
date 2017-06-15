import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class SoundService {

  constructor(private http: Http) { }

  getSounds(): Promise<string[]> {
    return this.http.get('/api/sounds')
      .toPromise()
      .then((response) => {
        return response.json() as string[];
      })
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
