import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GithubAuthProvider, signOut, User } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(private auth: Auth, private http: HttpClient) {
    // Set up user observable to track authentication state
    this.user$ = new Observable<User | null>(observer => {
      const unsubscribe = this.auth.onAuthStateChanged(user => {
        observer.next(user);
      });
      return () => unsubscribe();
    });
  }

  async loginWithGitHub(): Promise<void> {
    const provider = new GithubAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      const token = await result.user?.getIdToken();

      // Call your backend to log in the user
      await this.http.post(`${environment.apiUrl}/auth/login`, { token }).toPromise();
    } catch (error) {
      console.error('GitHub sign-in error:', error);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      // Call your backend to log out the user
      await this.http.post(`${environment.apiUrl}/auth/logout`, {}).toPromise();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  isLoggedIn(): Observable<boolean> {
    return this.user$.pipe(map(user => !!user));
  }

  getCurrentUser(): Observable<User | null> {
    return this.user$.pipe(
      catchError(error => {
        console.error('Error fetching user:', error);
        return of(null);
      })
    );
  }
}
