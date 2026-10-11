import mongoose, { model, models, Schema } from "mongoose";

export const Video_Dimensions = {
    width: 1080,
    height: 1920
} as const

export interface IVideo {
    _id?: mongoose.Types.ObjectId;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    controls?: boolean;
    transformation?: {
        width: number;
        height: number;
        quality?: number;
    };
    likes: number; // <-- Add this field
    liked: {
        likedBy: string;
    }[];
}

const videoSchema = new Schema<IVideo>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        videoUrl: { type: String, required: true },
        thumbnailUrl: { type: String, required: true },
        controls: { type: Boolean, default: true },
        transformation: {
            width: { type: Number, default: Video_Dimensions.width },
            height: { type: Number, default: Video_Dimensions.height },
            quality: { type: Number, min: 1, max: 100 },
        },
        likes: { type: Number, required: true, default: 0 }, // ✅ Ensure likes is always stored
        liked : [
            {
                likedBy : { type: String}
            }
        ]
    },
    { timestamps: true }
);


const Video = models?.Video || model<IVideo>('Video', videoSchema)

export default Video