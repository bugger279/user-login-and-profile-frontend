import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

export interface UserDetails {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  exp: number;
  iat: number;
}

interface TokenResponse {
  token: string;
}

export interface TokenPayload {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  private  token: string;
  constructor(private http: HttpClient, private router: Router) { }

  private saveToken(token: string): void {
    localStorage.setItem('usertoken', token);
    this.token = token;
  }

  private getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('usertoken');
    }
    return this.token;
  }

  getuserDetails(): UserDetails {
    const token = this.getToken();
    let payload;
    if (token) {
        payload = token.split('.')[1];
        payload = window.atob(payload);
        return JSON.parse(payload);
    } else {
      return null;
    }
  }

  /**
   * isLoggedIn
   */
  public isLoggedIn(): boolean {
    const user = this.getuserDetails();
    if (user) {
      return user.exp > Date.now() / 1000;
    } else {
      return false;
    }
  }

  /**
   * register
   */
  public register(user: TokenPayload): Observable<any> {
    const base = this.http.post('/users/register', user);
    const  request = base.pipe(
      map((data: TokenResponse) => {
        if (data.token) {
          this.saveToken(data.token);
        }
        return data;
      })
    );
    return  request;
  }

  /**
   * login
   */
  public login(user: TokenPayload): Observable<any> {
    const base = this.http.post('/users/login', user);
    const  request = base.pipe(
      map((data: TokenResponse) => {
        if (data.token) {
          this.saveToken(data.token);
        }
        return data;
      })
    );
    return  request;
  }

  /**
   * profile
   */
  public profile(): Observable<any> {
    return this.http.get('/users/profile', {
      headers: { Authorization:  `${this.getToken()}` }
    });
  }

  /**
   * logout
   */
  public logout(): void {
    this.token = '';
    window.localStorage.removeItem('usertoken');
    // this.router.navigate[('/')];
    this.router.navigateByUrl('/');
  }
}
