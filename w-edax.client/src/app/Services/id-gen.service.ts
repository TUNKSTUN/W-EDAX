// id-generator.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IdGeneratorService {
  generateMessageId(): string {
    let messageId = 'MSG_' + Math.random().toString(8).substr(2, 6); // Generate a random message ID

    // Sanitize the messageId to ensure it doesn't contain invalid characters for Firebase keys
    return this.sanitizeKey(messageId);
  }

  private sanitizeKey(key: string): string {
    // Remove invalid characters and ensure the key is non-empty
    return key.replace(/[.#$\/\[\]]/g, '24').substring(0, 8) || 'MSG_DEFAULT';
  }
}
