import { useEffect, useRef } from "react";
import cloudinary from "cloudinary-video-player";
import "cloudinary-video-player/cld-video-player.min.css";
import "../styles/video.css"; // Import your CSS file

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
      secure: true,
      controls: true,
      showJumpControls: true,
      pictureInPictureToggle: true,
      hideContextMenu: true,
      floatingWhenNotVisible: "right",
      fluid: false, // Disable fluid to use fixed height
      width: "100%",
      height: 610, // Set fixed height
      ...playerConfig,
    });
    player.source(publicId, sourceConfig);
  }, []);

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
