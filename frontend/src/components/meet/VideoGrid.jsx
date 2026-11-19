import VideoTile from "./VideoTile";
import styles from "../../styles/videoComponent.module.css";

/**
 * Responsive video wall. The original was a non-wrapping flex row of
 * min-width:30vw videos, so a third participant pushed everyone off screen.
 */
const VideoGrid = ({ localStream, localName, isSharingScreen, videoEnabled, audioEnabled, participants }) => {
  const count = participants.length + 1;

  return (
    <div className={styles.videoGrid} data-count={count >= 7 ? "many" : String(count)}>
      <VideoTile
        stream={localStream}
        name={localName}
        isSelf
        isSharingScreen={isSharingScreen}
        hasVideo={videoEnabled || isSharingScreen}
        muted={!audioEnabled}
      />

      {participants.map((participant) => (
        <VideoTile
          key={participant.socketId}
          stream={participant.stream}
          name={participant.name ?? "Guest"}
          hasVideo={participant.hasVideo !== false}
          muted={participant.hasAudio === false}
          connectionState={participant.connectionState}
        />
      ))}
    </div>
  );
};

export default VideoGrid;
