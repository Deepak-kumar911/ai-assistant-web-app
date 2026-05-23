// components/templates/InstagramTemplate.js
import { nanoid } from 'nanoid';

export const instagramTemplate = {
    nodes: [
        {
            id: nanoid(),
            type: 'schedule',
            position: { x: 100, y: 100 },
            data: {
                scheduleType: 'future',
                scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
                scheduledTime: '10:00'
            }
        },
        {
            id: nanoid(),
            type: 'instagram',
            position: { x: 400, y: 100 },
            data: {
                credentialId: '',
                credentialName: '',
                postType: 'post',
                media: [],
                caption: '',
                scheduleType: 'instant',
                location: '',
                firstComment: ''
            }
        },
        {
            id: nanoid(),
            type: 'commentReply',
            position: { x: 700, y: 100 },
            data: {
                mode: 'keyword',
                keyword: '',
                reply: '',
                prompt: ''
            }
        }
    ],
    edges: []
    // edges: [
    //     {
    //         id: nanoid(),
    //         source: nodes[0].id,
    //         target: nodes[1].id,
    //         sourceHandle: 'schedule',
    //         targetHandle: 'in',
    //         animated: true
    //     },
    //     {
    //         id: nanoid(),
    //         source: nodes[1].id,
    //         target: nodes[2].id,
    //         sourceHandle: 'comments',
    //         targetHandle: 'keyword',
    //         animated: true
    //     }
    // ]
};