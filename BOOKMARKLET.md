# Job Hunter Bookmarklet

## Setup

1. Right-click your browser's bookmarks bar
2. Click "Add page" / "Add bookmark"
3. Set the name to: **+ Job Hunter**
4. Paste this entire line as the URL:

```
javascript:void(function(){var t='',c='',u=window.location.href;var h1=document.querySelector('h1');if(h1)t=h1.textContent.trim();var el=document.querySelector('.job-details-jobs-unified-top-card__company-name a, .topcard__org-name-link, .jobs-unified-top-card__company-name a');if(el)c=el.textContent.trim();if(!t||!c){var parts=document.title.split('|').map(function(s){return s.trim()});if(parts.length>=3&&parts[parts.length-1]==='LinkedIn'){if(!t)t=parts[0];if(!c)c=parts[1]}else if(parts.length>=2){if(!t)t=parts[0];if(!c){var m=document.title.match(/at\s+(.+?)(?:\s*[|\-]|$)/);if(m)c=m[1].trim()}}}window.open('http://localhost:5173/?title='+encodeURIComponent(t)+'&company='+encodeURIComponent(c)+'&url='+encodeURIComponent(u),'_blank')}())
```

## How to use

1. Go to any job posting on LinkedIn (or any job site)
2. Click the **+ Job Hunter** bookmark
3. Job Hunter opens with the title, company, and URL pre-filled
4. Add any extra details and save!

## What it grabs

- **Title**: The page's h1 heading (works on most job sites)
- **Company**: LinkedIn-specific selectors, falls back to parsing the page title
- **URL**: The current page URL

## Note

This works with the dev server at localhost:5173. If you deploy the app, update the URL in the bookmarklet.
