import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CmsApiService {

  private API_URL;
  public IMAGE_API_URL;
  public UI_URL;

  private getHeaders(isFormData: boolean = false): HttpHeaders {
    let headers = new HttpHeaders();
    isFormData
      ? headers.set('Content-Type', 'multipart/form-data')
      : headers.set('Content-Type', 'application/json');

    return headers;
  }

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.API_URL = this.configService.get('API_URL');
    this.IMAGE_API_URL = this.configService.get('IMAGE_API_URL');
    this.UI_URL = this.configService.get('UI_URL') ?? '';
  }


  createRole(role: any): Observable<any> {

    return this.http.post(
      `${this.API_URL}/Account/CreateRole`,
      role
    );
  }

  PostRequest(
    url: string,
    data: any,
    isFormData: boolean = false
  ): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/${url}`, data, {
      headers: this.getHeaders(isFormData),
    });
  }

  PutRequest(
    url: string,
    data: any,
    isFormData: boolean = false
  ): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${url}`, data, {
      headers: this.getHeaders(isFormData),
    });
  }

  GetRequest(url: string, params?: unknown): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${url}`, {
      headers: this.getHeaders(),
    });
  }

  DeleteRequest(url: string, id: any): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/${url}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  login(model: any): Observable<any> {

    return this.http.post<any>(
      `${this.API_URL}/Account/Login`,
      model
    );
  }

  forgotPassword(email: any): Observable<any> {
    return this.http.post<any>(
      `${this.API_URL}/Account/ForgotPassword?email=${encodeURIComponent(email)}`,
      email
    );
  }

  resetPassword(model: any): Observable<any> {
    return this.http.post<any>(
      `${this.API_URL}/Account/ResetPassword`,
      model
    );
  }


}
