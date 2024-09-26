import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { GuestBookModel } from '../models/guestbook.model';
import { GunService } from './gun.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = `${environment.apiUrl}/GuestBook`;

  constructor(private http: HttpClient, private gunService: GunService) { }

  // Fetch all messages from Firebase
  getAllMessages(): Observable<GuestBookModel[]> {
    return this.http.get<GuestBookModel[]>(`${this.apiUrl}/Allmessages`).pipe(
      // Remove sync function and directly handle messages
      tap(messages => {
        if (Array.isArray(messages)) {
          this.sendMessagesToGunDB(messages);
        } else if (typeof messages === 'object' && messages !== null) {
          const messageArray = this.objectToArray(messages);
          this.sendMessagesToGunDB(messageArray);
        } else {
          console.error('Unexpected messages format:', messages);
        }
      }),
      catchError(this.handleError('fetching all messages'))
    );
  }

  // Add a message to Firebase and sync it with GunDB
  addMessage(entry: GuestBookModel): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/Users/${entry.UserId}/Messages/${entry.MessageId}`, entry).pipe(
      tap(() => this.gunService.sendMessage(entry)),
      catchError(this.handleError('adding message to Firebase'))
    );
  }

  // Send messages to GunDB
  private sendMessagesToGunDB(messages: GuestBookModel[]): void {
    messages.forEach(message => {
      this.gunService.sendMessage(message);
    });
  }

  // Utility function to convert an object to an array
  private objectToArray(obj: any): GuestBookModel[] {
    return Object.keys(obj).map(key => ({ ...obj[key], MessageId: key }));
  }

  private handleError(action: string) {
    return (error: any): Observable<never> => {
      console.error(`Error ${action}:`, error);
      return throwError(error);
    };
  }
}
