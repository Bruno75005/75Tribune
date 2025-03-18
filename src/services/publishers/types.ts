export interface PublishDestination {
  platform: 'local' | 'wordpress' | 'youtube' | 'twitter';
  enabled: boolean;
}

export interface PublishContent {
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  featuredImage?: string;
  tags?: string[];
  categories?: string[];
  videoUrl?: string;
}

export interface PublishResult {
  success: boolean;
  url?: string;
  error?: string;
  platformId?: string;
}

export interface Publisher {
  publish(content: PublishContent): Promise<PublishResult>;
  isEnabled(): boolean;
}
