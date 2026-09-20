import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUploadCloud, FiX, FiCheck, FiZoomIn, FiZoomOut, FiRotateCcw } from "react-icons/fi";
import { toast } from "react-toastify";
import { uploadAgentAvatarApi } from "../../../api/integration/webIntegrationApi";
import { useDispatch } from "react-redux";
import { setAgentDetail } from "../../../stateManagement/slices/aiAgentSlice";

export default function AvatarCropperModal({ isOpen, onClose, agent, onUploadSuccess }) {
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [uploading, setUploading] = useState(false);

  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  // Reset when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setImageSrc(null);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setUploading(false);
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file format. Please upload JPEG, PNG, WebP, GIF, or SVG.");
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  // Draw preview onto canvas
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const img = imgRef.current;
    const baseScale = Math.max(width / img.width, height / img.height);
    const currentScale = baseScale * zoom;

    const scaledW = img.width * currentScale;
    const scaledH = img.height * currentScale;

    const centerX = width / 2 + pan.x;
    const centerY = height / 2 + pan.y;

    // Draw the image
    ctx.save();
    ctx.drawImage(img, centerX - scaledW / 2, centerY - scaledH / 2, scaledW, scaledH);
    ctx.restore();

    // Dark overlay with circular cutout
    ctx.save();
    ctx.fillStyle = "rgba(8, 12, 20, 0.65)";
    ctx.fillRect(0, 0, width, height);

    // Cutout circle
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width / 2 - 10, 0, Math.PI * 2, false);
    ctx.fill();

    // Border around circular cutout
    ctx.globalCompositeOperation = "source-over";
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width / 2 - 10, 0, Math.PI * 2, false);
    ctx.strokeStyle = "#06B6D4";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
  }, [zoom, pan]);

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;
      img.onload = () => {
        imgRef.current = img;
        drawPreview();
      };
    }
  }, [imageSrc, drawPreview]);

  useEffect(() => {
    drawPreview();
  }, [zoom, pan, drawPreview]);

  // Mouse pan handlers
  const handleMouseDown = (e) => {
    if (!imageSrc) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch pan handlers for mobile
  const handleTouchStart = (e) => {
    if (!imageSrc || !e.touches[0]) return;
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !e.touches[0]) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  // Crop and upload to S3 endpoint
  const handleCropAndUpload = async () => {
    if (!imgRef.current || !agent?._id) {
      toast.error("Agent ID or image missing");
      return;
    }

    setUploading(true);
    try {
      // Create output canvas (256x256 square crop)
      const outCanvas = document.createElement("canvas");
      outCanvas.width = 256;
      outCanvas.height = 256;
      const outCtx = outCanvas.getContext("2d");

      const previewCanvas = canvasRef.current;
      const factor = 256 / previewCanvas.width;

      const img = imgRef.current;
      const baseScale = Math.max(previewCanvas.width / img.width, previewCanvas.height / img.height);
      const currentScale = baseScale * zoom * factor;

      const scaledW = img.width * currentScale;
      const scaledH = img.height * currentScale;
      const centerX = 128 + pan.x * factor;
      const centerY = 128 + pan.y * factor;

      outCtx.drawImage(img, centerX - scaledW / 2, centerY - scaledH / 2, scaledW, scaledH);

      // Convert to blob
      outCanvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Failed to generate image data");
          setUploading(false);
          return;
        }

        const formData = new FormData();
        formData.append("avatar", blob, "agent-avatar.png");
        formData.append("agentId", agent._id);

        try {
          const res = await uploadAgentAvatarApi(agent._id, formData);
          const avatarUrl = res?.data?.avatarUrl || res?.data?.data?.avatarUrl;

          if (avatarUrl) {
            toast.success("Avatar uploaded successfully!");
            dispatch(
              setAgentDetail({
                ...agent,
                avatarUrl,
                agentImg: avatarUrl,
                fullAgentImg: avatarUrl,
              })
            );
            if (onUploadSuccess) onUploadSuccess(avatarUrl);
            onClose();
          } else {
            toast.error(res?.data?.message || "Failed to upload avatar");
          }
        } catch (err) {
          console.error("Upload error:", err);
          toast.error(err?.response?.data?.message || err.message || "Failed to upload avatar");
        } finally {
          setUploading(false);
        }
      }, "image/png");
    } catch (error) {
      console.error("Cropping error:", error);
      toast.error("Error cropping image");
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-[#0F0F12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
            <div>
              <h3 className="text-base font-semibold text-white">Crop Agent Avatar</h3>
              <p className="text-xs text-gray-400">Position and scale your launcher icon</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 flex flex-col items-center">
            {!imageSrc ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 border-2 border-dashed border-white/15 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/[0.02] transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
                  <FiUploadCloud size={28} />
                </div>
                <span className="text-sm font-medium text-white mb-1">Click or drag image here</span>
                <span className="text-xs text-gray-400">Supports PNG, JPG, WebP, GIF (Max 5MB)</span>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full">
                {/* Canvas Canvas Preview */}
                <div
                  className="relative rounded-2xl overflow-hidden border border-white/10 bg-black cursor-move shadow-inner select-none"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                >
                  <canvas ref={canvasRef} width={280} height={280} className="block" />
                </div>

                {/* Controls */}
                <div className="w-full mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                    >
                      <FiZoomOut size={16} />
                    </button>
                    <input
                      type="range"
                      min="0.6"
                      max="3.0"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="flex-1 accent-cyan-400 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                    />
                    <button
                      onClick={() => setZoom((z) => Math.min(3.0, z + 0.15))}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                    >
                      <FiZoomIn size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setZoom(1);
                        setPan({ x: 0, y: 0 });
                      }}
                      title="Reset position and zoom"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                      <FiRotateCcw size={16} />
                    </button>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Drag circle to re-center</span>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-cyan-400 hover:underline"
                    >
                      Choose different file
                    </button>
                  </div>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/10 bg-white/[0.02]">
            <button
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCropAndUpload}
              disabled={!imageSrc || uploading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-violet-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {uploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Uploading to S3...</span>
                </>
              ) : (
                <>
                  <FiCheck size={14} />
                  <span>Apply & Upload</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
