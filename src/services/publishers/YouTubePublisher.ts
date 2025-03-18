// C:\wamp64\www\75Tribune\src\services\publishers\YouTubePublisher.ts

import { Publisher, PublishContent, PublishResult } from "./types";
import { google } from "googleapis";
import fs from "fs";

/**
 * YouTubePublisher
 * Publie une vidéo sur YouTube à partir d'un chemin local (videoUrl).
 */
export class YouTubePublisher implements Publisher {
  private youtube;
  private oauth2Client;

  constructor() {
    // Instancie un client OAuth2 pour YouTube
    this.oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI
    );

    // Si vous avez un refresh token, vous le définissez ici
    if (process.env.YOUTUBE_REFRESH_TOKEN) {
      this.oauth2Client.setCredentials({
        refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
      });
    }

    // Initialise le client YouTube avec l'auth ci-dessus
    this.youtube = google.youtube({
      version: "v3",
      auth: this.oauth2Client,
    });
  }

  /**
   * Publie le contenu (une vidéo locale) sur YouTube
   * @param content PublishContent: title, excerpt (description), tags, videoUrl...
   * @returns PublishResult: success, url, platformId, error
   */
  async publish(content: PublishContent): Promise<PublishResult> {
    // Vérifications basiques
    if (!this.isEnabled() || !content.videoUrl) {
      return {
        success: false,
        error: !this.isEnabled()
          ? "YouTube credentials not configured"
          : "No video URL provided",
      };
    }

    try {
      // Vérifier que le fichier vidéo existe localement
      const filePath = content.videoUrl;
      if (!fs.existsSync(filePath)) {
        throw new Error(`Le fichier vidéo n'existe pas : ${filePath}`);
      }

      // Envoi à l'API YouTube (videos.insert)
      const response = await this.youtube.videos.insert({
        part: ["snippet", "status"],
        requestBody: {
          snippet: {
            title: content.title,
            description: content.excerpt || "",
            tags: content.tags || [],
          },
          status: {
            privacyStatus: "public", // ou "unlisted", "private" selon vos besoins
          },
        },
        media: {
          // On passe un flux (stream) vers la vidéo
          body: fs.createReadStream(filePath),
        },
      });

      // Vérification du résultat
      if (!response.data.id) {
        throw new Error("No video ID returned by YouTube");
      }

      return {
        success: true,
        url: `https://youtube.com/watch?v=${response.data.id}`,
        platformId: response.data.id,
      };
    } catch (error) {
      console.error("Erreur lors de la publication sur YouTube:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Vérifie si les variables d'environnement nécessaires sont présentes
   */
  isEnabled(): boolean {
    return Boolean(
      process.env.YOUTUBE_CLIENT_ID &&
        process.env.YOUTUBE_CLIENT_SECRET &&
        process.env.YOUTUBE_REDIRECT_URI
    );
  }
}
