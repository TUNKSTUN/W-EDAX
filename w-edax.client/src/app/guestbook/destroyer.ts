// destroyer.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import Gun from 'gun/gun';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DestroyerService {
  private apiUrl = `${environment.apiUrl}/GuestBook`;
  private gun = Gun(['https://gun-manhattan.herokuapp.com/gun']); // Initialize GunDB with relay

  constructor(private http: HttpClient) { }

  deleteAllMessages(): Observable<void> {
    return this.deleteAllMessagesFromFirebase().pipe(
      switchMap(() => this.deleteAllMessagesFromGunDB()),
      catchError(error => {
        console.error('Error deleting all messages:', error);
        return of(void 0);
      })
    );
  }

  private deleteAllMessagesFromFirebase(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Messages`).pipe(
      catchError(error => {
        console.error('Error deleting messages from Firebase:', error);
        return of(void 0);
      })
    );
  }

  private deleteAllMessagesFromGunDB(): Observable<void> {
    return new Observable<void>(observer => {
      const chat = this.gun.get('world-chat');
      chat.map().once((message) => {
        chat.get(message.MessageId).put(null); // Delete message from GunDB
      });
      observer.next();
      observer.complete();
    });
  }
}
