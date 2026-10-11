import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { id: string, user : string } }) {
    try {
        await connectToDatabase();
        
        const videoId = params.id;
        const user = params.user
        const video = await Video.findById(videoId);

        if (!video) {
            return NextResponse.json({ error: "Video not found" }, { status: 404 });
        }
        
        console.log(user)
        video.liked = video.liked.filter((like: { likedBy: string }) => like.likedBy !== user);
        video.likes -= 1;
        
        await video.save();

        return NextResponse.json({ success: true, likes: video.likes, likedBy: video.liked });
    } catch (error) {
        console.error("Error disliking video:", error);
        return NextResponse.json({ error: "Failed to dislike video" }, { status: 500 });
    }
}
