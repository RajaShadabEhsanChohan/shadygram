import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; user: string }> }
) {
  try {
    await connectToDatabase();

    const { id: videoId, user } = await params;

    const video = await Video.findById(videoId);

    if (!video) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    const alreadyLiked = video.liked.some(
      (like: { likedBy: string }) => like.likedBy === user
    );

    if (!alreadyLiked) {
      return NextResponse.json(
        { error: "User has not liked this video" },
        { status: 400 }
      );
    }

    video.liked = video.liked.filter(
      (like: { likedBy: string }) => like.likedBy !== user
    );

    video.likes = Math.max(0, video.likes - 1);

    await video.save();

    return NextResponse.json({
      success: true,
      likes: video.likes,
      likedBy: video.liked,
    });
  } catch (error: unknown) {
    console.error("Error disliking video:", error);

    return NextResponse.json(
      { error: "Failed to dislike video" },
      { status: 500 }
    );
  }
}