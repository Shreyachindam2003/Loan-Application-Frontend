
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VerifyKycOfficer {

  constructor(private http: HttpClient) {}

  url = 'http://localhost:8080/api/v1/kyc/officer/pending';
  url1 = 'http://localhost:8080/api/v1/kyc/officer/documents/';

  getListCustomers() {
    return this.http.get(this.url);
  }

  getDocumentDetails(documentId: number) {
    return this.http.get(this.url1 + documentId);
  }

  viewDocument(documentId: number) {
    return this.http.get(
      this.url1 + documentId + '/view',
      { responseType: 'blob' }
    );
  }

  reviewDocument(documentId: number, data: any) {
    return this.http.put(
      this.url1 + documentId + '/review',
      data
    );
  }

}
