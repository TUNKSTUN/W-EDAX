// guestbook.model.ts

export interface GuestBookModel {
  guestName: string;       // Name of the guest
  message: string;         // Message left by the guest
  datePosted: Date;        // Date when the message was posted
  email?: string;          // Optional email field for the guest
  isApproved?: boolean;    // Optional field to indicate if the message is approved for display
}
