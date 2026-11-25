/**
 * Internationalization (i18n) controller.
 * Handles language detection, locale fetching, fallback resolution, and DOM injection.
 */
const I18N = (() => {
    let currentLang = CONFIG.i18n.defaultLang;
    let translations = {};
    let fallbackTranslations = {};

    function resolveBasePath() {
        return document.body?.dataset?.page === "downloads" ? "../" : "./";
    }

    function detectLanguage() {
        const params = new URLSearchParams(window.location.search);
        const urlLang = params.get("lang");
        if (urlLang && CONFIG.i18n.supportedLangs.includes(urlLang.toLowerCase())) {
            return urlLang.toLowerCase();
        }

        try {
            const saved = localStorage.getItem("fallbyte_lang");
            if (saved && CONFIG.i18n.supportedLangs.includes(saved)) {
                return saved;
            }
        } catch (_) { }

        const navLangs = navigator.languages || [navigator.language || "en"];
        for (const lang of navLangs) {
            if (!lang) continue;
            const base = lang.toLowerCase().split("-")[0];
            if (CONFIG.i18n.supportedLangs.includes(base)) {
                return base;
            }
        }

        return CONFIG.i18n.defaultLang;
    }

    async function fetchLocale(lang) {
        const res = await fetch(`${resolveBasePath()}locales/${lang}.json`);
        if (!res.ok) throw new Error(`Failed to load locale: ${lang}`);
        return res.json();
    }

    function resolveKey(obj, key) {
        return key.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
    }

    function t(key, vars = {}) {
        let val = resolveKey(translations, key);
        if (val === undefined) val = resolveKey(fallbackTranslations, key);
        if (val === undefined) return key;

        const allVars = { version: CONFIG.version, ...vars };
        return String(val).replace(/\{(\w+)\}/g, (_, k) =>
            allVars[k] !== undefined ? allVars[k] : `{${k}}`
        );
    }

    function applyTranslations() {
        document.querySelectorAll("[data-i18n]").forEach((el) => {
            const key = el.getAttribute("data-i18n");
            if (key) el.textContent = t(key);
        });

        document.querySelectorAll("[data-i18n-html]").forEach((el) => {
            const key = el.getAttribute("data-i18n-html");
            if (!key) return;
            const fileKey = el.getAttribute("data-os-file");
            const vars = fileKey && CONFIG.files[fileKey] ? { filename: CONFIG.files[fileKey] } : {};
            el.innerHTML = t(key, vars);
        });

        document.querySelectorAll("[data-i18n-title]").forEach((el) => {
            const key = el.getAttribute("data-i18n-title");
            if (key) el.title = t(key);
        });

        document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
            const key = el.getAttribute("data-i18n-alt");
            if (key) el.alt = t(key);
        });

        const isDownloads = document.body?.dataset?.page === "downloads";
        const titleKey = isDownloads ? "meta.downloads_title" : "meta.home_title";
        const descKey = isDownloads ? "meta.downloads_description" : "meta.home_description";

        const translatedTitle = t(titleKey);
        if (translatedTitle !== titleKey) document.title = translatedTitle;

        const metaDesc = document.querySelector('meta[name="description"]');
        const translatedDesc = t(descKey);
        if (metaDesc && translatedDesc !== descKey) {
            metaDesc.setAttribute("content", translatedDesc);
        }
    }

    function setupSwitcher() {
        const switcher = document.getElementById("lang-switcher");
        const toggle = document.getElementById("lang-toggle");
        const menu = document.getElementById("lang-menu");
        const codeLabel = document.getElementById("lang-current-code");
        if (!switcher || !toggle || !menu) return;

        if (codeLabel) codeLabel.textContent = currentLang.toUpperCase();

        menu.innerHTML = "";
        CONFIG.i18n.supportedLangs.forEach((lang) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = `lang-option ${lang === currentLang ? "active" : ""}`;
            btn.setAttribute("role", "option");
            btn.setAttribute("aria-selected", String(lang === currentLang));
            btn.innerHTML = `<span>${CONFIG.i18n.languageNames[lang] || lang}</span><span class="lang-code">${lang.toUpperCase()}</span>`;
            btn.addEventListener("click", async () => {
                switcher.classList.remove("open");
                toggle.setAttribute("aria-expanded", "false");
                await setLanguage(lang, true);
            });
            menu.appendChild(btn);
        });

        toggle.onclick = (e) => {
            e.stopPropagation();
            const open = switcher.classList.toggle("open");
            toggle.setAttribute("aria-expanded", String(open));
        };

        document.addEventListener("click", (e) => {
            if (!switcher.contains(e.target)) {
                switcher.classList.remove("open");
                toggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    async function setLanguage(lang, updateUrl = true) {
        if (!CONFIG.i18n.supportedLangs.includes(lang)) {
            lang = CONFIG.i18n.defaultLang;
        }

        if (lang === CONFIG.i18n.defaultLang && Object.keys(fallbackTranslations).length > 0) {
            translations = fallbackTranslations;
        } else {
            try {
                translations = await fetchLocale(lang);
            } catch (_) {
                translations = fallbackTranslations;
                lang = CONFIG.i18n.defaultLang;
            }
        }

        currentLang = lang;
        document.documentElement.lang = lang;

        try {
            localStorage.setItem("fallbyte_lang", lang);
        } catch (_) { }

        if (updateUrl) {
            const url = new URL(window.location.href);
            if (lang === CONFIG.i18n.defaultLang) {
                url.searchParams.delete("lang");
            } else {
                url.searchParams.set("lang", lang);
            }
            window.history.replaceState({}, "", url.toString());
        }

        setupSwitcher();
        applyTranslations();
        document.dispatchEvent(new CustomEvent("i18n:ready", { detail: { lang } }));
    }

    async function init() {
        try {
            fallbackTranslations = await fetchLocale(CONFIG.i18n.defaultLang);
        } catch (err) {
            console.error("Failed to load default locale:", err);
        }
        await setLanguage(detectLanguage(), false);
    }

    return {
        init,
        setLanguage,
        t,
        getLang: () => currentLang
    };
})();