import { Publisher, PublishContent, PublishResult } from './types';
import { TwitterApi } from 'twitter-api-v2';

export class TwitterPublisher implements Publisher {
  private client: TwitterApi | null = null;

  constructor() {
    if (this.isEnabled()) {
      this.client = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY!,
        appSecret: process.env.TWITTER_API_SECRET!,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
      });
    }
  }

  async publish(content: PublishContent): Promise<PublishResult> {
    if (!this.isEnabled() || !this.client) {
      return {
        success: false,
        error: 'Twitter credentials not configured',
      };
    }

    try {
      // Créer le tweet avec le titre et l'extrait
      const tweetText = `${content.title}\n\n${content.excerpt}`;
      
      // Si on a une image, on la poste d'abord
      let mediaIds = [];
      if (content.featuredImage) {
        const mediaId = await this.client.v1.uploadMedia(content.featuredImage);
        mediaIds.push(mediaId);
      }

      // Poster le tweet
      const tweetParams: any = {
        text: tweetText
      };

      if (mediaIds.length > 0) {
        tweetParams.media = { 
          media_ids: mediaIds.slice(0, 4) as [string, string?, string?, string?]
        };
      }

      const tweet = await this.client.v2.tweet(tweetParams);

      return {
        success: true,
        url: `https://twitter.com/user/status/${tweet.data.id}`,
        platformId: tweet.data.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  isEnabled(): boolean {
    return Boolean(
      process.env.TWITTER_API_KEY &&
      process.env.TWITTER_API_SECRET &&
      process.env.TWITTER_ACCESS_TOKEN
    );
  }
}
