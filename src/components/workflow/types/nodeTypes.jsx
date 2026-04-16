// flow/nodeTypes.js

import CustomCommentReplyNode from "../nodes/custom/CustomCommentReplyNode";
import CustomDMNode from "../nodes/custom/CustomDMNode";
import CustomInstagramNode from "../nodes/custom/CustomInstagramNode";
import CustomScheduleNode from "../nodes/custom/CustomScheduleNode";


export const nodeTypes = {
  schedule: CustomScheduleNode,
  instagram: CustomInstagramNode,
  commentReply: CustomCommentReplyNode,
  dm: CustomDMNode,
};
