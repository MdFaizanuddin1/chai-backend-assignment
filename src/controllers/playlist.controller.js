import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist

  try {
    //console.log("name is ", name?.trim());
    //console.log("description is ", description?.trim());
    if (!name?.trim() || !description?.trim()) {
      return new ApiError(400, "please enter name and description");
    }
    const playlist = await Playlist.create({
      name,
      description,
      owner: req.user._id,
    });

    if (!playlist) {
      throw new ApiError(500, "error while creating playlist");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "playlist created successfully"));
  } catch (error) {
    throw new ApiError(400, error.message || "playlist creation got failed");
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  //TODO: get user playlists

  if (!userId) {
    throw new ApiError(404, "you dont have any playlist access");
  }

  const playlists = await Playlist.find({
    owner: new mongoose.Types.ObjectId(userId),
  });

  if (!playlists) throw new ApiError(400, "you dont have any playlists");
  //console.log("playlists is ", playlists);
  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!playlistId) {
    throw new ApiError(400, "invalid playlist id");
  }

  const playlistById = await Playlist.findById(playlistId);
  if (!playlistById)
    throw new ApiError(400, "there is no playlist with specifed id");

  return res
    .status(200)
    .json(new ApiResponse(200, playlistById, "playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!(playlistId?.trim() || videoId?.trim())) {
    throw new ApiError(400, "invalid playlistid or videoid");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "playlist not found");
  const addVideo = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        videos: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      new: true,
    }
  );

  if (!addVideo) {
    throw new ApiError(500, "error occured while adding the video ");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        addVideo,
        "successfully added the video to the playlist"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  if (!(playlistId?.trim() || videoId?.trim())) {
    throw new ApiError(400, "invalid playlistid or videoid");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "playlist not found");

  const removeVideo = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      new: true,
    }
  );
  if (!removeVideo)
    throw new ApiError(500, "error when removing video from playlist");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        removeVideo,
        "removed video from playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  if (!playlistId?.trim()) {
    throw new ApiError(400, "invalid playlist id");
  }

  const deletedPlayList = await Playlist.findByIdAndDelete(playlistId);

  if (!deletePlaylist) {
    throw new ApiError(500, "deliting playlist is failed");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, deletePlaylist, "deliting playlist is successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (!playlistId?.trim()) {
    throw new ApiError(400, "invalid playlist id");
  }

  const platlist = Playlist.findById(playlistId);
  if (!platlist) throw new ApiError(400, "invalid playlist doesnot exists");

  if (!(name?.trim() || description?.trim())) {
    return new ApiError(400, "please enter name and description");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedPlaylist) throw new ApiError(500, "updating playlist is failed");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "updating playlist is successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
