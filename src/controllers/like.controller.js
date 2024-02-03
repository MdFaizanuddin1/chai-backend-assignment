import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  // find if video is liked
  // take video id and userid find ? if true then ulike else like

  const userId = req.user._id;

  try {
    const condition = {
      video: videoId,
      likedBy: userId,
    };
    const status = await Like.findOne(condition);

    if (!status) {
      const createLike = await Like.create(condition);
      return res
        .status(200)
        .json(new ApiResponse(200, createLike, "liked the video successfully"));
    } else {
      const dislike = await Like.findOneAndDelete(condition);

      return res
        .status(200)
        .json(new ApiResponse(200, dislike, "disliked the video successfully"));
    }
  } catch (error) {
    throw new ApiError(400, error.message || "something went wrong");
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "please enter valid comment id");
  }
  const likedBy = req.user._id;
  try {
    const status = await Like.findOne({
      comment: commentId,
      likedBy,
    });

    if (!status) {
      const likeComment = await Like.create({
        comment: commentId,
        likedBy,
      });

      return res
        .status(200)
        .json(
          new ApiResponse(200, likeComment, "liked the comment successfully")
        );
    } else {
      const unlikeComment = await Like.findOneAndDelete({
        comment: commentId,
        likedBy,
      });

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            unlikeComment,
            "unliked the comment successfully"
          )
        );
    }
  } catch (error) {
    throw new ApiError(400, error.message || "something went wrong");
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "please enter valid tweet id");
  }
  const likedBy = req.user._id;
  try {
    const condition = {
      tweet: tweetId,
      likedBy,
    };
    const status = await Like.findOne(condition);
    if (!status) {
      const likeTweet = await Like.create(condition);

      return res
        .status(200)
        .json(new ApiResponse(200, likeTweet, "liked the tweet successfully"));
    } else {
      const unLikeTweet = await Like.findOneAndDelete(condition);

      return res
        .status(200)
        .json(
          new ApiResponse(200, unLikeTweet, "unliked the tweet successfully")
        );
    }
  } catch (error) {
    throw new ApiError(400, error.message || "something went wrong");
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  // take liked by whom
  // find in db ---get the document
  // from document  return video id
  const likedBy = req.user._id;

  // const likedVideo = await Like.find({
  //   likedBy,
  //   video: { $exists: true },
  // })
  const likedVideo = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(likedBy),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        likedVideo[0].likedVideos,
        "liked videos fetched successfully"
      )
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
