import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // Import the mongoose-aggregate-paginate-v2 plugin for pagination

const videoSchema = new Schema({
    videoFile: {
        type: String, // cloudinary url
        required: true
    },
    thumbnail: {
        type: String, // cloudinary url
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId, // Reference to the User model
        ref: "User"
    }
}, { timestamps: true })

videoSchema.plugin(mongooseAggregatePaginate) // Apply the pagination plugin to the schema

export const Video = mongoose.model("Video", videoSchema)