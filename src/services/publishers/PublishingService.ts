import { Publisher, PublishContent, PublishResult, PublishDestination } from './types';
import { LocalPublisher } from './LocalPublisher';
import { WordPressPublisher } from './WordPressPublisher';
import { YouTubePublisher } from './YouTubePublisher';
import { TwitterPublisher } from './TwitterPublisher';

export class PublishingService {
  private publishers: Map<PublishDestination['platform'], Publisher>;

  constructor() {
    this.publishers = new Map();
    // Le publisher local est toujours disponible
    this.publishers.set('local', new LocalPublisher());
    
    // Initialiser les autres publishers
    this.publishers.set('wordpress', new WordPressPublisher());
    this.publishers.set('youtube', new YouTubePublisher());
    this.publishers.set('twitter', new TwitterPublisher());
  }

  async publish(
    content: PublishContent,
    destinations: PublishDestination[]
  ): Promise<Map<string, PublishResult>> {
    const results = new Map<string, PublishResult>();

    // S'assurer que la publication locale est toujours incluse
    if (!destinations.some(d => d.platform === 'local')) {
      destinations.push({ platform: 'local', enabled: true });
    }

    // Publier sur chaque plateforme activée
    for (const destination of destinations) {
      if (!destination.enabled) continue;

      const publisher = this.publishers.get(destination.platform);
      if (!publisher) {
        results.set(destination.platform, {
          success: false,
          error: `Publisher not found for platform: ${destination.platform}`,
        });
        continue;
      }

      if (!publisher.isEnabled()) {
        results.set(destination.platform, {
          success: false,
          error: `Publisher ${destination.platform} is not properly configured`,
        });
        continue;
      }

      try {
        const result = await publisher.publish(content);
        results.set(destination.platform, result);
      } catch (error) {
        results.set(destination.platform, {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  getAvailablePublishers(): PublishDestination[] {
    return Array.from(this.publishers.entries()).map(([platform, publisher]) => ({
      platform,
      enabled: publisher.isEnabled(),
    }));
  }
}
