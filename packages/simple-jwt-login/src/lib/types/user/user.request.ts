export interface UserRequest {
  /**
   * User email address
   */
  email: string;
  /**
   * User password
   */
  password: string;
  /**
   * The user's login username.
   */
  user_login?: string;
  /**
   * User URL-friendly username
   */
  user_nicename?: string;
  /**
   * User URL
   */
  user_url?: string;
  /**
   * The user's display name. Default is the user's username.
   */
  display_name?: string;
  /**
   * The user's nickname. Default is the user's username.
   */
  nickname?: string;
  /**
   * The user's first name. For new users, will be used to build the first part of the user's display name if "display_name" is not specified.
   */
  first_name?: string;
  /**
   * The user's last name. For new users, will be used to build the second part of the user's display name if "display_name" is not specified.
   */
  last_name?: string;
  /**
   * The user's biographical description.
   */
  description?: string;
  /**
   * Whether to enable the rich-editor for the user. Accepts 'true' or 'false' as a string literal, not boolean. Default 'true'.
   */
  rich_editing?: string;
  /**
   * Whether to enable the rich code editor for the user. Accepts 'true' or 'false' as a string literal, not boolean. Default 'true'.
   */
  syntax_highlighting?: string;
  /**
   * Whether to enable comment moderation keyboard shortcuts for the user. Accepts 'true' or 'false' as a string literal, not boolean. Default 'false'.
   */
  comment_shortcuts?: string;
  /**
   * Admin color scheme for the user. Default 'fresh'.
   */
  admin_color?: string;
  /**
   * Whether the user should always access the admin over https. Default false.
   */
  use_ssl?: boolean;
  /**
   * Date the user registered. Format is 'Y-m-d H:m:s'.
   */
  user_registered?: string;
  /**
   * Password reset key. Default empty.
   */
  user_activation_key?: string;
  /**
   * Multisite only. Whether the user is marked as spam. Default false.
   */
  spam?: boolean;
  /**
   * Whether to display the Admin Bar for the user on the site's front end.Accepts 'true' or 'false' as a string literal, not boolean. Default 'true'.
   */
  show_admin_bar_front?: string;
  /**
   * User's locale. Default empty.
   */
  locale?: string;
}
