const VERSION = "2.1.0";
const REPO_OWNER = "brunothinker";
const REPO_NAME = "FallByte";
const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
const BASE_PATH = window.location.pathname.includes('/downloads') ? '..' : '.';

const FILES = {
    windows: `fallbyte_${VERSION}_x64_installer.exe`,
    deb: `fallbyte_${VERSION}_amd64.deb`,
    rpm: `fallbyte_${VERSION}_x86_64.rpm`,
    appImage: `fallbyte_${VERSION}_x86_64.AppImage`
};

const CONFIG = {
    version: VERSION,
    repoOwner: REPO_OWNER,
    repoName: REPO_NAME,
    repoUrl: REPO_URL,
    files: FILES,
    icons: {
        windows: `${BASE_PATH}/icons/windows.svg`,
        linux: `${BASE_PATH}/icons/tux.svg`,
        ubuntu: `${BASE_PATH}/icons/ubuntu.svg`,
        fedora: `${BASE_PATH}/icons/fedora.svg`,
        arch: `${BASE_PATH}/icons/arch.svg`
    },
    // Add as many screenshots as you want; if more than 1, tabs will appear below
    screenshots: [
        { label: "Main Interface", src: `${BASE_PATH}/screenshots/preview.png` }
    ],
    labels: {
        windows: `Download Windows Installer (v${VERSION})`,
        deb: `Download .DEB Package (v${VERSION})`,
        rpm: `Download .RPM Package (v${VERSION})`,
        appImage: `Download .AppImage Binary (v${VERSION})`
    },
    urls: {
        windows: `${REPO_URL}/releases/download/v${VERSION}/${FILES.windows}`,
        deb: `${REPO_URL}/releases/download/v${VERSION}/${FILES.deb}`,
        rpm: `${REPO_URL}/releases/download/v${VERSION}/${FILES.rpm}`,
        appImage: `${REPO_URL}/releases/download/v${VERSION}/${FILES.appImage}`
    },
    giscus: {
        enabled: true,
        repo: `${REPO_OWNER}/${REPO_NAME}`,
        repoId: "R_kgDOTxp_Uw",
        category: "General",
        categoryId: "DIC_kwDOTxp_U84DLuPu"
    }
};