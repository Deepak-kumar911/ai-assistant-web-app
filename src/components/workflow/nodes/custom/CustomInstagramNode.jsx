import { useEffect, useRef, useState } from "react";
import { Instagram, Eye, Copy, Upload, Image, Film, Layers, Clock, X } from "lucide-react";
import { useNodeForm } from "../../hooks/useNodeForm";
import NodeBase from "../NodeBase";
import { useDuplicateSubgraph } from "../../hooks/useDuplicateSubgraph";
import InstagramPreview from "../../preview/InstagramPreview";

export default function InstagramNode({ id, data, selected }) {
  const { updateField } = useNodeForm(id);
  const { duplicateFromNode } = useDuplicateSubgraph();
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const postType = data.postType || "post";
  const isMultiMedia = postType === "carousel";
  const accept =
    postType === "reel"
      ? "video/*"
      : postType === "story"
        ? "image/*,video/*"
        : isMultiMedia
          ? "image/*,video/*"
          : "image/*,video/*";

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const mapped = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
      name: file.name,
    }));

    if (isMultiMedia) {
      const existing = Array.isArray(data.media) ? data.media : [];
      updateField("media", [...existing, ...mapped].slice(0, 10));
    } else {
      updateField("media", mapped.slice(0, 1));
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveMedia = (index) => {
    const updated = [...(data.media || [])];
    updated.splice(index, 1);
    updateField("media", updated);
  };

  useEffect(() => {
    const media = data.media;
    if (Array.isArray(media) && !isMultiMedia && media.length > 1) {
      updateField("media", media.slice(0, 1));
    }
  }, [postType]);

  const postTypes = [
    { value: "post", label: "Post (1:1)", icon: Image },
    { value: "reel", label: "Reel (9:16)", icon: Film },
    { value: "carousel", label: "Carousel", icon: Layers },
    { value: "story", label: "Story", icon: Clock },
  ];

  return (
    <NodeBase
      id={id}
      title="Instagram Post"
      badge="ACTION"
      icon={<Instagram className="w-4 h-4 text-pink-400" />}
      data={data}
      selected={selected}
      handles={[
        { id: "in", type: "target", offset: 50 },
        { id: "comments", type: "source", offset: 50 },
      ]}
      actions={[
        {
          id: "preview",
          className: "node-preview-btn",
          title: "Preview Post UI",
          btnName: <Eye className="w-3.5 h-3.5 text-purple-300" />,
          onClick: () => setShowPreview(true),
        },
        {
          id: "replicate-chain",
          className: "node-plus-btn",
          title: "Replicate chain",
          btnName: <Copy className="w-3.5 h-3.5 text-cyan-300" />,
          onClick: () => duplicateFromNode(id),
        },
      ]}
    >
      <div className="space-y-3">
        {/* Post Type Selector */}
        <div>
          <label className="node-label">Content Format</label>
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#080C14]/90 border border-white/10">
            {postTypes.map((pt) => {
              const Icon = pt.icon;
              const isActive = postType === pt.value;
              return (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => updateField("postType", pt.value)}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-md shadow-pink-500/20"
                      : "text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{pt.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Media Upload Area */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="node-label mb-0">Media Asset</label>
            <span className="text-[10px] text-[#94A3B8] font-medium">
              {postType === "reel" ? "MP4 Video" : isMultiMedia ? "Up to 10 files" : "Image or Video"}
            </span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept={accept}
            multiple={isMultiMedia}
            onChange={handleFileUpload}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="media-dropzone group"
          >
            <div className="flex flex-col items-center justify-center gap-1.5 py-1">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Upload className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-[#F8FAFC]">
                {data.media?.length ? "Add More Media" : "Upload Media Asset"}
              </p>
              <p className="text-[10px] text-[#64748B]">Click or drag files here</p>
            </div>
          </div>

          {/* Media Thumbnails Row */}
          {Array.isArray(data.media) && data.media.length > 0 && (
            <div className="media-preview-row">
              {data.media.map((m, i) => (
                <div key={i} className="media-thumb group/thumb">
                  {m.type === "image" ? (
                    <img src={m.url} alt="media preview" />
                  ) : (
                    <video src={m.url} />
                  )}

                  <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded text-[8px] font-bold bg-black/70 text-white backdrop-blur-sm">
                    {m.type === "video" ? "VID" : "IMG"}
                  </span>

                  <button
                    type="button"
                    className="media-remove-btn"
                    title="Remove media"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveMedia(i);
                    }}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Caption */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="node-label mb-0">Caption</label>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="text-[11px] font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </button>
          </div>
          <textarea
            rows={2}
            value={data.caption || ""}
            onChange={(e) => updateField("caption", e.target.value)}
            placeholder="Write your engaging caption & hashtags..."
          />
        </div>
      </div>

      {showPreview && (
        <InstagramPreview
          data={data}
          onClose={() => setShowPreview(false)}
        />
      )}
    </NodeBase>
  );
}
