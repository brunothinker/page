// =========================================================
// 0. FILE:// PROTOCOL FALLBACK FOR NAVIGATION LINKS
// =========================================================
if (window.location.protocol === 'file:') {
    const navDownloads = document.getElementById('nav-downloads');
    if (navDownloads) navDownloads.href = 'downloads/index.html';

    const navHome = document.getElementById('nav-home');
    if (navHome) navHome.href = '../index.html';
}

// =========================================================
// 1. STATIC ASSETS, LINKS & DYNAMIC TRANSLATED CONTENT
// =========================================================
const schemaEl = document.getElementById('schema-software');
if (schemaEl) {
    const schema = JSON.parse(schemaEl.textContent);
    const appNode = schema['@graph']?.find(item => item['@type'] === 'SoftwareApplication') || schema;
    appNode.softwareVersion = CONFIG.version;
    schemaEl.textContent = JSON.stringify(schema);
}

Object.entries(CONFIG.icons).forEach(([key, path]) => {
    document.querySelectorAll(`[data-icon="${key}"]`).forEach(img => {
        img.src = path;
    });
});

const urlMap = {
    'btn-windows': CONFIG.urls.windows,
    'btn-deb': CONFIG.urls.deb,
    'btn-rpm': CONFIG.urls.rpm,
    'btn-appimage': CONFIG.urls.appImage
};
Object.entries(urlMap).forEach(([id, href]) => {
    const el = document.getElementById(id);
    if (el) el.href = href;
});

function renderTranslatedDynamicParts() {
    const versionBadge = document.getElementById('version-badge');
    if (versionBadge) {
        versionBadge.textContent = I18N.t('common.version_badge', { version: CONFIG.version });
    }

    const labelMap = {
        'label-windows': I18N.t('downloads.labels.windows', { version: CONFIG.version }),
        'label-deb': I18N.t('downloads.labels.deb', { version: CONFIG.version }),
        'label-rpm': I18N.t('downloads.labels.rpm', { version: CONFIG.version }),
        'label-appimage': I18N.t('downloads.labels.appimage', { version: CONFIG.version })
    };
    Object.entries(labelMap).forEach(([id, text]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    });

    document.querySelectorAll('[data-filename]').forEach(el => {
        const key = el.getAttribute('data-filename');
        if (CONFIG.files[key]) {
            el.textContent = CONFIG.files[key];
        }
    });

    const cmdDeb = document.getElementById('cmd-deb');
    if (cmdDeb) {
        cmdDeb.textContent = `sudo apt update && sudo apt install -y curl\ncurl -fL ${CONFIG.urls.deb} -o /tmp/${CONFIG.files.deb}\nsudo apt install -y /tmp/${CONFIG.files.deb} && rm -f /tmp/${CONFIG.files.deb}`;
    }

    const cmdRpm = document.getElementById('cmd-rpm');
    if (cmdRpm) {
        cmdRpm.textContent = `sudo dnf check-update; sudo dnf install -y curl\ncurl -fL ${CONFIG.urls.rpm} -o /tmp/${CONFIG.files.rpm}\nsudo dnf install -y /tmp/${CONFIG.files.rpm} && rm -f /tmp/${CONFIG.files.rpm}`;
    }

    const cmdAppImage = document.getElementById('cmd-appimage');
    if (cmdAppImage) {
        const comment = I18N.t('downloads.guides.appimage_curl_comment');
        cmdAppImage.textContent = `${comment}\ncurl -fLO ${CONFIG.urls.appImage}\nchmod +x ${CONFIG.files.appImage}\n./${CONFIG.files.appImage}`;
    }

    updateDownloadsBadgeText();
    renderScreenshotThumbs();
}

// Copy buttons for terminal commands
const COPY_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
const CHECK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        const targetId = btn.getAttribute('data-copy-target');
        const codeEl = document.getElementById(targetId);
        if (!codeEl) return;

        try {
            await navigator.clipboard.writeText(codeEl.textContent);
            btn.innerHTML = CHECK_ICON;
            btn.classList.add('copied');
            btn.title = I18N.t('common.copied');
            setTimeout(() => {
                btn.innerHTML = COPY_ICON;
                btn.classList.remove('copied');
                btn.title = I18N.t('common.copy_command');
            }, 1600);
        } catch {
            btn.title = I18N.t('common.copy_failed');
        }
    });
});

// =========================================================
// 2. GITHUB LIVE METRICS (VERSION DOWNLOADS & REPO STARS)
// =========================================================
let cachedTotalDownloads = null;

function updateDownloadsBadgeText() {
    const badge = document.getElementById('downloads-badge');
    const label = document.getElementById('version-downloads-count');
    if (!badge || !label || cachedTotalDownloads === null) return;

    const formatted = cachedTotalDownloads.toLocaleString(I18N.getLang());
    const key = cachedTotalDownloads === 1
        ? 'hero.downloads_count_singular'
        : 'hero.downloads_count_plural';

    label.textContent = I18N.t(key, {
        count: formatted,
        version: CONFIG.version
    });
    badge.hidden = false;
}

async function loadGitHubStats() {
    const badge = document.getElementById('downloads-badge');
    const pill = document.getElementById('github-stars');
    if (!badge && !pill) return;

    const apiBase = `https://api.github.com/repos/${CONFIG.repoOwner}/${CONFIG.repoName}`;

    if (badge) {
        try {
            const releaseRes = await fetch(`${apiBase}/releases/tags/v${CONFIG.version}`);
            if (releaseRes.ok) {
                const releaseData = await releaseRes.json();
                cachedTotalDownloads = (releaseData.assets || []).reduce(
                    (sum, asset) => sum + (asset.download_count || 0),
                    0
                );
                updateDownloadsBadgeText();
            }
        } catch {
            // Silently keep badge hidden if rate-limited or offline
        }
    }

    if (pill) {
        try {
            const repoRes = await fetch(apiBase);
            if (repoRes.ok) {
                const repoData = await repoRes.json();
                const stars = repoData.stargazers_count;
                if (typeof stars === 'number') {
                    pill.textContent = `★ ${stars.toLocaleString(I18N.getLang())}`;
                    pill.hidden = false;
                }
            }
        } catch {
            // Ignore network errors
        }
    }
}

// =========================================================
// 3. APP SCREENSHOT SHOWCASE
// =========================================================
const screenshotImg = document.getElementById('app-screenshot');
const screenshotPlaceholder = document.getElementById('screenshot-placeholder');
const thumbsContainer = document.getElementById('screenshot-thumbs');
let activeScreenshotIndex = 0;

function setScreenshot(index) {
    const item = CONFIG.screenshots[index];
    if (!item || !screenshotImg) return;

    activeScreenshotIndex = index;
    screenshotImg.style.display = 'block';
    if (screenshotPlaceholder) screenshotPlaceholder.style.display = 'none';
    screenshotImg.src = item.src;
    screenshotImg.alt = item.labelKey ? I18N.t(item.labelKey) : (item.label || '');

    document.querySelectorAll('.thumb-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', idx === index);
    });
}

function renderScreenshotThumbs() {
    if (!screenshotImg || CONFIG.screenshots.length === 0) return;

    setScreenshot(activeScreenshotIndex);

    if (thumbsContainer) {
        thumbsContainer.innerHTML = '';
        if (CONFIG.screenshots.length > 1) {
            CONFIG.screenshots.forEach((shot, index) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `thumb-btn ${index === activeScreenshotIndex ? 'active' : ''}`;
                btn.textContent = shot.labelKey ? I18N.t(shot.labelKey) : shot.label;
                btn.addEventListener('click', () => setScreenshot(index));
                thumbsContainer.appendChild(btn);
            });
        }
    }
}

if (screenshotImg) {
    screenshotImg.addEventListener('error', () => {
        screenshotImg.style.display = 'none';
        if (screenshotPlaceholder) screenshotPlaceholder.style.display = 'block';
    });
}

// =========================================================
// 4. DOWNLOADS ACCORDION
// =========================================================
const accordionItems = document.querySelectorAll('.accordion-item');

accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');

    header.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        accordionItems.forEach(other => {
            other.classList.remove('open');
            other.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
            item.classList.add('open');
            header.setAttribute('aria-expanded', 'true');
        }
    });
});

// =========================================================
// 5. BOOTSTRAP I18N & DATA
// =========================================================
document.addEventListener('i18n:ready', () => {
    renderTranslatedDynamicParts();
});

I18N.init().then(() => {
    loadGitHubStats();
});