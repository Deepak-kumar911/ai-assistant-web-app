import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Music,
  Smile,
  X,
  Instagram,
  Sparkles,
} from "lucide-react";
import "../../../styles/workflow/instagram/instagram-preview.css";

export default function InstagramPreview({ data = {}, onClose }) {
  const [index, setIndex] = useState(0);
  const media = Array.isArray(data.media) ? data.media : [];

  const postType = data.postType || "post";
  const isCarousel = postType === "carousel";
  const isReel = postType === "reel";
  const isStory = postType === "story";

  const next = (e) => {
    e?.stopPropagation();
    setIndex((i) => (i + 1) % media.length);
  };

  const prev = (e) => {
    e?.stopPropagation();
    setIndex((i) => (i === 0 ? media.length - 1 : i - 1));
  };

  const currentMedia = media[index] || null;

  return (
    <div className="insta-preview-backdrop" onClick={onClose}>
      <div
        className={`insta-preview-card ${postType}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          type="button"
          className="insta-close-btn"
          onClick={onClose}
          title="Close Preview"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ----------------- 1. REEL FORMAT (9:16) ----------------- */}
        {isReel && (
          <div className="insta-reel-layout">
            {/* Top Bar */}
            <div className="insta-reel-top">
              <span className="font-bold text-sm tracking-wide">Reels</span>
              <Instagram className="w-5 h-5 text-white/90" />
            </div>

            {/* Video / Media Canvas */}
            <div className="insta-reel-canvas">
              {currentMedia ? (
                currentMedia.type === "video" ? (
                  <video src={currentMedia.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={currentMedia.url} alt="reel" className="w-full h-full object-cover" />
                )
              ) : (
                <div className="insta-empty-preview">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center text-white shadow-lg mb-2">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-white">Reel Video Preview</p>
                  <p className="text-[11px] text-white/60 text-center max-w-[200px] mt-1">
                    Upload an MP4 video in the node to see full reels playback.
                  </p>
                </div>
              )}
            </div>

            {/* Right Action Icons Column */}
            <div className="insta-reel-actions">
              <div className="flex flex-col items-center gap-1">
                <Heart className="w-6 h-6 text-white" />
                <span className="text-[10px] text-white font-medium">12.4k</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <MessageCircle className="w-6 h-6 text-white" />
                <span className="text-[10px] text-white font-medium">348</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Send className="w-6 h-6 text-white" />
                <span className="text-[10px] text-white font-medium">Share</span>
              </div>
              <MoreHorizontal className="w-6 h-6 text-white" />
              <div className="w-7 h-7 rounded-lg border-2 border-white overflow-hidden bg-white/20 animate-spin">
                <div className="w-full h-full bg-gradient-to-tr from-pink-500 to-violet-500" />
              </div>
            </div>

            {/* Bottom Details Overlay */}
            <div className="insta-reel-bottom">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 p-[1.5px]">
                  <div className="w-full h-full rounded-full bg-[#080C14] flex items-center justify-center text-[10px] font-bold text-white">
                    YB
                  </div>
                </div>
                <span className="text-xs font-bold text-white">your_brand</span>
                <button type="button" className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/40 text-white">
                  Follow
                </button>
              </div>

              <p className="text-xs text-white/90 line-clamp-2 leading-snug">
                {data.caption || "Create captivating Reels to expand your organic reach on Instagram 🚀"}
              </p>

              <div className="flex items-center gap-1.5 text-[10px] text-white/80 mt-2">
                <Music className="w-3 h-3 text-white/80" />
                <span className="truncate">Original audio - your_brand</span>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- 2. STORY FORMAT (9:16) ----------------- */}
        {isStory && (
          <div className="insta-story-layout">
            {/* Story Progress Bars */}
            <div className="insta-story-bars">
              <div className="h-0.5 flex-1 bg-white rounded-full" />
              <div className="h-0.5 flex-1 bg-white/40 rounded-full" />
              <div className="h-0.5 flex-1 bg-white/40 rounded-full" />
            </div>

            {/* Story Header */}
            <div className="insta-story-header">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-amber-400 p-[1.5px]">
                  <div className="w-full h-full rounded-full bg-[#080C14] flex items-center justify-center text-[10px] font-bold text-white">
                    YB
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-none">your_brand</p>
                  <p className="text-[10px] text-white/60 leading-none mt-0.5">3h ago</p>
                </div>
              </div>
            </div>

            {/* Media Canvas */}
            <div className="insta-story-canvas">
              {currentMedia ? (
                currentMedia.type === "video" ? (
                  <video src={currentMedia.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={currentMedia.url} alt="story" className="w-full h-full object-cover" />
                )
              ) : (
                <div className="insta-empty-preview">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center text-white shadow-lg mb-2">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-white">Story Preview</p>
                  <p className="text-[11px] text-white/60 text-center max-w-[200px] mt-1">
                    Upload a portrait photo or video asset in the node.
                  </p>
                </div>
              )}
            </div>

            {/* Story Bottom Reply Bar */}
            <div className="insta-story-bottom">
              <div className="flex-1 py-1.5 px-3 rounded-full border border-white/30 text-white/70 text-xs bg-black/20 backdrop-blur-sm">
                Send message...
              </div>
              <Heart className="w-5 h-5 text-white" />
              <Send className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        {/* ----------------- 3. POST & CAROUSEL FORMAT (1:1) ----------------- */}
        {!isReel && !isStory && (
          <div className="insta-feed-layout">
            {/* Top Post Header */}
            <div className="insta-post-header">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 p-[1.5px]">
                  <div className="w-full h-full rounded-full bg-[#080C14] flex items-center justify-center text-[10px] font-bold text-white">
                    YB
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">your_brand</p>
                  <p className="text-[10px] text-white/60 leading-tight">Sponsored</p>
                </div>
              </div>
              <MoreHorizontal className="w-4 h-4 text-white/80" />
            </div>

            {/* Media Area */}
            <div className="insta-feed-media">
              {currentMedia ? (
                currentMedia.type === "video" ? (
                  <video src={currentMedia.url} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={currentMedia.url} alt="feed post" className="w-full h-full object-cover" />
                )
              ) : (
                <div className="insta-empty-preview">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 flex items-center justify-center text-white shadow-lg mb-2">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-white">
                    {isCarousel ? "Carousel Multi-Post Preview" : "Instagram Post Preview"}
                  </p>
                  <p className="text-[11px] text-white/60 text-center max-w-[220px] mt-1">
                    {isCarousel
                      ? "Add images or videos to see slide-through navigation."
                      : "Upload image or video in node to preview live post."}
                  </p>
                </div>
              )}

              {/* Carousel Slide Count Badge & Navigation */}
              {isCarousel && media.length > 1 && (
                <>
                  <div className="insta-carousel-badge">
                    {index + 1}/{media.length}
                  </div>

                  <button type="button" className="insta-nav-btn left" onClick={prev}>
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button type="button" className="insta-nav-btn right" onClick={next}>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Carousel Dots */}
            {isCarousel && media.length > 1 && (
              <div className="insta-carousel-dots">
                {media.map((_, i) => (
                  <span key={i} className={`insta-dot ${i === index ? "active" : ""}`} />
                ))}
              </div>
            )}

            {/* Actions Bar (Like, Comment, Share, Save) */}
            <div className="insta-actions-bar">
              <div className="flex items-center gap-3.5">
                <Heart className="w-5 h-5 text-white hover:text-red-500 cursor-pointer transition-colors" />
                <MessageCircle className="w-5 h-5 text-white hover:text-cyan-400 cursor-pointer transition-colors" />
                <Send className="w-5 h-5 text-white hover:text-cyan-400 cursor-pointer transition-colors" />
              </div>
              <Bookmark className="w-5 h-5 text-white hover:text-amber-400 cursor-pointer transition-colors" />
            </div>

            {/* Likes count */}
            <div className="px-3 pb-1 text-xs font-bold text-white">
              Liked by alex_marketing and 1,428 others
            </div>

            {/* Caption & Comments */}
            <div className="insta-caption-area">
              <p className="text-xs text-white/90 leading-relaxed">
                <span className="font-bold text-white mr-1.5">your_brand</span>
                {data.caption || "Sharing our latest update with the community! Drop a comment below 👇 #growth #saas #ai"}
              </p>
              <p className="text-[11px] text-white/50 mt-1 cursor-pointer">
                View all 36 comments
              </p>
              <p className="text-[9px] uppercase tracking-wider text-white/40 mt-1">
                2 HOURS AGO
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
