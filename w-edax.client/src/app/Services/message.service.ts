import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Ensure environment configuration is correct
import { GuestBookModel } from '../models/guestbook.model.'; // Ensure the model file is correctly imported

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private apiUrl = `${environment.apiUrl}/GuestBook`; // Ensure the API URL is correct

  constructor(private http: HttpClient) { }

  // Get all guest book entries
  getMessages(): Observable<GuestBookModel[]> {
    return this.http.get<GuestBookModel[]>(this.apiUrl);
  }

  // Add a new guest book entry
  addMessage(entry: GuestBookModel): Observable<void> {
    return this.http.post<void>(this.apiUrl, entry);
  }
}
