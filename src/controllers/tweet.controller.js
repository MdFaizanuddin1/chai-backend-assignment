import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  try {
    const { content } = req.body;
    //content = content.trim();
    //console.log("content is", content);
    if (!content) {
      throw new ApiError(404, "please add something to tweet");
    }
    const userId = req.user._id;

    const createTweet = await Tweet.create({
      content,
      owner: userId,
    });

    if (!createTweet) {
      throw new ApiError(500, "error while creating tweet ");
    }
    //console.log("create tweet is \n", createTweet);
    //console.log("create tweet {  } is  \n", { createTweet });
    return res
      .status(200)
      .json(
        new ApiResponse(201, "tweet created successfully", { createTweet })
      );
  } catch (error) {
    throw new ApiError(400, error.message || "unable to create tweet");
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  try {
    const userId = req.params.userId;
    //console.log("user id is ", userId);
    if (!userId) {
      throw new ApiError(401, "You do not have permission to Read Tweets");
    }
    const userTweets = await Tweet.find({
      owner: new mongoose.Types.ObjectId(userId),
    });
    //console.log('new mongoose.Types.ObjectId(userId) is ', new mongoose.Types.ObjectId(userId));
    if (!userTweets) {
      throw new ApiError(501, "No tweets found ");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, { userTweets }, "tweets fetched successfully")
      );
  } catch (error) {
    throw new ApiError(
      400,
      error.message || "some error occured while getting tweets"
    );
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet

  try {
    const { content } = req.body;
    const { tweetId } = req.params;
    if (!content) throw new ApiError(404, "please add something to update");
    // const userId = req.user._id;
    // if (!userId) {
    //   throw new ApiError(401, "You do not have permission to update Tweets");
    // }

    // const ownerDetails = await Tweet.findOne({
    //   owner: new mongoose.Types.ObjectId(userId),
    // }).select("-content");

    // console.log("owner details without select is \n", ownerDetails);
    // //ownerDetails = ownerDetails.select("-content");
    // if (!ownerDetails) throw new ApiError(401, "your not found");

    const updatedTweet = await Tweet.findByIdAndUpdate(
      {
        _id: tweetId,
      },
      {
        $set: {
          content,
        },
      }
    );
    if (!updatedTweet) throw new ApiError(400, "update tweet has failed");

    return res
      .status(200)
      .json(new ApiResponse(200, { updatedTweet }, "update tweet successfull"));
  } catch (error) {
    throw new ApiError(400, error.message || "update oparation got failed");
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet

  try {
    const { tweetId } = req.params;

    if (!tweetId) throw new ApiError(400, "plz give tweet id to be delete");

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if (!deletedTweet) throw new ApiError(400, "unable to delete the tweet");

    return res
      .status(200)
      .json(
        new ApiResponse(200, { deletedTweet }, "deleted the tweet successfully")
      );
  } catch (error) {
    throw new ApiError(400, error.message || "error while deleting the tweet");
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
