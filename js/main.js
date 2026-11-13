// =========================================================
// 1. POPULATE VERSION, ICONS & RELEASE LINKS
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

// =========================================================
// 2. APP SCREENSHOT SHOWCASE
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

// Show friendly placeholder if image file is not added yet
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
// 3. DOWNLOADS ACCORDION + OS DETECTION
// =========================================================
const accordionItems = document.querySelectorAll('.accordion-item');

accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');

    header.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close other items to keep the layout clean
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

// Detect visitor OS and highlight recommended option
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