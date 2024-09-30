    export interface GuestBookModel {
      GitHubUsername: string;
      Message: string;
      MessageId: string;
      DatePosted: Date | string; 
      IsApproved: boolean;
      ProfilePicUrl: string;
      UserId: string;
      Uid: string;
      ExpirationDate: Date | string;
    }

    export interface UserMessages {
      Messages: { [messageId: string]: GuestBookModel };
    }

    export interface GuestBook {
      [userId: string]: UserMessages;
    }
