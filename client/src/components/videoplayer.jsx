import { useEffect, useRef } from "react";
import cloudinary from 'cloudinary-video-player';
import "cloudinary-video-player/cld-video-player.min.css";

const VideoPlayer = ({
  id,
  publicId,
  playerConfig,
  sourceConfig,
  ...props
}) => {
  const cloudinaryRef = useRef();
  const playerRef = useRef();

  useEffect(() => {
    if (cloudinaryRef.current) return;

    cloudinaryRef.current = cloudinary;

    const player = cloudinaryRef.current.videoPlayer(playerRef.current, {
      cloud_name: "dk2ifkqqc",
      controls: true,
      secure: true,
      floatingWhenNotVisible: "right",
      pictureInPictureToggle: true,
      showJumpControls: true,
      sourceTypes: ["hls"],
      ...playerConfig,
    });
    player.source(publicId, sourceConfig);
  }, []);

  return (
    <video
      ref={playerRef}
      id={id}
      className="cld-video-player cld-fluid"
      {...props}
    />
  );
};

export default VideoPlayer;
