// =========================================================
// 1. POPULATE VERSION, ICONS, LINKS & DYNAMIC COMMANDS
// =========================================================
document.getElementById('version-badge').textContent = `v${CONFIG.version} • Open Source`;

Object.entries(CONFIG.icons).forEach(([key, path]) => {
    document.querySelectorAll(`[data-icon="${key}"]`).forEach(img => {
        img.src = path;
    });
});

document.getElementById('label-windows').textContent = CONFIG.labels.windows;
document.getElementById('label-deb').textContent = CONFIG.labels.deb;
document.getElementById('label-rpm').textContent = CONFIG.labels.rpm;
document.getElementById('label-appimage').textContent = CONFIG.labels.appImage;

document.getElementById('btn-windows').href = CONFIG.urls.windows;
document.getElementById('btn-deb').href = CONFIG.urls.deb;
document.getElementById('btn-rpm').href = CONFIG.urls.rpm;
document.getElementById('btn-appimage').href = CONFIG.urls.appImage;

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
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        const targetId = btn.getAttribute('data-copy-target');
        const codeEl = document.getElementById(targetId);
        if (!codeEl) return;

        try {
            await navigator.clipboard.writeText(codeEl.textContent);
            const original = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = original; }, 1600);
        } catch {
            btn.textContent = 'Error';
        }
    });
});

// =========================================================
// 2. GITHUB LIVE METRICS (VERSION DOWNLOADS & REPO STARS)
// =========================================================
async function loadGitHubStats() {
    const apiBase = `https://api.github.com/repos/${CONFIG.repoOwner}/${CONFIG.repoName}`;

    try {
        const releaseRes = await fetch(`${apiBase}/releases/tags/v${CONFIG.version}`);
        if (releaseRes.ok) {
            const releaseData = await releaseRes.json();
            const totalDownloads = (releaseData.assets || []).reduce(
                (sum, asset) => sum + (asset.download_count || 0),
                0
            );

            const badge = document.getElementById('downloads-badge');
            const label = document.getElementById('version-downloads-count');
            if (badge && label) {
                const formatted = totalDownloads.toLocaleString('en-US');
                label.textContent = `${formatted} ${totalDownloads === 1 ? 'download' : 'downloads'} (v${CONFIG.version})`;
                badge.hidden = false;
            }
        }
    } catch {
        // Silently keep badge hidden if rate-limited or offline
    }

    try {
        const repoRes = await fetch(apiBase);
        if (repoRes.ok) {
            const repoData = await repoRes.json();
            const stars = repoData.stargazers_count;
            if (typeof stars === 'number') {
                const pill = document.getElementById('github-stars');
                if (pill) {
                    pill.textContent = `★ ${stars.toLocaleString('en-US')}`;
                    pill.hidden = false;
                }
            }
        }
    } catch {
        // Ignore network errors
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
    if (!item) return;

    screenshotImg.style.display = 'block';
    screenshotPlaceholder.style.display = 'none';
    screenshotImg.src = item.src;
    screenshotImg.alt = item.label;

    document.querySelectorAll('.thumb-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', idx === index);
    });
}

screenshotImg.addEventListener('error', () => {
    screenshotImg.style.display = 'none';
    screenshotPlaceholder.style.display = 'block';
});

if (CONFIG.screenshots.length > 0) {
    setScreenshot(0);

    if (CONFIG.screenshots.length > 1) {
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
if (detectedOS) {
    const targetItem = document.querySelector(`.accordion-item[data-os="${detectedOS}"]`);
    if (targetItem) {
        const tag = targetItem.querySelector('.recommended-tag');
        if (tag) tag.hidden = false;
    }
}