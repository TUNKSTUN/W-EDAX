import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GithubAuthProvider, getAuth, signInWithPopup, signOut } from 'firebase/auth';
import { environment } from '../../environments/environment';

interface UserResponse {
  uid: string;
  name: string;
  photoURL: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<UserResponse | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private afAuth: AngularFireAuth, private http: HttpClient) {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.setCurrentUser({
          uid: user.uid,
          name: user.displayName || 'Guest',
          photoURL: user.photoURL || ''
        });
      } else {
        this.setCurrentUser(null);
      }
    });
  }

  setCurrentUser(user: UserResponse | null): void {
    this.currentUserSubject.next(user);
  }

  // Sign in with GitHub
  loginWithGitHub(): Observable<void> {
    const provider = new GithubAuthProvider();
    const auth = getAuth();

    return new Observable<void>(observer => {
      signInWithPopup(auth, provider)
        .then(result => {
          if (result.user) {
            const user = result.user;

            // Log the entire user object to check the details
            console.log('GitHub User Info:', user);

            // Handle successful login and set user info
            this.setCurrentUser({
              uid: user.uid,
              name: user.displayName || 'Guest',
              photoURL: user.photoURL || ''
            });

            // Log specific user details for additional debugging
            console.log(`User UID: ${user.uid}`);
            console.log(`User Name: ${user.displayName}`);
            console.log(`User PhotoURL: ${user.photoURL}`);

            observer.next();
            observer.complete();
          } else {
            observer.error('No user found');
          }
        })
        .catch(error => {
          console.error('GitHub login error:', error);
          observer.error(error);
        });
    });
  }


  // Sign out
  logout(): Observable<void> {
    return new Observable<void>(observer => {
      signOut(getAuth())
        .then(() => {
          this.setCurrentUser(null);
          observer.next();
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  // Get the current user's UID
  getUserUID(): Observable<string | null> {
    return this.currentUser$.pipe(
      map(user => user ? user.uid : null) // Return null instead of empty string
    );
  }
  isAuthenticated(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => !!user) // Returns true if user is authenticated, false otherwise
    );
  }

}
