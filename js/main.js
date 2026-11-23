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
// 1. POPULATE VERSION, ICONS, LINKS & DYNAMIC COMMANDS
// =========================================================
const versionBadge = document.getElementById('version-badge');
if (versionBadge) {
    versionBadge.textContent = `v${CONFIG.version} • Open Source`;
}

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

const labelMap = {
    'label-windows': CONFIG.labels.windows,
    'label-deb': CONFIG.labels.deb,
    'label-rpm': CONFIG.labels.rpm,
    'label-appimage': CONFIG.labels.appImage
};
Object.entries(labelMap).forEach(([id, text]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
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

// Keep filenames and terminal install commands synced with CONFIG.version
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
    cmdAppImage.textContent = `# Make sure curl is installed (e.g., sudo pacman -Syu --needed curl)\ncurl -fLO ${CONFIG.urls.appImage}\nchmod +x ${CONFIG.files.appImage}\n./${CONFIG.files.appImage}`;
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
            btn.title = 'Copied!';
            setTimeout(() => {
                btn.innerHTML = COPY_ICON;
                btn.classList.remove('copied');
                btn.title = 'Copy command';
            }, 1600);
        } catch {
            btn.title = 'Failed to copy';
        }
    });
});

// =========================================================
// 2. GITHUB LIVE METRICS (VERSION DOWNLOADS & REPO STARS)
// =========================================================
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
                const totalDownloads = (releaseData.assets || []).reduce(
                    (sum, asset) => sum + (asset.download_count || 0),
                    0
                );

                const label = document.getElementById('version-downloads-count');
                if (label) {
                    const formatted = totalDownloads.toLocaleString('en-US');
                    label.textContent = `${formatted} ${totalDownloads === 1 ? 'download' : 'downloads'} (v${CONFIG.version})`;
                    badge.hidden = false;
                }
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
                    pill.textContent = `★ ${stars.toLocaleString('en-US')}`;
                    pill.hidden = false;
                }
            }
        } catch {
            // Ignore network errors
        }
    }
}

loadGitHubStats();

// =========================================================
// 3. APP SCREENSHOT SHOWCASE
// =========================================================
const screenshotImg = document.getElementById('app-screenshot');
const screenshotPlaceholder = document.getElementById('screenshot-placeholder');
const thumbsContainer = document.getElementById('screenshot-thumbs');

function setScreenshot(index) {
    const item = CONFIG.screenshots[index];
    if (!item || !screenshotImg) return;

    screenshotImg.style.display = 'block';
    if (screenshotPlaceholder) screenshotPlaceholder.style.display = 'none';
    screenshotImg.src = item.src;
    screenshotImg.alt = item.label;

    document.querySelectorAll('.thumb-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', idx === index);
    });
}

if (screenshotImg) {
    screenshotImg.addEventListener('error', () => {
        screenshotImg.style.display = 'none';
        if (screenshotPlaceholder) screenshotPlaceholder.style.display = 'block';
    });

    if (CONFIG.screenshots.length > 0) {
        setScreenshot(0);

        if (CONFIG.screenshots.length > 1 && thumbsContainer) {
            CONFIG.screenshots.forEach((shot, index) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `thumb-btn ${index === 0 ? 'active' : ''}`;
                btn.textContent = shot.label;
                btn.addEventListener('click', () => setScreenshot(index));
                thumbsContainer.appendChild(btn);
            });
        }
    }
}

// =========================================================
// 4. DOWNLOADS ACCORDION + OS DETECTION
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

function detectUserOS() {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('win')) return 'windows';
    if (ua.includes('fedora') || ua.includes('red hat') || ua.includes('centos')) return 'fedora';
    if (ua.includes('linux') || ua.includes('ubuntu') || ua.includes('debian')) return 'debian';
    return null;
}

const detectedOS = detectUserOS();
if (detectedOS && accordionItems.length > 0) {
    const targetItem = document.querySelector(`.accordion-item[data-os="${detectedOS}"]`);
    if (targetItem) {
        const tag = targetItem.querySelector('.recommended-tag');
        if (tag) tag.hidden = false;

        // Auto-expand the detected OS drawer on the dedicated /downloads/ page
        targetItem.classList.add('open');
        targetItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'true');
    }
}