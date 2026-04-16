import { useReactFlow } from "reactflow";
import { useNodeForm } from "../../hooks/useNodeForm";
import NodeBase from "../NodeBase";
import { useDuplicateSubgraph } from "../../hooks/useDuplicateSubgraph";
import { useEffect, useRef, useState } from "react";
import InstagramPreview from "../../preview/InstagramPreview";


export default function InstagramNode({ id, data, selected, ...rest }) {
  const { updateField } = useNodeForm(id);
  const { duplicateFromNode } = useDuplicateSubgraph();
  const [showPreview, setShowPreview] = useState(false);
  const mediaRef = useRef()

  const isMultiMedia = data.postType === "carousel";
  const accept =
    data.postType === "reel"
      ? "video/*"
      : "image/*,video/*";

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);

    const mapped = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
    }));

    updateField(
      "media",
      isMultiMedia ? mapped : mapped.slice(0, 1)
    );
  };

  const handleRemoveMedia = (index) => {
  const updated = [...(data.media || [])];
  updated.splice(index, 1);
  updateField("media", updated);
};

useEffect(()=>{
  const media = data.media
 Array.isArray(media) && updateField("media", isMultiMedia ? media : (media?.length ? media : media?.slice(0, 1)) );
 mediaRef.current = null
},[data.postType])

  return (
    <NodeBase
      id={id}
      title="Instagram"
      icon="📸"
      data={data}
      selected={selected}
      handles={[
        { id: "in", type: "target", offset: 50 },
        { id: "comments", type: "source", offset: 50 },
      ]}
      // disableDelete={false}
      actions={[
        {
          id: "replicate-chain",
          className: "node-plus-btn",
          title: "Replicate chain",
          btnName: "+",
          onClick: () => duplicateFromNode(id),
        },
          {
            id: "preview",
            className: "node-preview-btn",
            title: "Preview post",
            btnName: "👁",
            onClick: () => setShowPreview(true),
          },
      ]}
    >
      <label className="node-label">Post Type</label>
      <select
        value={data.postType}
        onChange={(e) =>{ updateField("postType", e.target.value)}}
      >
        <option value="post">Post</option>
        <option value="reel">Reel</option>
        <option value="carousel">Carousel</option>
        <option value="story">Story</option>
      </select>

        {/* Media Upload */}
        <label className="node-label">Media</label>
        <input
          type="file"
          ref={mediaRef}
          accept={accept}
          multiple={isMultiMedia}
          onChange={handleFileUpload}
        />

        {/* Media Thumbnails */}
<div className="media-preview-row">
  {data.media?.map((m, i) => (
    <div key={i} className="media-thumb">
      {m.type === "image" ? (
        <img src={m.url} />
      ) : (
        <video src={m.url} />
      )}

      <button
        className="media-remove-btn"
        title="Remove media"
        onClick={() => handleRemoveMedia(i)}
      >
        ✕
      </button>
    </div>
  ))}
</div>


      <label className="node-label">Caption</label>
      <textarea
        rows={2}
        value={data.caption}
        onChange={(e) => updateField("caption", e.target.value)}
        placeholder="Write your caption..."
      />

      {showPreview && (
        <InstagramPreview
          data={data}
          onClose={() => setShowPreview(false)}
        />
      )}
    </NodeBase>
  );
}
