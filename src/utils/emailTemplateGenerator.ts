import { TravelLog, LiveLocation } from '../types';

export interface GenerateEmailOptions {
  log: Partial<TravelLog>;
  liveLocation?: LiveLocation;
  customSubject?: string;
  customNote?: string;
  senderName?: string;
  appBaseUrl?: string;
}

export function generateJournalEmailHtml(options: GenerateEmailOptions): { html: string; plainText: string; defaultSubject: string } {
  const {
    log,
    liveLocation,
    customSubject,
    customNote,
    senderName = 'Joannie & Barton Neveu',
    appBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-mni42zihstckvgsdpd6pe2-693897229959.us-east1.run.app'
  } = options;

  const title = log.title || 'New Expedition Journal Entry';
  const location = log.locationName || liveLocation?.lastCity || 'On the Road';
  const country = log.country || 'Canada';
  const date = log.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const author = log.author || senderName;
  const coverImage = log.coverImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
  const resolvedCoverImage = coverImage.startsWith('http') 
    ? coverImage 
    : (coverImage.startsWith('/') ? `${appBaseUrl}${coverImage}` : `${appBaseUrl}/${coverImage}`);
  
  const excerpt = log.excerpt || (log.content ? log.content.substring(0, 240).replace(/[#*`_>]/g, '') + '...' : 'A new chapter of our overland sabbatical journey has been published.');
  
  // Category label
  let categoryLabel = 'Adventures & MBA on the Road';
  let categoryColor = '#1E3A8A';
  if (log.category === 'henri_milestones') {
    categoryLabel = "Henri's Milestones (Baby on Board 🍼)";
    categoryColor = '#065F46';
  } else if (log.category === 'visits_along_the_way') {
    categoryLabel = 'Visits Along the Way & Family Reconnections';
    categoryColor = '#7C2D12';
  }

  const defaultSubject = customSubject || `🌲 New Overland Chapter: ${title}`;

  // Gallery preview images (up to 3)
  const galleryItems = (log.gallery || []).slice(0, 3);

  // HTML Template
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F5F3EF;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1C1917;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #F5F3EF;
      padding: 30px 15px;
    }
    .container {
      max-width: 620px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid #E7E5E0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }
    .header-banner {
      background-color: #1E3A8A;
      background-image: linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%);
      color: #FFFFFF;
      padding: 28px 24px 22px;
      text-align: center;
    }
    .expedition-subtitle {
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      font-weight: 700;
      color: #93C5FD;
      margin-bottom: 6px;
    }
    .expedition-title {
      font-family: Georgia, Cambria, 'Times New Roman', Times, serif;
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 6px;
      color: #FFFFFF;
      line-height: 1.3;
    }
    .expedition-route {
      font-size: 12px;
      color: #BFDBFE;
      margin: 0;
    }
    .hero-image-wrap {
      width: 100%;
      max-height: 320px;
      overflow: hidden;
      background-color: #E2E8F0;
      position: relative;
    }
    .hero-image {
      width: 100%;
      height: auto;
      display: block;
      object-fit: cover;
      max-height: 320px;
    }
    .content-body {
      padding: 30px 28px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    .journal-title {
      font-family: Georgia, Cambria, 'Times New Roman', Times, serif;
      font-size: 24px;
      font-weight: 700;
      color: #0F172A;
      margin: 0 0 12px;
      line-height: 1.3;
    }
    .meta-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      padding-bottom: 18px;
      margin-bottom: 20px;
      border-bottom: 1px solid #F1F0EC;
      font-size: 13px;
      color: #64748B;
    }
    .meta-item {
      display: inline-block;
    }
    .personal-note-box {
      background-color: #FEF3C7;
      border-left: 4px solid #D97706;
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 22px;
      font-size: 13px;
      color: #78350F;
      line-height: 1.5;
    }
    .story-excerpt {
      font-size: 15px;
      line-height: 1.65;
      color: #334155;
      margin-bottom: 24px;
      font-style: italic;
    }
    .highlight-card {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .highlight-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #1E3A8A;
      margin-bottom: 4px;
    }
    .highlight-text {
      font-size: 13px;
      color: #334155;
      line-height: 1.5;
      margin: 0;
    }
    .cta-container {
      text-align: center;
      padding: 10px 0 26px;
    }
    .cta-button {
      display: inline-block;
      background-color: #1E3A8A;
      color: #FFFFFF !important;
      font-size: 14px;
      font-weight: 700;
      padding: 14px 28px;
      border-radius: 12px;
      text-decoration: none;
      box-shadow: 0 4px 12px rgba(30, 58, 138, 0.25);
    }
    .gallery-preview {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #F1F0EC;
    }
    .gallery-title {
      font-size: 12px;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
      text-align: center;
    }
    .gallery-grid {
      display: table;
      width: 100%;
      table-layout: fixed;
    }
    .gallery-col {
      display: table-cell;
      padding: 0 4px;
      text-align: center;
    }
    .gallery-thumb {
      width: 100%;
      height: 95px;
      border-radius: 8px;
      object-fit: cover;
      display: block;
    }
    .rig-status-box {
      background-color: #F1F5F9;
      border-radius: 12px;
      padding: 16px;
      margin-top: 24px;
      font-size: 12px;
      color: #475569;
    }
    .footer {
      background-color: #FAF8F5;
      border-top: 1px solid #E7E5E0;
      padding: 24px 28px;
      text-align: center;
      font-size: 12px;
      color: #78716C;
      line-height: 1.6;
    }
    .footer a {
      color: #1E3A8A;
      text-decoration: underline;
    }
    .family-signature {
      font-family: Georgia, Cambria, 'Times New Roman', Times, serif;
      font-size: 15px;
      color: #1C1917;
      font-style: italic;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      
      <!-- Top Expedition Banner -->
      <div class="header-banner">
        <div class="expedition-subtitle">Overland Sabbatical 2026 – 2027</div>
        <h1 class="expedition-title">The Neveu Family Expedition</h1>
        <p class="expedition-route">Newfoundland ➔ The Americas in "Mousse" (Ford F-550)</p>
      </div>

      <!-- Hero Image -->
      <div class="hero-image-wrap">
        <img src="${resolvedCoverImage}" alt="${title}" class="hero-image" />
      </div>

      <!-- Content Area -->
      <div class="content-body">
        
        <!-- Category Badge -->
        <div style="margin-bottom: 12px;">
          <span class="badge" style="background-color: ${categoryColor}15; color: ${categoryColor}; border: 1px solid ${categoryColor}30;">
            ${categoryLabel}
          </span>
        </div>

        <!-- Title -->
        <h2 class="journal-title">${title}</h2>

        <!-- Meta info -->
        <div class="meta-bar">
          <span class="meta-item">📍 <strong>${location}, ${country}</strong></span>
          <span class="meta-item">📅 ${date}</span>
          <span class="meta-item">✍️ ${author}</span>
        </div>

        ${customNote ? `
        <!-- Custom Message from Joannie & Barton -->
        <div class="personal-note-box">
          <strong>💌 Note from Joannie & Barton:</strong><br>
          ${customNote.replace(/\n/g, '<br>')}
        </div>
        ` : ''}

        <!-- Excerpt / Story Teaser -->
        <div class="story-excerpt">
          "${excerpt}"
        </div>

        ${log.henriHighlight ? `
        <!-- Henri Highlight -->
        <div class="highlight-card" style="border-left: 4px solid #10B981; background-color: #ECFDF5;">
          <div class="highlight-label" style="color: #047857;">🍼 Henri's Milestone on the Road</div>
          <p class="highlight-text" style="color: #065F46;">${log.henriHighlight}</p>
        </div>
        ` : ''}

        ${log.mbaHighlight ? `
        <!-- MBA / Rig Highlight -->
        <div class="highlight-card" style="border-left: 4px solid #3B82F6; background-color: #EFF6FF;">
          <div class="highlight-label" style="color: #1D4ED8;">🎓 MBA & Overland Learnings</div>
          <p class="highlight-text" style="color: #1E40AF;">${log.mbaHighlight}</p>
        </div>
        ` : ''}

        <!-- CTA Button -->
        <div class="cta-container">
          <a href="${appBaseUrl}" class="cta-button" target="_blank" rel="noopener noreferrer">
            📖 Read Full Journal & High-Res Gallery
          </a>
        </div>

        ${galleryItems.length > 0 ? `
        <!-- Photo Gallery Preview -->
        <div class="gallery-preview">
          <div class="gallery-title">Photos from this Entry</div>
          <div class="gallery-grid">
            ${galleryItems.map(item => {
              const itemUrl = item.url.startsWith('http') 
                ? item.url 
                : (item.url.startsWith('/') ? `${appBaseUrl}${item.url}` : `${appBaseUrl}/${item.url}`);
              return `
              <div class="gallery-col">
                <img src="${itemUrl}" alt="${item.caption || 'Photo'}" class="gallery-thumb" />
              </div>
              `;
            }).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Live Expedition Status Widget -->
        <div class="rig-status-box">
          <div style="font-weight: 700; color: #1E293B; margin-bottom: 4px;">
            🧭 Expedition & Rig Live Status
          </div>
          <div>
            <strong>Current Waypoint:</strong> ${liveLocation?.lastCity || location}<br>
            <strong>Next Milestone:</strong> ${liveLocation?.nextMilestone || 'Top of the World Highway & Dawson City'}<br>
            <strong>Weather & Conditions:</strong> ${liveLocation?.weather?.tempC ? `${liveLocation.weather.tempC}°C, ${liveLocation.weather.condition}` : 'Pleasant & clear skies'}
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="family-signature">
          With love from the road,<br>
          Joannie, Barton, Henri & Mousse 🐾
        </div>
        <p style="margin: 0 0 10px;">
          You are receiving this private update because your subscription was approved by Joannie & Barton.
        </p>
        <p style="margin: 0; font-size: 11px; color: #A8A29E;">
          <a href="${appBaseUrl}">Visit Live Website</a> • 
          <a href="${appBaseUrl}">Leave a Comment</a> • 
          <a href="${appBaseUrl}">View Live GPS Radar</a>
        </p>
      </div>

    </div>
  </div>
</body>
</html>
  `.trim();

  // Plain text fallback
  const plainText = `
================================================================================
                    THE NEVEU FAMILY OVERLAND EXPEDITION
          Newfoundland ➔ The Americas | Joannie, Barton, Henri & Mousse
================================================================================

${defaultSubject}

📍 Location: ${location}, ${country}
📅 Date: ${date}
✍️ Author: ${author}

${customNote ? `\n--- Note from Joannie & Barton ---\n${customNote}\n---------------------------------\n` : ''}

STORY TEASER:
"${excerpt}"

${log.henriHighlight ? `\n🍼 HENRI'S MILESTONE:\n${log.henriHighlight}\n` : ''}
${log.mbaHighlight ? `\n🎓 MBA & RIG INSIGHT:\n${log.mbaHighlight}\n` : ''}

Read the full chapter, view interactive map pins, and browse full-resolution photos:
👉 ${appBaseUrl}

--------------------------------------------------------------------------------
CURRENT RIG STATUS:
• Current Location: ${liveLocation?.lastCity || location}
• Next Milestone: ${liveLocation?.nextMilestone || 'Dawson City'}
• Expedition Rig: 2026 Ford F-550 ("Mousse")

With love from the road,
Joannie, Barton, Henri & Mousse 🐾
================================================================================
You are receiving this because you subscribed to family updates.
  `.trim();

  return { html, plainText, defaultSubject };
}
