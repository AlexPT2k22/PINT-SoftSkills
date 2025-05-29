import { useEffect, useRef } from "react";
import cloudinary from "cloudinary-video-player";
import "cloudinary-video-player/cld-video-player.min.css";
import "../styles/video.css";

const formatTime = (timeInSeconds) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

const VideoPlayer = ({
  id,
  publicId,
  playerConfig,
  sourceConfig,
  onTimeUpdate,
  onPause,
  onPlay,
  ...props
}) => {
  const cloudinaryRef = useRef();
  const playerRef = useRef();

  useEffect(() => {
    if (cloudinaryRef.current) return;

    cloudinaryRef.current = cloudinary;

    const player = cloudinaryRef.current.videoPlayer(playerRef.current, {
      cloud_name: "dbhxixkmb",
      secure: true,
      controls: true,
      showJumpControls: true,
      pictureInPictureToggle: true,
      hideContextMenu: true,

      fluid: false, // Disable fluid to use fixed height
      width: "100%",
      height: 610, // Set fixed height
      sourceTypes: ["hls"],
      transformation: { streaming_profile: "full_hd" },
      ...playerConfig,
    });

    player.on("timeupdate", () => {
      const currentTime = player.currentTime();
      if (onTimeUpdate) {
        onTimeUpdate(currentTime);
      }
    });

    player.source(publicId, sourceConfig);
  }, [onTimeUpdate]);

  return (
    <div className="video-wrapper" style={{ maxHeight: "610px" }}>
      <video
        ref={playerRef}
        id={id}
        className="cld-video-player"
        style={{ width: "100%", height: "100%" }}
        {...props}
      />
    </div>
  );
};

export default VideoPlayer;
