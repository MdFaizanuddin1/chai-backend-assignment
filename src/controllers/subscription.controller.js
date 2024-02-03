import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription

  if (!isValidObjectId(channelId)) {
    throw new ApiResponse(400, "invalid channelid");
  }

  const user = req.user._id;

  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not find!");
  }

  // prevent subscribe to own channel
  if (channelId.toString() === user) {
    throw new ApiError(400, "You cannot subscribe your own channel!");
  }

  const condition = {
    _id: channelId,
    subscriber: user,
  };

  const status = await Subscription.findOne(condition);

  if (!status) {
    const subscribe = await Subscription.create(condition);
    return res
      .status(200)
      .json(
        new ApiResponse(200, subscribe, "subscribed the channel successfull")
      );
  } else {
    const unSubscribe = await Subscription.findOneAndDelete(condition);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          unSubscribe,
          "unsubscribed the channel successfully"
        )
      );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiResponse(400, "invalid channelid");
  }

  const user = req.user._id;
  //   // prevent subscribe to own channel
  if (channelId.toString() === user) {
    throw new ApiError(400, "You cannot subscribe your own channel!");
  }
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not find!");
  }

  // const subscriber = await Subscription.find({
  //   channel: channelId,
  // });

  const subscriber = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "user",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberList",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
              fullName: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscriberList: {
          $first: "$subscriberList",
        },
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, subscriber, "subscriber list fetched successfully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  const user = req.user._id;

  if (!isValidObjectId(channelId)) {
    throw new ApiResponse(400, "invalid channelid");
  }

  const channels = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channels",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
              fullName: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        channels: {
          $first: "$channels",
        },
      },
    },
  ]);
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
