// id-generator.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IdGeneratorService {
  generateMessageId(): string {
    return 'MSG_' + Math.random().toString(36).substr(2, 9);
  }
}
