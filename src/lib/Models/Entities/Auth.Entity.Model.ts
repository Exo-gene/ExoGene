export class Auth {
    instance_id: string = null!;
    id: string = null!;
    aud: string = null!;
    role: string | null = null;
    email: string | null = null;
    encrypted_password: string | null = null;
    email_confirmed_at: string | Date | null = null;
    invited_at: string | null = null;
    confirmation_token: string | null = null;
    confirmation_sent_at: null | Date = null;
    recovery_token: string | null = null;
    recovery_sent_at: null | Date = null;
    email_change_token_new: string | null = null;
    email_change: string | null = null;
    email_change_sent_at: null | Date = null;
    last_sign_in_at: null | Date = null;
    raw_app_meta_data: {
      provider: string | null;,
      providers: Array<string>
    } = {
        provider: null,
        providers: [],
    };
    raw_user_meta_data={};
    is_super_admin: null | boolean = null;
    created_at: null | Date = null;
    updated_at: null | Date = null;
    phone: string | null = null;
    phone_confirmed_at: null | Date = null;
    phone_change: string | null = null;
    phone_change_token: string | null = null;
    phone_change_sent_at: null | Date = null;
    confirmed_at: null | Date = null;
    email_change_token_current: string | null = null;
    email_change_confirm_status: number | null = null;
    banned_until: null | Date = null;
    reauthentication_token: string | null = null;
    reauthentication_sent_at: null | Date = null;
    is_sso_user: boolean = false;
    deleted_at: null | Date = null;
    is_anonymous: boolean = false;
  }