import { useEffect, useRef } from "react";
import cloudinary from "cloudinary-video-player";
import "cloudinary-video-player/cld-video-player.min.css";

const VideoPlayer = ({
  id,
  publicId,
  width = 640,
  height = 360,
  playerConfig = {},
  sourceConfig = {},
  ...props
}) => {
  const cloudinaryRef = useRef();
  const playerRef = useRef();

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
        transformation: {
          streaming_profile: "auto",
        },
        playbackRates: [0.5, 1, 1.5, 2], // opcional
        showVideoSourcePicker: true, // <-- mostra opções de resolução!
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
  }, [publicId, playerConfig, sourceConfig]);

  return (
    <video
      ref={playerRef}
      id={id}
      width={width}
      height={height}
      className="cld-video-player"
      {...props}
    />
  );
};

export default VideoPlayer;
