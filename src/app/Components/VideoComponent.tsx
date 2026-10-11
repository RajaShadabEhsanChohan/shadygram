"use client";

import { IKVideo } from "imagekitio-next";
import Link from "next/link";
import { IVideo } from "@/models/Video";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useNotification } from "./Notification";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface LikeResponse {
  success: boolean;
  likes: number;
  likedBy: {
    likedBy: string;
  }[];
}

export default function VideoComponent({
  video,
}: {
  video: IVideo;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { showNotification } = useNotification();

  const [likes, setLikes] = useState<number>(video.likes ?? 0);
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [likedBy, setLikedBy] = useState<
    { likedBy: string }[]
  >(video.liked ?? []);

  useEffect(() => {
    const userEmail = session?.user?.email;

    setIsLiking(
      video.liked?.some(
        (user) => user.likedBy === userEmail
      ) ?? false
    );

    setLikedBy(video.liked ?? []);
  }, [video.liked, session?.user?.email]);

  const handleLike = async () => {
    const userEmail = session?.user?.email;

    if (!userEmail) {
      router.push("/register");
      return;
    }

    if (isLoading || !video._id) {
      return;
    }

    setIsLoading(true);

    try {
      let response: LikeResponse;

      if (isLiking) {
        response = (await apiClient.dislikeVideo(
          video._id.toString(),
          userEmail
        )) as LikeResponse;
      } else {
        response = (await apiClient.likeVideo(
          video._id.toString(),
          userEmail
        )) as LikeResponse;
      }

      setLikes(response.likes);
      setLikedBy(response.likedBy ?? []);

      setIsLiking(
        response.likedBy?.some(
          (user) => user.likedBy === userEmail
        ) ?? !isLiking
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      showNotification(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow hover:shadow-lg transition-all duration-300">
      <figure className="relative px-4 pt-4">
        <Link
          href={`/videos/${video._id}`}
          className="relative group w-full"
        >
          <div
            className="rounded-xl overflow-hidden relative w-full"
            style={{ aspectRatio: "9/16" }}
          >
            <IKVideo
              path={video.videoUrl}
              transformation={[
                {
                  height: "1920",
                  width: "1080",
                },
              ]}
              controls={video.controls}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
      </figure>

      <div className="card-body p-4">
        <Link
          href={`/videos/${video._id}`}
          className="hover:opacity-80 transition-opacity"
        >
          <h2 className="card-title text-lg">
            {video.title}
          </h2>
        </Link>

        <p className="text-sm text-base-content/70 line-clamp-2">
          {video.description}
        </p>

        {/* Like Button */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleLike}
            disabled={isLoading}
            aria-label={isLiking ? "Unlike video" : "Like video"}
            aria-pressed={isLiking}
            className="disabled:opacity-50"
          >
            <Heart
              fill={isLiking ? "red" : "none"}
              color={isLiking ? "red" : "currentColor"}
              className="cursor-pointer transition-colors"
            />
          </button>

          <p className="text-sm text-base-content/70">
            {likes}
          </p>

          {isLoading && (
            <span className="loading loading-spinner loading-xs" />
          )}
        </div>

        {/* Liked By */}
        <p className="text-sm text-base-content/70">
          Liked By
        </p>

        {likedBy.map((liker, index) => (
          <p
            key={`${liker.likedBy}-${index}`}
            className="text-xs text-base-content/70"
          >
            {liker.likedBy}
          </p>
        ))}
      </div>
    </div>
  );
}