import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { MarketplaceGroupModel } from '@app/shared/models/marketplace-group.model';
import { CommonIntentsStorageService } from '@app/shared/services/common-intents-storage.service';
import { CommonIntentsModel } from '@app/shared/models/common-intents.model';
import { Intent } from '@app/intents/intent.model';

@Injectable({
  providedIn: 'root'
})
export class CommonIntentsService {
  constructor(private httpClient: HttpClient, private commonIntentsHttpService: CommonIntentsStorageService) {}

  /**
   * Get common intents via API and set the modal and return as an observable
   */
  list(name: string = '', pageSize: number = 1000) {
    const agent = JSON.parse(localStorage.getItem('agent'));
    const searchContext = {
      name: name,
      type: 2,
      agentId: agent.id,
      pageSize: pageSize
    };
    return this.commonIntentsHttpService.list(searchContext).pipe(
      map((response: any) => {
        return response.data.intents.map((data: any) => {
          return new CommonIntentsModel().deserialize(data);
        });
      })
    );
  }

  /**
   * Get a single common intent details
   * @param id
   */
  get(id: number) {
    return this.commonIntentsHttpService.view(id).pipe(
      map((response: [Response]) => {
        return new MarketplaceGroupModel().deserialize(response);
      })
    );
  }

  /**
   * Create API request
   * @param intent
   */
  create(intent: CommonIntentsModel) {
    return this.commonIntentsHttpService.create(intent);
  }

  /**
   * Delete API request
   * @param id
   */
  delete(id: number) {
    return this.commonIntentsHttpService.delete(id);
  }

  /**
   * Update API request
   * @param data
   * @param id
   */
  update(data: any, id: number) {
    return this.commonIntentsHttpService.update(id, data);
  }
}
