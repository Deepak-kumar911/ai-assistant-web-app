import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiImage, FiVideo, FiCalendar, FiClock } from "react-icons/fi";
import { uploadMediaApi } from "../../../../api/uploadApi";
import { useSelector } from "react-redux";
import { workflowService } from "../../../../services/workflowService";

const InstagramPublisher = () => {
  const navigate = useNavigate();
  const { details: integrationDetails } = useSelector(state => state?.integration);
  const [mediaType, setMediaType] = useState("post");
  const [media, setMedia] = useState([]);
  const [caption, setCaption] = useState("");
  const [schedule, setSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const postTypes = {
    "post": { label: "Post", icon: FiImage, mediaType: "IMAGE", },
    "reel": { label: "Reel", icon: FiVideo, mediaType: "REELS" },
    "carousel": { label: "Carousel", icon: FiImage, mediaType: "CAROUSEL" },
    "video": { label: "Video", icon: FiVideo, mediaType: "VIDEO" },
    "story": { label: "Story", icon: FiVideo, mediaType: "STORIES" },
  };

  const handleFileChange = async (e) => {
    if (loading) return;
    const files = Array.from(e.target.files);

    setLoading(true);

    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();

          formData.append("file", file);
          formData.append("folderName", `instagram/${mediaType}`);
          const { data } = await uploadMediaApi(formData);
          return { file, mediaUrl: data?.mediaUrl };
        })
      );
      setMedia(uploaded);
    } catch (err) {
      alert("Failed to upload media");
    } finally {
      setLoading(false);
    }
  };

  // Quick-Schedule via Workflow Engine (PRD REQ-WF-06, TRD §2.4, AGENT_TASK_PLAN.md Task 29)
  const handleQuickSchedule = async (isImmediate = false) => {
    if (submitting) return;
    if (!media?.length || !media[0]?.mediaUrl) {
      alert("Please upload at least one image or video.");
      return;
    }
    if (!caption.trim()) {
      alert("Please enter a caption for your post.");
      return;
    }
    if (!isImmediate && schedule && !scheduleDate) {
      alert("Please select a date and time for the scheduled post.");
      return;
    }

    setSubmitting(true);
    try {
      const selectedMedia = media[0]?.mediaUrl;
      const targetMediaType = postTypes[mediaType]?.mediaType || "IMAGE";

      await workflowService.quickSchedulePost({
        mediaUrl: selectedMedia,
        caption,
        mediaType: targetMediaType,
        scheduleDate: isImmediate ? null : (schedule ? scheduleDate : null),
      });

      alert(isImmediate ? "Post submitted for immediate publishing!" : "Post scheduled successfully!");
      navigate("/integration/instagram/post-scheduler");
    } catch (err) {
      console.error("[QUICK SCHEDULE ERROR]", err);
      alert(err.message || "Failed to schedule post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Create Instagram {postTypes?.[mediaType]?.label}</h2>
        <button
          onClick={() => navigate("/integration/instagram/post-scheduler")}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back
        </button>
      </div>

      {/* Step 1: Post Type Selection */}
      <div className="flex gap-3">
        {Object.entries(postTypes).map(([key, pt]) => (
          <button
            key={key}
            onClick={() => setMediaType(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${mediaType === key ? "bg-indigo-600 text-white" : "bg-white text-gray-600"
              }`}
          >
            <pt.icon size={18} />
            {pt.label}
          </button>
        ))}
      </div>

      {/* Step 2: Upload Media */}
      <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50">
        <input
          type="file"
          accept="image/*,video/*"
          multiple={mediaType === "carousel"}
          disabled={loading}
          className="hidden"
          id="upload"
          onChange={handleFileChange}
        />
        <label htmlFor="upload" className="block cursor-pointer">
          <FiImage className="mx-auto text-4xl text-gray-400" />
          <p className="text-gray-500">Click or drag & drop to upload {mediaType}</p>
        </label>
      </div>

      {/* Step 3: Caption & Settings */}
      <div className="space-y-4">
        <textarea
          placeholder="Write your caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
          rows={4}
        />
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={schedule}
            onChange={() => setSchedule(!schedule)}
          />
          <label className="text-gray-700 flex items-center gap-2 cursor-pointer">
            <FiClock /> Schedule Post
          </label>
        </div>
        {schedule && (
          <input
            type="datetime-local"
            className="border rounded-lg p-2"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
          />
        )}
      </div>

      {/* Step 4: Preview */}
      <div className="border rounded-xl p-4 bg-white shadow-sm">
        <p className="font-medium mb-2">Preview</p>
        <div className="border rounded-lg overflow-hidden max-w-sm">
          {media.length > 0 ? (
            <img
              src={media?.[0]?.mediaUrl}
              alt="preview"
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-400">
              No media uploaded
            </div>
          )}
          <div className="p-3">
            <p className="text-sm text-gray-800">{caption || "Your caption here..."}</p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3">
        {schedule ? (
          <button
            onClick={() => handleQuickSchedule(false)}
            disabled={loading || !media?.length || submitting}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
          >
            {submitting ? "Scheduling Post..." : "Schedule Post"}
          </button>
        ) : (
          <button
            onClick={() => handleQuickSchedule(true)}
            disabled={loading || !media?.length || submitting}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
          >
            {submitting ? "Publishing Post..." : "Publish Now"}
          </button>
        )}
      </div>
    </div>
  );
};

export default InstagramPublisher;
