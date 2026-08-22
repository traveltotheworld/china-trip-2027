const SUPABASE_URL = process.env.SUPABASE_URL || 'https://knthbmgrkrflvubvzvhp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_PEglDSFIhB3xAAucE8sNjg_pQMql8FM';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    // A tiny read against the same app_data table used by the website.
    // This creates real database activity without changing any data.
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/app_data?select=data_key&limit=1`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const text = await response.text();
    if (!response.ok) {
      return res.status(502).json({
        ok: false,
        status: response.status,
        message: text.slice(0, 300),
      });
    }

    return res.status(200).json({
      ok: true,
      service: 'supabase-ping',
      at: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error?.message || 'Ping failed',
    });
  }
}
