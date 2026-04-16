import { useState } from "react";
import "../../../styles/workflow/instagram/instagram-preview.css";

export default function InstagramPreview({ data, onClose }) {
  const [index, setIndex] = useState(0);
  const media = data.media || [];

  const isCarousel = data.postType === "carousel";
  const isReel = data.postType === "reel";
  const isStory = data.postType === "story";

  const next = () =>
    setIndex((i) => (i + 1) % media.length);
  const prev = () =>
    setIndex((i) =>
      i === 0 ? media.length - 1 : i - 1
    );

  return (
    <div className="insta-preview-backdrop">
      <div className={`insta-preview-card ${data.postType}`}>
        {/* Close */}
        <button className="insta-close-btn" onClick={onClose}>
          ✕
        </button>

        {/* Media Area */}
        <div className="insta-media-frame">
          {media.length > 0 && (
            <>
              {media[index].type === "image" ? (
                <img src={media[index].url} />
              ) : (
                <video src={media[index].url} controls />
              )}

              {/* Carousel controls */}
              {isCarousel && media.length > 1 && (
                <>
                  <button className="nav left" onClick={prev}>
                    ‹
                  </button>
                  <button className="nav right" onClick={next}>
                    ›
                  </button>

                  <div className="dots">
                    {media.map((_, i) => (
                      <span
                        key={i}
                        className={i === index ? "active" : ""}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Caption */}
        <div className="insta-caption-box">
          <strong>your_brand</strong>
          <p>{data.caption || "No caption"}</p>
        </div>
      </div>
    </div>
  );
}
