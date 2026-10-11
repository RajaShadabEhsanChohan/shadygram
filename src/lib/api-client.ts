import { IVideo } from "@/models/Video";

export type VideoFormData = Omit<IVideo, "_id"> & { likes?: number };


type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

class ApiClient {
  private async fetch<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const defaultHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };

    const response = await fetch(`/api${endpoint}`, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }

  async getVideos() {
    return this.fetch<IVideo[]>("/videos");
  }

  async getVideo(id: string) {
    return this.fetch<IVideo>(`/videos/${id}`);
  }

  async createVideo(videoData: VideoFormData) {
    return this.fetch<IVideo>("/videos", {
      method: "POST",
      body: { ...videoData, likes: 0 }, 
    });
  }

  async likeVideo(id: string, user : string) {
    try {
      const response = await this.fetch<{ success: boolean; likes: number }>(`/videos/${id}/like/${user}`, {
        method: "POST",
      });

      if (response) {
        return response
      } else {
        return new Error('Failed to like video')
      }

    } catch (error) {
      return error
    }


  }
  async dislikeVideo(id: string, user : string) {
    try {
      const response = await this.fetch<{ success: boolean; likes: number }>(`/videos/${id}/dislike/${user}`, {
        method: "POST",
      });

      if (response) {
        return response
      } else {
        return new Error('Failed to dislike video')
      }

    } catch (error) {
      return error
    }
  }

}

export const apiClient = new ApiClient();
