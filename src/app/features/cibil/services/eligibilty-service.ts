import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EligibiltyService {
constructor(private Http:HttpClient){

}
url='http://localhost:8080/api/v1/eligibility/customer/{customerId}';

getElibilityDetails(customerId:any){

  return this.Http.get(this.url.replace('{customerId}',customerId.toString()));

}
    url1 = 'http://localhost:8080/api/v1/eligibility/officer/{eligibilityId}/approve';

getEligibiltyApproved(eligibilityId: number) {
  return this.Http.put(
    this.url1.replace('{eligibilityId}', eligibilityId.toString()),
    {}
  );
}

url2 = 'http://localhost:8080/api/v1/eligibility/officer/{eligibilityId}/reject';

getEligibiltyReject(eligibilityId: number, rejectionReason: string) {
  return this.Http.put(
    this.url2.replace('{eligibilityId}', eligibilityId.toString()),
    { rejectionReason }
  );
}

url3='http://localhost:8080/api/v1/eligibility/officer/pending';

getPendingDetails(){
  return this.Http.get(this.url3);
}

}






