import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).setHeader('Access-Control-Allow-Origin', '*').end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email } = req.body ?? {};

    if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email is required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
    }

    try {
        const { error } = await supabase
            .from('waitlist')
            .upsert(
                { email: email.toLowerCase().trim() },
                { onConflict: 'email' }
            );

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Something went wrong. Please try again.' });
        }

        return res
            .status(200)
            .setHeader('Access-Control-Allow-Origin', '*')
            .json({ success: true, message: "You're on the list!" });
    } catch (err) {
        console.error('Waitlist error:', err);
        return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
}
