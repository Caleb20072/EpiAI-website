// Svix webhook types for Clerk events
export interface UserWebhookPayload {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name?: string;
    last_name?: string;
    public_metadata?: Record<string, any>;
    deleted?: boolean;
  };
  object: 'event';
}

export interface EmailWebhookPayload {
  type: 'email.delivered' | 'email.opened' | 'email.bounced';
  data: {
    id: string;
    to_email: string;
    from_email: string;
    subject: string;
  };
  object: 'event';
}

export interface WebhookPayload {
  type: string;
  data: Record<string, any>;
  object: 'event';
}
