import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, from, Subject, Subscription } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { GuestBookModel } from '../models/guestbook.model';
import Gun from 'gun';
import { AuthService } from './auth.service';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { format } from 'date-fns';

@Injectable({
  providedIn: 'root',
})
export class GuestBookService {
  private apiUrl = `${environment.apiUrl}/GuestBook`;
  private messagesSubject = new BehaviorSubject<GuestBookModel[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  private messageSubject = new Subject<GuestBookModel>();
  private gun: any;
  private gun_node = "GuestBook1";

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private db: AngularFireDatabase
  ) {
    this.initGun();
    this.setupMessageListener();
  }

  private initGun(): void {
    const peerRelays = ['https://gun-relay-server-zk8u.onrender.com/gun'];
    this.gun = Gun({ peers: peerRelays, localStorage: true, retry: Infinity });
  }

  private sendMessageToGunDB(message: GuestBookModel): void {
    message.DatePosted = new Date().toISOString();
    this.gun.get(this.gun_node).set(message, (ack: any) => {
      if (ack.err) {
        console.error('Error sending message to GunDB:', ack.err);
      } else {
        console.log('Message sent successfully to GunDB:', ack);
      }
    });
  }

  addMessage(entry: GuestBookModel): Observable<void> {
    return this.authService.currentUser$.pipe(
      map(user => {
        if (!user) throw new Error('User must be logged in to send a message');
        return {
          ...entry,
          UserId: user.uid,
          GitHubUsername: user.name || 'Guest',
          ProfilePicUrl: user.photoURL || '',
          DatePosted: new Date(),
          IsApproved: false,
        };
      }),
      tap(message => {
        this.messagesSubject.next([...this.messagesSubject.value, message]);
        this.sendMessageToGunDB(message);
      }),
      switchMap(message => this.saveMessageToFirebase(message)),
      catchError(this.handleError('adding message')),
      map(() => void 0)
    );
  }

  getAllMessages(): Observable<GuestBookModel[]> {
    return new Observable<GuestBookModel[]>(observer => {
      const messages: GuestBookModel[] = [];
      this.gun.get(this.gun_node).map().once((message: GuestBookModel, key: string) => {
        if (message) {
          message.MessageId = key;
          message.DatePosted = this.parseData(message.DatePosted);
          messages.push(message);
        }
      });

      setTimeout(() => {
        observer.next(messages);
        observer.complete();
        this.messagesSubject.next(messages);
      }, 1000);
    }).pipe(
      catchError(this.handleError('fetching messages from GunDB'))
    );
  }

  private parseData(dateInput: string | Date): string {
    let date: Date;

    if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    } else {
      date = dateInput;
    }

    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return format(date, 'MMM d, yyyy h:mm a');
  }

  public saveMessageToFirebase(entry: GuestBookModel): Observable<void> {
    return this.authService.currentUser$.pipe(
      switchMap(user => {
        const userId = user?.uid;
        const newMessageRef = this.db.list(`Guestbook/${userId}/messages`).push(entry);
        const messageId = newMessageRef.key;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);

        return from(this.db.object(`Guestbook/${userId}/messages/${messageId}`).update({
          ...entry,
          MessageId: messageId,
          expirationDate: expirationDate.toISOString(),
        }));
      }),
      catchError(this.handleError('saving message to Firebase'))
    );
  }

  private handleError(action: string) {
    return (error: any): Observable<never> => {
      console.error(`Error ${action}:`, error);
      return throwError(() => new Error(error));
    };
  }

  private setupMessageListener(): void {
    this.gun.get(this.gun_node).map().on((message: GuestBookModel, key: string) => {
      if (message) {
        message.MessageId = key;
        message.DatePosted = new Date(message.DatePosted).toISOString();
        const existingMessage = this.messagesSubject.value.find(m => m.MessageId === message.MessageId);
        if (!existingMessage) {
          this.messagesSubject.next([...this.messagesSubject.value, message]);
          this.messageSubject.next(message);
        }
      }
    });
  }

  public onMessage(callback: (message: GuestBookModel) => void): Subscription {
    return this.messageSubject.subscribe(callback);
  }

  private mapDataToMessageModel(data: any): GuestBookModel {
    return {
      DatePosted: data.DatePosted,
    } as GuestBookModel;
  }
}
