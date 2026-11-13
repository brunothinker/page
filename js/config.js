const VERSION = "1.3.0";
const REPO_URL = "https://github.com/brunothinker/FallByte";

const CONFIG = {
    version: VERSION,
    icons: {
        windows: "icons/windows.svg",
        linux: "icons/tux.svg",
        ubuntu: "icons/ubuntu.svg",
        fedora: "icons/fedora.svg",
        arch: "icons/arch.svg"
    },
    // Add as many screenshots as you want; if more than 1, tabs will appear below
    screenshots: [
        { label: "Main Interface", src: "screenshots/preview.png" }
    ],
    labels: {
        windows: `Download Windows Installer (v${VERSION})`,
        deb: `Download .DEB Package (v${VERSION})`,
        rpm: `Download .RPM Package (v${VERSION})`,
        appImage: `Download .AppImage Binary (v${VERSION})`
    },
    urls: {
        windows: `${REPO_URL}/releases/download/v${VERSION}/fallbyte_${VERSION}_x64_installer.exe`,
        deb: `${REPO_URL}/releases/download/v${VERSION}/fallbyte_${VERSION}_amd64.deb`,
        rpm: `${REPO_URL}/releases/download/v${VERSION}/fallbyte_${VERSION}_x86_64.rpm`,
        appImage: `${REPO_URL}/releases/download/v${VERSION}/fallbyte_${VERSION}_x86_64.AppImage`
    }
};