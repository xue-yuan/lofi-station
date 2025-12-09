export interface Channel {
    id: string;
    title: string;
    author: string;
}

export interface StationCategory {
    id: string;
    name: string;
    description: string;
    channels: Channel[];
}

export const STATION_CATEGORIES: StationCategory[] = [
    {
        id: 'lofi',
        name: 'Lofi',
        description: 'Beats to relax/study/sleep to',
        channels: [
            { id: 'jfKfPfyJRdk', title: 'lofi hip hop radio 📚 beats to relax/study to', author: 'Lofi Girl' },
            { id: 'h_a3tqywv3I', title: 'christmas lofi music🎄cozy radio to get festive to', author: 'Lofi Girl' },
            { id: 'rPjez8z61rI', title: 'lofi hip hop radio – beats to sleep/study/relax to ☕', author: 'STEEZYASFUCK' }
        ]
    },
    {
        id: 'jazz',
        name: 'Jazz',
        description: 'Beats to relax/study/sleep to',
        channels: [
            { id: 'A8jDx9TLMQc', title: 'relaxing jazz music 🌹 cozy radio to study/chill to', author: 'Lofi Girl' },
            { id: 'h_a3tqywv3I', title: 'christmas lofi music🎄cozy radio to get festive to', author: 'Lofi Girl' },
        ]
    },
    {
        id: 'hip-hop',
        name: 'Hip Hop',
        description: 'Beats to relax/study/sleep to',
        channels: [
            { id: 'Oblb4xGO6k4', title: 'Boom Bap Hip Hop Instrumental Radio 24/7 | Beats to Work & Chill 🎧', author: ' Vibin\' 🎼' },
        ]
    },
    {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        description: 'Futuristic & Sci-Fi Ambiance',
        channels: [
            { id: '4xDzrJKXOOY', title: 'synthwave radio 🌌 beats to chill/game to', author: 'Lofi Girl' },
            { id: 'UedTcufyrHc', title: 'ChillSynth FM - lofi synthwave radio for retro dreaming', author: 'Nightride FM' }
        ]
    }
];
