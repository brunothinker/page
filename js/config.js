/**
 * Central application configuration.
 * Update VERSION to automatically propagate version numbers across all download links and commands.
 */
const VERSION = "2.2.0";

const CONFIG = {
    version: VERSION,
    repoOwner: "brunothinker",
    repoName: "FallByte",
    files: {
        windows: `FallByte_${VERSION}_Windows_x64.exe`,
        deb: `fallbyte_${VERSION}_amd64.deb`,
        rpm: `fallbyte-${VERSION}-1.x86_64.rpm`,
        appImage: `FallByte-${VERSION}-x86_64.AppImage`
    },
    urls: {
        windows: `https://github.com/brunothinker/FallByte/releases/download/v${VERSION}/FallByte_${VERSION}_Windows_x64.exe`,
        deb: `https://github.com/brunothinker/FallByte/releases/download/v${VERSION}/fallbyte_${VERSION}_amd64.deb`,
        rpm: `https://github.com/brunothinker/FallByte/releases/download/v${VERSION}/fallbyte-${VERSION}-1.x86_64.rpm`,
        appImage: `https://github.com/brunothinker/FallByte/releases/download/v${VERSION}/FallByte-${VERSION}-x86_64.AppImage`
    },
    icons: {
        windows: "../icons/windows.svg",
        ubuntu: "../icons/ubuntu.svg",
        fedora: "../icons/fedora.svg",
        arch: "../icons/arch.svg"
    },
    screenshots: [
        {
            src: "screenshots/preview.png",
            labelKey: "hero.screenshot_main_label"
        }
    ],
    i18n: {
        defaultLang: "en",
        supportedLangs: ["de", "en", "es", "fr", "it", "ja", "ko", "pt", "ru", "zh"],
        languageNames: {
            de: "Deutsch",
            en: "English",
            es: "Español",
            fr: "Français",
            it: "Italiano",
            ja: "日本語",
            ko: "한국어",
            pt: "Português",
            ru: "Русский",
            zh: "中文"
        }
    }
};