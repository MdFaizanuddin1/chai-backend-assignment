import mongoose, { mongo } from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const user = req.user._id;

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(user),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribers",
      },
    },
    {
      $addFields: {
        totalSubscribers: {
          $size: "$subscribers",
        },
      },
    },
    {
      $project: {
        totalSubscribers: 1,
      },
    },
    // or code
    // {
    //   $count: "subscribers",
    // },
  ]);

  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(user),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $addFields: {
        totalVideos: {
          $size: "$videos",
        },
      },
    },
    {
      $project: {
        totalVideos: 1,
        thumbnail,
        title,
      },
    },
  ]);

  const views = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(user),
      },
    },
    {
      $group: {
        _id: null,
        totalVideoViews: { $sum: "$views" },
      },
    },
  ]);

  const totalLikes = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(user),
      },
    },
    {
      $group: {
        _id: null,
        totalLikedVideos: {
          $sum: {
            $cond: [{ $ifNull: ["$video", false] }, 1, 0],
          },
        },
        totalLikedTweets: {
          $sum: {
            $cond: [{ $ifNull: ["$tweet", false] }, 1, 0],
          },
        },
        totalLikedComments: {
          $sum: {
            $cond: [{ $ifNull: ["$comment", false] }, 1, 0],
          },
        },
      },
    },
  ]);

  const stats = {
    totalSubscribers: subscribers || 0,
    totalLikes: totalLikes || 0,
    totalVideos: videos || 0,
    totalVideoViews: views || 0,
  };
  return res
    .status(200)
    .json(new ApiResponse(200, stats, "stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const allVideos = await Video.find({ owner: req.user._id });

  return res
    .stats(200)
    .json(
      new ApiResponse(200, { allVideos }, "all videos fetched successfully")
    );
});

export { getChannelStats, getChannelVideos };
