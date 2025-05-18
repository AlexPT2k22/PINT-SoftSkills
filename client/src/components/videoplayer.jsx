import { useEffect, useRef } from "react";
import cloudinary from "cloudinary-video-player";
import "cloudinary-video-player/cld-video-player.min.css";

function VideoPlayer({
  id,
  publicId,
  height = 610,
  playerConfig = {},
  sourceConfig = {},
  onVideoComplete,
  ...props
}) {
  const cloudinaryRef = useRef();
  const playerRef = useRef();
  const videoRef = useRef();

  useEffect(() => {
    const videoElement = videoRef.current;

    // Add event listener for video completion
    if (videoElement) {
      videoElement.addEventListener("ended", handleVideoEnd);

      return () => {
        videoElement.removeEventListener("ended", handleVideoEnd);
      };
    }
  }, []);

  const handleVideoEnd = () => {
    // Call the callback function when video ends
    if (onVideoComplete) {
      onVideoComplete();
    }
  };

  useEffect(() => {
    if (!cloudinaryRef.current) {
      cloudinaryRef.current = cloudinary;

      const player = cloudinaryRef.current.videoPlayer(playerRef.current, {
        cloud_name: "dk2ifkqqc", // substitua por env se necessário
        controls: true,
        secure: true,
        pictureInPictureToggle: true,
        showJumpControls: true,
        sourceTypes: ["hls"],
        publicId: publicId,
        fluid: false,
        width: "100%",
        height: height,
        transformation: {
          streaming_profile: "auto",
        },
        playbackRates: [0.5, 1, 1.5, 2],
        showVideoSourcePicker: true,
        ...playerConfig,
      });

      player.source(publicId, {
        sourceTypes: ["hls"],
        transformation: {
          streaming_profile: "auto",
        },
        ...sourceConfig,
      });

      playerRef.current.playerInstance = player;
    } else if (playerRef.current?.playerInstance) {
      playerRef.current.playerInstance.source(publicId, {
        sourceTypes: ["hls"],
        transformation: {
          streaming_profile: "auto",
        },
        ...sourceConfig,
      });
    }
  }, [publicId, playerConfig, sourceConfig, height]);

  return (
    <div className="video-player-wrapper" style={{ height: height }}>
      <video
        ref={playerRef}
        id={id}
        style={{ width: "100%", height: "100%" }}
        className="cld-video-player"
        {...props}
      />
    </div>
  );
}

export default VideoPlayer;
