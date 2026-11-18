// components/templates/InstagramTemplate.js
import { nanoid } from 'nanoid';

const scheduleId = nanoid();
const instaId = nanoid();
const commentId = nanoid();
const dmId = nanoid();

export const instagramTemplate = {
    nodes: [
        {
            id: scheduleId,
            type: 'schedule',
            position: { x: 50, y: 120 },
            data: {
                scheduleType: 'instant',
                interval: 'one-time',
                scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                scheduledTime: '10:00'
            }
        },
        {
            id: instaId,
            type: 'instagram',
            position: { x: 420, y: 120 },
            data: {
                credentialId: '',
                credentialName: '',
                postType: 'post',
                media: [],
                caption: '',
                location: '',
                firstComment: ''
            }
        },
        {
            id: commentId,
            type: 'commentReply',
            position: { x: 800, y: 120 },
            data: {
                mode: 'keyword',
                keyword: '',
                reply: '',
                prompt: ''
            }
        },
        {
            id: dmId,
            type: 'dm',
            position: { x: 1180, y: 120 },
            data: {
                dmType: 'text',
                text: ''
            }
        }
    ],
    edges: [
        {
            id: `e_${scheduleId}_${instaId}`,
            source: scheduleId,
            target: instaId,
            sourceHandle: 'schedule',
            targetHandle: 'in',
            animated: true,
        },
        {
            id: `e_${instaId}_${commentId}`,
            source: instaId,
            target: commentId,
            sourceHandle: 'comments',
            targetHandle: 'keyword',
            animated: true,
        },
        {
            id: `e_${commentId}_${dmId}`,
            source: commentId,
            target: dmId,
            sourceHandle: 'reply',
            targetHandle: 'in',
            animated: true,
        }
    ]
};