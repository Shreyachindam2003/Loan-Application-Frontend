import { HttpClient } from '@angular/common/http';
import { Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CibilScoreService {

constructor(private http: HttpClient) { }



url='http://localhost:8080/api/v1/cibil/customer/{customerId}/details'

getCibilReport(CustomerId:any) {
    
  return this.http.get(this.url.replace('{customerId}',CustomerId.toString()));
}


url1='http://localhost:8080/api/v1/cibil/customer/{customerId}/calculate';

getCibilScore(CustomerId:any) {
    return this.http.post(
        this.url1.replace('{customerId}',CustomerId.toString()),
 {}
    );
}

}