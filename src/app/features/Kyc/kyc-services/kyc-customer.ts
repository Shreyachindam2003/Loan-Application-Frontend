
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class KycCustomer {

  constructor(private http: HttpClient) {}

  url = 'http://localhost:8080/api/v1/kyc/customers/';

  uploadDocument(userId: number, formData: FormData) {
    return this.http.post(
      this.url + userId + '/documents',
      formData
    );
  }

  getDocuments(userId: number) {
    return this.http.get(
      this.url + userId + '/documents'
    );
  }

  getDocumentDetails(userId: number, documentId: number) {
    return this.http.get(
      this.url + userId + '/documents/' + documentId
    );
  }
  viewDocument(userId: number, documentId: number) {
    return this.http.get(
      this.url + userId + '/documents/' + documentId + '/view',
      { responseType: 'blob' }
    );
  }

  deleteDocument(userId: number, documentId: number) {
    return this.http.delete(
      this.url + userId + '/documents/' + documentId
    );
  }

}
