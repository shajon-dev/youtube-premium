// ==UserScript==
// @name         YouTube Premium Logo & Ads Remove
// @namespace    https://github.com/shajon-dev/youtube-premium
// @version      1.1
// @description  Replaces the logo with a positioned Premium logo, removes "Get Premium" upsells, and sanitizes ad content.
// @author       SHAH MAKHDUM SHAJON
// @match        *://*.youtube.com/*
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-start
// @homepageURL  https://github.com/shajon-dev/youtube-premium
// @downloadURL  https://raw.githubusercontent.com/shajon-dev/youtube-premium/main/youtube-premium.user.js
// @updateURL    https://raw.githubusercontent.com/shajon-dev/youtube-premium/main/youtube-premium.user.js
// @license      Apache-2.0
// ==/UserScript==

(function (global) {
    'use strict';

    /**
     * Configuration and Assets
     */
    const CONFIG = {
        checkInterval: 1500,
        selectors: {
            upsells: [
                'ytd-guide-entry-renderer:has(a[href="/premium"])',
                'ytd-guide-entry-renderer:has(a[href="/paid_memberships"])',
                'ytd-mini-guide-entry-renderer[aria-label="YouTube Premium"]',
                'ytd-compact-link-renderer:has(a[href="/premium"])',
                'ytd-compact-link-renderer:has(a[href="/paid_memberships"])',
                'ytd-banner-promo-renderer',
                'ytd-statement-banner-renderer',
                '#offer-module',
                'ytd-mealbar-promo-renderer'
            ],
            ads: [
                '#offer-module',
                '#promotion-shelf',
                '.ytd-merch-shelf-renderer',
                '#masthead-ad',
                'ytd-ad-slot-renderer',
                'ytd-rich-item-renderer:has(> #content > ytd-ad-slot-renderer)',
                '#shorts-inner-container > .ytd-shorts:has(ytd-ad-slot-renderer)',
                '.ytShortsSuggestedActionViewModelStaticHost',
                '.ytp-suggested-action',
                '.ytd-watch-next-secondary-results-renderer > ytd-ad-slot-renderer'
            ]
        },
        xpaths: {
            sidebarPremium: "/html/body/ytd-app/div[1]/tp-yt-app-drawer/div[2]/div/div[2]/div[2]/ytd-guide-renderer/div[1]/ytd-guide-section-renderer[4]/div/ytd-guide-entry-renderer[1]"
        }
    };

    // Premium Logo SVG Data
    const SVG_SOURCE = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 846 174" height="80px" width="391px">
      <g transform="translate(0,0.36)">
        <path fill="#ff0000" d="M 242.88,27.11 A 31.07,31.07 0 0 0 220.95,5.18 C 201.6,0 124,0 124,0 124,0 46.46,0 27.11,5.18 A 31.07,31.07 0 0 0 5.18,27.11 C 0,46.46 0,86.82 0,86.82 c 0,0 0,40.36 5.18,59.71 a 31.07,31.07 0 0 0 21.93,21.93 c 19.35,5.18 96.92,5.18 96.92,5.18 0,0 77.57,0 96.92,-5.18 a 31.07,31.07 0 0 0 21.93,-21.93 c 5.18,-19.35 5.18,-59.71 5.18,-59.71 0,0 0,-40.36 -5.18,-59.71 z" />
        <path fill="#ffffff" d="M 99.22,124.03 163.67,86.82 99.22,49.61 Z" />
        <path fill="currentColor" d="m 358.29,55.1 v 6 c 0,30 -13.3,47.53 -42.39,47.53 h -4.43 v 52.5 H 287.71 V 12.36 H 318 c 27.7,0 40.29,11.71 40.29,42.74 z m -25,2.13 c 0,-21.64 -3.9,-26.78 -17.38,-26.78 h -4.43 v 60.48 h 4.08 c 12.77,0 17.74,-9.22 17.74,-29.26 z m 81.22,-6.56 -1.24,28.2 c -10.11,-2.13 -18.45,-0.53 -22.17,6 v 76.26 H 367.52 V 52.44 h 18.8 L 388.45,76 h 0.89 c 2.48,-17.2 10.46,-25.89 20.75,-25.89 a 22.84,22.84 0 0 1 4.42,0.56 z M 441.64,115 v 5.5 c 0,19.16 1.06,25.72 9.22,25.72 7.8,0 9.58,-6 9.75,-18.44 l 21.1,1.24 c 1.6,23.41 -10.64,33.87 -31.39,33.87 -25.18,0 -32.63,-16.49 -32.63,-46.46 v -19 c 0,-31.57 8.34,-47 33.34,-47 25.18,0 31.57,13.12 31.57,45.93 V 115 Z m 0,-22.35 v 7.8 h 17.91 V 92.7 c 0,-20 -1.42,-25.72 -9,-25.72 -7.58,0 -8.91,5.86 -8.91,25.72 z M 604.45,79 v 82.11 H 580 V 80.82 c 0,-8.87 -2.31,-13.3 -7.63,-13.3 -4.26,0 -8.16,2.48 -10.82,7.09 a 35.59,35.59 0 0 1 0.18,4.43 v 82.11 H 537.24 V 80.82 c 0,-8.87 -2.31,-13.3 -7.63,-13.3 -4.26,0 -8,2.48 -10.64,6.92 v 86.72 H 494.5 V 52.44 h 19.33 L 516,66.28 h 0.35 c 5.5,-10.46 14.37,-16.14 24.83,-16.14 10.29,0 16.14,5.14 18.8,14.37 5.68,-9.4 14.19,-14.37 23.94,-14.37 14.86,0 20.53,10.64 20.53,28.86 z m 12.24,-54.4 c 0,-11.71 4.26,-15.07 13.3,-15.07 9.22,0 13.3,3.9 13.3,15.07 0,12.06 -4.08,15.08 -13.3,15.08 -9.04,-0.01 -13.3,-3.02 -13.3,-15.08 z m 1.42,27.84 h 23.41 v 108.72 h -23.41 z m 103.39,0 v 108.72 h -19.15 l -2.13,-13.3 h -0.53 c -5.5,10.64 -13.48,15.07 -23.41,15.07 -14.54,0 -21.11,-9.22 -21.11,-29.26 V 52.44 h 24.47 v 79.81 c 0,9.58 2,13.48 6.92,13.48 A 12.09,12.09 0 0 0 697,138.81 V 52.44 Z M 845.64,79 v 82.11 H 821.17 V 80.82 c 0,-8.87 -2.31,-13.3 -7.63,-13.3 -4.26,0 -8.16,2.48 -10.82,7.09 A 35.59,35.59 0 0 1 802.9,79 v 82.11 H 778.43 V 80.82 c 0,-8.87 -2.31,-13.3 -7.63,-13.3 -4.26,0 -8,2.48 -10.64,6.92 v 86.72 H 735.69 V 52.44 H 755 l 2.13,13.83 h 0.35 c 5.5,-10.46 14.37,-16.14 24.83,-16.14 10.29,0 16.14,5.14 18.8,14.37 5.68,-9.4 14.19,-14.37 23.94,-14.37 14.95,0.01 20.59,10.65 20.59,28.87 z" />
      </g>
    </svg>`;

    const LOGO_LIGHT = "data:image/svg+xml;base64," + btoa(SVG_SOURCE.replace('currentColor', '#212121'));
    const LOGO_DARK = "data:image/svg+xml;base64," + btoa(SVG_SOURCE.replace('currentColor', '#FFFFFF'));

    /**
     * Main YouTube Enhancement Class
     * Handles Logo Replacement, UI Cleaning, and Network Interception
     */
    class YouTubeEnhancer {
        constructor() {
            this.win = global.unsafeWindow || window;
            this.init();
        }

        init() {
            this.injectStyles();
            this.deployNetworkInterceptors();
            this.enforceEnvironmentConstants();
            this.startObservers();
        }

        /**
         * Injects all necessary CSS for Logo replacement and Element hiding.
         */
        injectStyles() {
            const hideSelectors = [...CONFIG.selectors.upsells, ...CONFIG.selectors.ads].join(',\n');

            const css = `
                /* --- LOGO REPLACEMENT --- */
                ytd-topbar-logo-renderer #logo-icon,
                ytd-topbar-logo-renderer #logo svg,
                ytd-masthead #masthead-logo svg {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                }
                ytd-topbar-logo-renderer {
                    display: flex !important;
                    flex-direction: row !important;
                    align-items: center !important;
                }
                ytd-topbar-logo-renderer #logo,
                ytd-masthead #masthead-logo a {
                    display: block !important;
                    width: 130px !important;
                    height: 24px !important;
                    background-repeat: no-repeat !important;
                    background-size: contain !important;
                    background-position: left center !important;
                    padding: 0 !important;
                    background-image: url('${LOGO_DARK}') !important;
                }
                html:not([dark]) ytd-topbar-logo-renderer #logo,
                html:not([dark]) ytd-masthead #masthead-logo a {
                    background-image: url('${LOGO_LIGHT}') !important;
                }
                ytd-topbar-logo-renderer #country-code {
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    font-size: 11px !important;
                    color: #AAA !important;
                    position: relative !important;
                    top: -12px !important;
                    margin-left: -5px !important;
                    white-space: nowrap !important;
                }

                /* --- CLEANUP & SANITIZATION --- */
                ${hideSelectors} {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                }
            `;

            if (typeof GM_addStyle === 'function') {
                GM_addStyle(css);
            } else {
                const style = document.createElement('style');
                style.textContent = css;
                (document.head || document.documentElement).appendChild(style);
            }
        }

        /**
         * Hooks into JSON.parse, Fetch, and XHR to sanitize data before it hits the UI.
         */
        deployNetworkInterceptors() {
            const self = this;

            // 1. JSON.parse Interceptor
            const originalParse = this.win.JSON.parse;
            this.win.JSON.parse = function (...args) {
                const result = originalParse.apply(this, args);
                return self.sanitizeObject(result);
            };

            // 2. Fetch API Interceptor
            const originalFetch = this.win.fetch;
            this.win.fetch = async function (input, init) {
                const response = await originalFetch(input, init);
                const url = (typeof input === 'string') ? input : input?.url;

                if (url && (url.includes('/player') || url.includes('/watch') || url.includes('playlist'))) {
                    const clone = response.clone();
                    try {
                        let data = await clone.json();
                        data = self.sanitizeObject(data);
                        return new Response(JSON.stringify(data), {
                            status: response.status,
                            statusText: response.statusText,
                            headers: response.headers
                        });
                    } catch (err) {
                        return response;
                    }
                }
                return response;
            };

            // 3. XHR Interceptor
            const originalOpen = this.win.XMLHttpRequest.prototype.open;
            this.win.XMLHttpRequest.prototype.open = function (method, url) {
                this._targetUrl = url;
                return originalOpen.apply(this, arguments);
            };

            const originalSend = this.win.XMLHttpRequest.prototype.send;
            this.win.XMLHttpRequest.prototype.send = function (body) {
                const xhr = this;
                const oldOnReady = xhr.onreadystatechange;
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr._targetUrl && /\/(player|watch|get_watch)/.test(xhr._targetUrl)) {
                        try {
                            let data = JSON.parse(xhr.responseText);
                            data = self.sanitizeObject(data);
                            Object.defineProperty(xhr, 'responseText', { value: JSON.stringify(data) });
                            Object.defineProperty(xhr, 'response', { value: JSON.stringify(data) });
                        } catch (e) { /* Non-JSON response */ }
                    }
                    if (oldOnReady) oldOnReady.apply(this, arguments);
                };
                return originalSend.apply(this, arguments);
            };
        }

        /**
         * Recursive object sanitization to remove ad placements.
         */
        sanitizeObject(obj) {
            if (!obj || typeof obj !== 'object') return obj;

            if (obj.playerResponse) {
                delete obj.playerResponse.adPlacements;
                delete obj.playerResponse.playerAds;
            }
            if (obj.adPlacements) delete obj.adPlacements;
            if (obj.playerAds) delete obj.playerAds;

            return obj;
        }

        /**
         * Locks global variables used by ad scripts.
         */
        enforceEnvironmentConstants() {
            const definitions = [
                { path: 'ytInitialPlayerResponse.adPlacements', value: undefined },
                { path: 'ytInitialPlayerResponse.playerAds', value: undefined },
                { path: 'google_ad_status', value: 1 }
            ];

            definitions.forEach(def => this.defineDeepProperty(this.win, def.path.split('.'), def.value));
        }

        defineDeepProperty(target, pathParts, value) {
            const prop = pathParts.shift();
            if (pathParts.length > 0) {
                if (!target[prop]) target[prop] = {};
                this.defineDeepProperty(target[prop], pathParts, value);
            } else {
                Object.defineProperty(target, prop, {
                    get: () => value,
                    set: () => {},
                    configurable: false
                });
            }
        }

        /**
         * DOM Clean-up Logic (Backup for CSS).
         * Handles JS-based link removal and XPath targets.
         */
        cleanDOM() {
            // JS Fallback for generic links
            document.querySelectorAll('a[href="/premium"], a[href="/paid_memberships"]').forEach(link => {
                const container = link.closest('ytd-guide-entry-renderer') ||
                                  link.closest('ytd-compact-link-renderer') ||
                                  link.closest('ytd-mini-guide-entry-renderer');
                if (container) container.style.display = 'none';
            });

            // XPath Specific Removal
            const result = document.evaluate(CONFIG.xpaths.sidebarPremium, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            const element = result.singleNodeValue;
            if (element && element.style.display !== "none") {
                element.style.display = "none";
            }
        }

        /**
         * Initializes Observers and Intervals.
         */
        startObservers() {
            const runChecks = () => this.cleanDOM();

            window.addEventListener('load', runChecks);
            setInterval(runChecks, CONFIG.checkInterval);

            const observer = new MutationObserver((mutations) => {
                let shouldCheck = false;
                for (const mutation of mutations) {
                    if (mutation.addedNodes.length) shouldCheck = true;
                }
                if (shouldCheck) runChecks();
            });

            observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
        }
    }

    // Bootstrap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new YouTubeEnhancer());
    } else {
        new YouTubeEnhancer();
    }

})(window);
