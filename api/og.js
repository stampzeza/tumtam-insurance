
const SITE_URL = 'https://tumtaminsure.co';
const DEFAULT_IMAGE = `${SITE_URL}/default-cover.jpg`;

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

export default async function handler(req, res) {
  const slug = String(req.query.slug || '').trim();

  if (!slug || slug.length > 200) {
    return res.status(400).send('Invalid slug');
  }

  const apiBase = process.env.BACKEND_API_URL?.replace(/\/+$/, '');

  if (!apiBase) {
    return res.status(500).send('Backend API is not configured');
  }

  try {
    const response = await fetch(`${apiBase}/api/plans`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const plans = await response.json();
    const plan = Array.isArray(plans)
      ? plans.find((item) => item.slug === slug && item.is_active !== false)
      : null;

    if (!plan) {
      return res.status(404).send('Plan not found');
    }

    const title = `${plan.title || 'แผนประกัน'} | ตูมตาม ประกันออนไลน์`;
    const description = plan.description
      ? String(plan.description).replace(/\\n/g, ' ').slice(0, 200)
      : 'รายละเอียดแผนประกันภัยจากตูมตาม ประกันออนไลน์';

    const image = plan.google_drive_file_id
      ? `https://lh3.googleusercontent.com/d/${encodeURIComponent(plan.google_drive_file_id)}`
      : DEFAULT_IMAGE;

    const pageUrl = `${SITE_URL}/?slug=${encodeURIComponent(slug)}`;

    const html = `<!doctype html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${escapeHtml(pageUrl)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:image:secure_url" content="${escapeHtml(image)}">
<meta property="og:image:alt" content="${escapeHtml(plan.title || 'แผนประกัน')}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(image)}">
</head>
<body>
<h1>${escapeHtml(title)}</h1>
<p>${escapeHtml(description)}</p>
<a href="${escapeHtml(pageUrl)}">ดูรายละเอียดแผนประกัน</a>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300');
    return res.status(200).send(html);
  } catch (error) {
    console.error('OG metadata error:', error);
    return res.status(502).send('Unable to load plan metadata');
  }
}
