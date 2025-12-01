interface VideoBackgroundProps {
  videoSrc: string;
}

export default function VideoBackground({ videoSrc }: VideoBackgroundProps) {
  return (
    <>
      <video id="bg-video" autoPlay muted loop>
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div className="overlay"></div>
    </>
  )
}
