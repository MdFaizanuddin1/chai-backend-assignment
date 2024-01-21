import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(videoId)) return new ApiError(400, "invlaid video id");

  try {
    // const allComments = await Comment.find();
    const allComments = await Comment.aggregate([
      {
        $match: {
          video: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: parseInt(limit, 10),
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { allComments },
          "all comments fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(400, error.message || "comments cannot be fetched");
  }
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video

  const { content } = req.body;
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(videoId)) return new ApiError(400, "invlaid video id");

  if (!isValidObjectId(userId)) return new ApiError(400, "invlaid user id");

  if (!content?.trim()) return new ApiError(400, "comment connot be empty");

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: userId,
  });

  if (!comment) return new ApiError(500, "error while adding the comment");

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment created successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { content } = req.body;
  if (!content?.trim()) return new ApiError(400, "comment connot be empty");

  const { commentId } = req.params;
  if (!commentId?.trim() || !isValidObjectId(commentId))
    throw new ApiError(400, "commentId is required or invalid");

  const updatedComment = await Comment.findByIdAndUpdate(commentId, {
    content,
  });

  if (!updatedComment)
    return new ApiError(500, "error while updating the comment");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!commentId?.trim() || !isValidObjectId(commentId))
    throw new ApiError(400, "commentId is required or invalid");

  const deletedComment = await Comment.findByIdAndDelete(commentId);

  if (!deleteComment)
    return new ApiError(500, "error while deleting the comment ");

  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedComment, "successfully deleted the comment")
    );
});

export { getVideoComments, addComment, updateComment, deleteComment };
