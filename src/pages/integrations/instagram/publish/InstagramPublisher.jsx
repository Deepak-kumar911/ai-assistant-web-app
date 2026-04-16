import { useState } from "react";
import { FiImage, FiVideo, FiCalendar, FiClock } from "react-icons/fi";
import { uploadMediaApi } from "../../../../utils/apis/uploadApi";
import { useSelector } from "react-redux";
import { createInstaMediaContainerApi, publishMediaContainerApi } from "../../../../utils/apis/integration/instagramIntegrationApi";
import FlowCanvas from "../../../../components/workflow/canvas/FlowCanvas";

const InstagramPublisher = () => {
  const { details:integrationDetails } = useSelector(state => state?.integration)
  const [mediaType, setMediaType] = useState("post");
  const [media, setMedia] = useState([]);
  const [caption, setCaption] = useState("");
  const [schedule, setSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publising, setPublising] = useState(false);
  const [mediaContainerId, setMediaContainerId] = useState(null);

  const aiAgentId = integrationDetails?._id
  const activeIntegrationId = integrationDetails?.activeIntegrationId

  const postTypes = {
    "post":{label: "Post", icon: FiImage, mediaType: "IMAGE" ,},
    "reel":{ label: "Reel", icon: FiVideo, mediaType: "REELS" },
    "carousel": {label: "Carousel", icon: FiImage, mediaType: "CAROUSEL" },
    "video":{label: "Video", icon: FiVideo, mediaType: "VIDEO" },
    "story":{label: "Story", icon: FiVideo, mediaType: "STORIES" },
  };

  const handleFileChange = async (e) => {
    if (loading) return
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

  const handleSaveMedia = async () => {
    if (saving || !media?.length || !caption ||!mediaType) return
    setSaving(true);

    try {
      const payload = { activeIntegrationId, mediaUrl:media?.[0]?.mediaUrl, mediaType:postTypes?.[mediaType]?.mediaType, caption}
      const { data } = await createInstaMediaContainerApi(payload);
      setMediaContainerId(data?.containerId);
    } catch (err) {
      console.log("error to save",err);
      
      alert("Failed to save media");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishMedia = async (e) => {
    if (publising || !mediaContainerId) return
    setPublising(true);

    try {
      const payload = { activeIntegrationId,containerId:mediaContainerId}
      const { data } = await publishMediaContainerApi(payload);
      console.log("data",data);
      alert("Posted")
    } catch (err) {
      alert("Failed to publish media");
    } finally {
      setPublising(false);
    }
  };

  console.log("media",mediaContainerId);
  

  return (
    <div className="">
        <FlowCanvas />
      <div className="flex h-screen w-full overflow-hidden">
      </div>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Create Instagram {postTypes?.[mediaType]?.label}</h2>
        <button className="px-4 py-2 bg-gray-100 rounded-lg">Back</button>
      </div>

      {/* Step 1: Post Type Selection */}
      <div className="flex gap-3">
        {Object.entries(postTypes).map(([key,pt]) => (
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
        <button onClick={handleSaveMedia} disabled={loading || !media?.length || saving} className="px-4 py-2 border rounded-lg">Save</button>
        {schedule ? (
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Schedule</button>
        ) : (
          <button onClick={handlePublishMedia} disabled={!mediaContainerId}  className="px-4 py-2 bg-green-600 text-white rounded-lg">Publish</button>
        )}
      </div>
    </div>
  );
};

export default InstagramPublisher;
