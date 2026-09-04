/* =========================================================
   HELIX CRM
   SOCIAL ANALYTICS
   ========================================================= */


/* =========================================================
   STORAGE
   ========================================================= */

const ANALYTICS_STORAGE_KEY =
    "helix_crm_social_analytics";

const SOCIAL_POST_STORAGE_KEY =
    "helix_crm_social_posts";


/* =========================================================
   STATE
   ========================================================= */

let selectedRange =
    30;

let selectedPlatform =
    "";

let socialPosts =
    [];

let analytics =
    createEmptyAnalytics();


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeAnalytics
);


function initializeAnalytics() {

    loadAnalytics();

    loadSocialPosts();

    bindControls();

    renderAnalytics();

}


/* =========================================================
   EMPTY DATA
   ========================================================= */

function createEmptyAnalytics() {

    return {

        impressions:
            0,

        impressions_change:
            0,

        engagement_rate:
            0,

        engagement_change:
            0,

        clicks:
            0,

        clicks_change:
            0,

        follower_growth:
            0,

        posts_published:
            0,

        summary:
            "",

        platforms: {

            linkedin: {
                impressions:
                    0,
                engagement:
                    0,
                follower_growth:
                    0
            },

            facebook: {
                impressions:
                    0,
                engagement:
                    0,
                follower_growth:
                    0
            },

            instagram: {
                impressions:
                    0,
                engagement:
                    0,
                follower_growth:
                    0
            },

            x: {
                impressions:
                    0,
                engagement:
                    0,
                follower_growth:
                    0
            }

        },

        trend: [],

        top_posts: [],

        content_types: []

    };

}


/* =========================================================
   LOAD ANALYTICS
   ========================================================= */

function loadAnalytics() {

    try {

        const stored =
            localStorage.getItem(
                ANALYTICS_STORAGE_KEY
            );


        if (
            stored
        ) {

            analytics =
                normalizeAnalytics(
                    JSON.parse(
                        stored
                    )
                );

            return;

        }

    }

    catch (error) {

        console.error(
            "Unable to load analytics:",
            error
        );

    }


    if (
        window.HELIX_DATA
            ?.socialAnalytics
    ) {

        analytics =
            normalizeAnalytics(
                window.HELIX_DATA
                    .socialAnalytics
            );

    }

}


/* =========================================================
   LOAD POSTS
   ========================================================= */

function loadSocialPosts() {

    try {

        const stored =
            localStorage.getItem(
                SOCIAL_POST_STORAGE_KEY
            );


        if (
            stored
        ) {

            socialPosts =
                JSON.parse(
                    stored
                );

            return;

        }

    }

    catch (error) {

        console.error(
            "Unable to load social posts:",
            error
        );

    }


    socialPosts =
        Array.isArray(
            window.HELIX_DATA
                ?.socialPosts
        )
        ?
        [...window.HELIX_DATA.socialPosts]
        :
        [];

}


/* =========================================================
   NORMALIZE
   ========================================================= */

function normalizeAnalytics(
    source
) {

    const empty =
        createEmptyAnalytics();


    return {

        ...empty,

        ...source,

        impressions:
            normalizeCount(
                source.impressions
            ),

        impressions_change:
            normalizeSignedNumber(
                source.impressions_change
            ),

        engagement_rate:
            clampPercent(
                source.engagement_rate
            ),

        engagement_change:
            normalizeSignedNumber(
                source.engagement_change
            ),

        clicks:
            normalizeCount(
                source.clicks
            ),

        clicks_change:
            normalizeSignedNumber(
                source.clicks_change
            ),

        follower_growth:
            normalizeSignedNumber(
                source.follower_growth
            ),

        posts_published:
            normalizeCount(
                source.posts_published
            ),

        summary:
            source.summary ||
            "",

        platforms: {

            linkedin:
                normalizePlatform(
                    source.platforms
                        ?.linkedin
                ),

            facebook:
                normalizePlatform(
                    source.platforms
                        ?.facebook
                ),

            instagram:
                normalizePlatform(
                    source.platforms
                        ?.instagram
                ),

            x:
                normalizePlatform(
                    source.platforms
                        ?.x
                )

        },

        trend:
            Array.isArray(
                source.trend
            )
            ?
            source.trend
            :
            [],

        top_posts:
            Array.isArray(
                source.top_posts
            )
            ?
            source.top_posts
            :
            [],

        content_types:
            Array.isArray(
                source.content_types
            )
            ?
            source.content_types
            :
            []

    };

}


function normalizePlatform(
    platform
) {

    return {

        impressions:
            normalizeCount(
                platform
                    ?.impressions
            ),

        engagement:
            clampPercent(
                platform
                    ?.engagement
            ),

        follower_growth:
            normalizeSignedNumber(
                platform
                    ?.follower_growth
            )

    };

}


/* =========================================================
   CONTROLS
   ========================================================= */

function bindControls() {

    document
        .querySelectorAll(
            ".range-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".range-button"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );


                        button.classList.add(
                            "active"
                        );


                        selectedRange =
                            Number(
                                button.dataset.range
                            );


                        renderAnalytics();

                    }
                );

            }
        );


    document
        .getElementById(
            "platformFilter"
        )
        ?.addEventListener(
            "change",
            event => {

                selectedPlatform =
                    event.target.value;


                renderAnalytics();

            }
        );


    document
        .getElementById(
            "editAnalyticsButton"
        )
        ?.addEventListener(
            "click",
            openDrawer
        );


    document
        .getElementById(
            "drawerCloseButton"
        )
        ?.addEventListener(
            "click",
            closeDrawer
        );


    document
        .getElementById(
            "cancelAnalyticsButton"
        )
        ?.addEventListener(
            "click",
            closeDrawer
        );


    document
        .getElementById(
            "analyticsOverlay"
        )
        ?.addEventListener(
            "click",
            closeDrawer
        );


    document
        .getElementById(
            "analyticsForm"
        )
        ?.addEventListener(
            "submit",
            saveAnalyticsFromForm
        );


    bindQuickCreate();


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeDrawer();

            }

        }
    );

}


/* =========================================================
   QUICK CREATE
   ========================================================= */

function bindQuickCreate() {

    const button =
        document.getElementById(
            "quickCreateButton"
        );


    const menu =
        document.getElementById(
            "quickCreateMenu"
        );


    button
        ?.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                if (
                    menu
                ) {

                    menu.hidden =
                        !menu.hidden;

                }

            }
        );


    document.addEventListener(
        "click",
        event => {

            if (
                !menu ||
                menu.hidden
            ) {

                return;

            }


            if (
                menu.contains(
                    event.target
                )
            ) {

                return;

            }


            menu.hidden =
                true;

        }
    );

}


/* =========================================================
   RENDER
   ========================================================= */

function renderAnalytics() {

    const view =
        getCurrentView();


    renderMetrics(
        view
    );


    renderTrend(
        view
    );


    renderPlatforms(
        view
    );


    renderTopPosts(
        view
    );


    renderContentTypes(
        view
    );


    renderSummary(
        view
    );

}


/* =========================================================
   VIEW
   ========================================================= */

function getCurrentView() {

    if (
        !selectedPlatform
    ) {

        return analytics;

    }


    const platform =
        analytics.platforms[
            selectedPlatform
        ]
        ||
        normalizePlatform();


    return {

        ...analytics,

        impressions:
            platform.impressions,

        engagement_rate:
            platform.engagement,

        follower_growth:
            platform.follower_growth

    };

}


/* =========================================================
   METRICS
   ========================================================= */

function renderMetrics(
    view
) {

    setText(
        "metricImpressions",
        formatNumber(
            view.impressions
        )
    );


    setText(
        "metricImpressionsChange",
        formatChange(
            analytics.impressions_change
        )
    );


    setText(
        "metricEngagement",
        `${view.engagement_rate}%`
    );


    setText(
        "metricEngagementChange",
        formatChange(
            analytics.engagement_change
        )
    );


    setText(
        "metricClicks",
        formatNumber(
            analytics.clicks
        )
    );


    setText(
        "metricClicksChange",
        formatChange(
            analytics.clicks_change
        )
    );


    setText(
        "metricFollowerGrowth",
        formatSignedNumber(
            view.follower_growth
        )
    );


    const publishedCount =
        getPublishedPostCount();


    setText(
        "metricPosts",
        publishedCount
        ||
        analytics.posts_published
    );

}


/* =========================================================
   TREND
   ========================================================= */

function renderTrend(
    view
) {

    const container =
        document.getElementById(
            "trendChart"
        );


    if (
        !container
    ) {

        return;

    }


    const data =
        getTrendData(
            view
        );


    container.innerHTML =
        "";


    if (
        !data.length
    ) {

        container.innerHTML = `

            <div class="analytics-empty">
                Trend data will appear here once analytics snapshots are added.
            </div>

        `;


        return;

    }


    const maxImpressions =
        Math.max(
            ...data.map(
                item =>
                    Number(
                        item.impressions ||
                        0
                    )
            ),
            1
        );


    const maxEngagement =
        Math.max(
            ...data.map(
                item =>
                    Number(
                        item.engagement ||
                        0
                    )
            ),
            1
        );


    data
        .slice(
            -8
        )
        .forEach(
            item => {

                const group =
                    document.createElement(
                        "div"
                    );


                group.className =
                    "trend-group";


                const impressionHeight =
                    Math.max(
                        2,
                        (
                            Number(
                                item.impressions ||
                                0
                            )
                            /
                            maxImpressions
                        )
                        *
                        230
                    );


                const engagementHeight =
                    Math.max(
                        2,
                        (
                            Number(
                                item.engagement ||
                                0
                            )
                            /
                            maxEngagement
                        )
                        *
                        180
                    );


                group.innerHTML = `

                    <div
                        class="trend-bar impressions"
                        style="height:${impressionHeight}px"
                        title="${formatNumber(item.impressions || 0)} impressions"
                    >
                    </div>


                    <div
                        class="trend-bar engagement"
                        style="height:${engagementHeight}px"
                        title="${item.engagement || 0}% engagement"
                    >
                    </div>


                    <span class="trend-label">
                        ${escapeHTML(item.label || "")}
                    </span>

                `;


                container.appendChild(
                    group
                );

            }
        );

}


/* =========================================================
   TREND DATA
   ========================================================= */

function getTrendData() {

    if (
        analytics.trend.length
    ) {

        return analytics.trend;

    }


    return [];

}


/* =========================================================
   PLATFORMS
   ========================================================= */

function renderPlatforms() {

    const container =
        document.getElementById(
            "platformComparison"
        );


    if (
        !container
    ) {

        return;

    }


    container.innerHTML =
        "";


    const platforms =
        Object.entries(
            analytics.platforms
        );


    const max =
        Math.max(
            ...platforms.map(
                ([,data]) =>
                    data.impressions
            ),
            1
        );


    platforms.forEach(
        ([key,data]) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "platform-row";


            const width =
                (
                    data.impressions /
                    max
                )
                *
                100;


            row.innerHTML = `

                <div class="platform-row-head">

                    <strong>
                        ${escapeHTML(formatPlatform(key))}
                    </strong>

                    <span>
                        ${formatNumber(data.impressions)} impressions
                    </span>

                </div>


                <div class="platform-bar">

                    <div
                        class="platform-fill"
                        style="width:${width}%"
                    >
                    </div>

                </div>


                <div class="platform-stats">


                    <div class="platform-stat">

                        <span>
                            ENGAGEMENT
                        </span>

                        <strong>
                            ${data.engagement}%
                        </strong>

                    </div>


                    <div class="platform-stat">

                        <span>
                            FOLLOWER GROWTH
                        </span>

                        <strong>
                            ${formatSignedNumber(data.follower_growth)}
                        </strong>

                    </div>


                    <div class="platform-stat">

                        <span>
                            SHARE
                        </span>

                        <strong>
                            ${getPlatformShare(data.impressions)}%
                        </strong>

                    </div>


                </div>

            `;


            container.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   TOP POSTS
   ========================================================= */

function renderTopPosts() {

    const container =
        document.getElementById(
            "topPostList"
        );


    if (
        !container
    ) {

        return;

    }


    const items =
        getTopPosts();


    container.innerHTML =
        "";


    if (
        !items.length
    ) {

        container.innerHTML = `

            <div class="analytics-empty">
                Top-performing posts will appear here once performance data is added.
            </div>

        `;


        return;

    }


    items
        .slice(
            0,
            6
        )
        .forEach(
            (post,index) => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "top-post-row";


                row.innerHTML = `

                    <div class="top-post-rank">
                        ${String(index + 1).padStart(2,"0")}
                    </div>


                    <div class="top-post-copy">

                        <strong>
                            ${escapeHTML(post.title || "Untitled post")}
                        </strong>

                        <span>
                            ${escapeHTML(formatPlatform(post.platform || ""))}
                        </span>

                    </div>


                    <div class="top-post-metric">

                        <span>
                            IMPRESSIONS
                        </span>

                        <strong>
                            ${formatNumber(post.impressions || 0)}
                        </strong>

                    </div>


                    <div class="top-post-metric">

                        <span>
                            ENGAGEMENT
                        </span>

                        <strong>
                            ${Number(post.engagement || 0)}%
                        </strong>

                    </div>

                `;


                container.appendChild(
                    row
                );

            }
        );

}


/* =========================================================
   TOP POSTS DATA
   ========================================================= */

function getTopPosts() {

    if (
        analytics.top_posts.length
    ) {

        return [...analytics.top_posts]
            .sort(
                (a,b) =>
                    Number(
                        b.impressions ||
                        0
                    )
                    -
                    Number(
                        a.impressions ||
                        0
                    )
            );

    }


    return [];

}


/* =========================================================
   CONTENT TYPE
   ========================================================= */

function renderContentTypes() {

    const container =
        document.getElementById(
            "contentTypeList"
        );


    if (
        !container
    ) {

        return;

    }


    const items =
        analytics.content_types;


    container.innerHTML =
        "";


    if (
        !items.length
    ) {

        container.innerHTML = `

            <div class="analytics-empty">
                Content-type performance will appear here once analytics data is available.
            </div>

        `;


        return;

    }


    const max =
        Math.max(
            ...items.map(
                item =>
                    Number(
                        item.engagement ||
                        0
                    )
            ),
            1
        );


    items
        .slice(
            0,
            6
        )
        .forEach(
            item => {

                const width =
                    (
                        Number(
                            item.engagement ||
                            0
                        )
                        /
                        max
                    )
                    *
                    100;


                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "content-type-row";


                row.innerHTML = `

                    <div class="content-type-head">

                        <strong>
                            ${escapeHTML(item.label || "Other")}
                        </strong>

                        <span>
                            ${Number(item.engagement || 0)}% engagement
                        </span>

                    </div>


                    <div class="content-type-track">

                        <div
                            class="content-type-fill"
                            style="width:${width}%"
                        >
                        </div>

                    </div>

                `;


                container.appendChild(
                    row
                );

            }
        );

}


/* =========================================================
   SUMMARY
   ========================================================= */

function renderSummary() {

    const container =
        document.getElementById(
            "performanceSummary"
        );


    if (
        !container
    ) {

        return;

    }


    const bestPlatform =
        getBestPlatform();


    const bestEngagement =
        getBestEngagementPlatform();


    container.innerHTML = `

        <div class="summary-stat">

            <span>
                STRONGEST REACH
            </span>

            <strong>
                ${
                    bestPlatform
                    ?
                    escapeHTML(formatPlatform(bestPlatform[0]))
                    :
                    "No data yet"
                }
            </strong>

        </div>


        <div class="summary-stat">

            <span>
                BEST ENGAGEMENT
            </span>

            <strong>
                ${
                    bestEngagement
                    ?
                    `${escapeHTML(formatPlatform(bestEngagement[0]))} · ${bestEngagement[1].engagement}%`
                    :
                    "No data yet"
                }
            </strong>

        </div>


        <div class="summary-stat">

            <span>
                SELECTED PERIOD
            </span>

            <strong>
                Last ${selectedRange} days
            </strong>

        </div>


        <div class="summary-note">

            ${
                escapeHTML(
                    analytics.summary ||
                    "Add a performance note to capture important trends, decisions, and next actions."
                )
            }

        </div>

    `;

}


/* =========================================================
   BEST PLATFORM
   ========================================================= */

function getBestPlatform() {

    const entries =
        Object.entries(
            analytics.platforms
        );


    if (
        !entries.length
    ) {

        return null;

    }


    return entries.sort(
        (a,b) =>
            b[1].impressions -
            a[1].impressions
    )[0];

}


function getBestEngagementPlatform() {

    const entries =
        Object.entries(
            analytics.platforms
        );


    if (
        !entries.length
    ) {

        return null;

    }


    return entries.sort(
        (a,b) =>
            b[1].engagement -
            a[1].engagement
    )[0];

}


/* =========================================================
   PUBLISHED COUNT
   ========================================================= */

function getPublishedPostCount() {

    return socialPosts.filter(
        post =>
            post.status ===
            "published"
    ).length;

}


/* =========================================================
   SHARE
   ========================================================= */

function getPlatformShare(
    impressions
) {

    const total =
        Object.values(
            analytics.platforms
        )
            .reduce(
                (sum,item) =>
                    sum +
                    item.impressions,
                0
            );


    if (
        !total
    ) {

        return 0;

    }


    return Math.round(
        (
            impressions /
            total
        )
        *
        100
    );

}


/* =========================================================
   DRAWER
   ========================================================= */

function openDrawer() {

    loadAnalyticsIntoForm();


    const overlay =
        document.getElementById(
            "analyticsOverlay"
        );


    const drawer =
        document.getElementById(
            "analyticsDrawer"
        );


    if (
        overlay
    ) {

        overlay.hidden =
            false;

    }


    if (
        drawer
    ) {

        drawer.hidden =
            false;

    }


    requestAnimationFrame(
        () => {

            overlay?.classList.add(
                "open"
            );


            drawer?.classList.add(
                "open"
            );

        }
    );


    document.body.classList.add(
        "drawer-open"
    );

}


/* =========================================================
   CLOSE
   ========================================================= */

function closeDrawer() {

    const overlay =
        document.getElementById(
            "analyticsOverlay"
        );


    const drawer =
        document.getElementById(
            "analyticsDrawer"
        );


    overlay?.classList.remove(
        "open"
    );


    drawer?.classList.remove(
        "open"
    );


    document.body.classList.remove(
        "drawer-open"
    );


    setTimeout(
        () => {

            if (
                overlay
            ) {

                overlay.hidden =
                    true;

            }


            if (
                drawer
            ) {

                drawer.hidden =
                    true;

            }

        },
        220
    );

}


/* =========================================================
   LOAD FORM
   ========================================================= */

function loadAnalyticsIntoForm() {

    setValue(
        "analyticsImpressions",
        analytics.impressions
    );


    setValue(
        "analyticsImpressionsChange",
        analytics.impressions_change
    );


    setValue(
        "analyticsEngagement",
        analytics.engagement_rate
    );


    setValue(
        "analyticsEngagementChange",
        analytics.engagement_change
    );


    setValue(
        "analyticsClicks",
        analytics.clicks
    );


    setValue(
        "analyticsClicksChange",
        analytics.clicks_change
    );


    setValue(
        "analyticsFollowers",
        analytics.follower_growth
    );


    setValue(
        "analyticsPosts",
        analytics.posts_published
    );


    setValue(
        "analyticsSummary",
        analytics.summary
    );


    loadPlatformForm(
        "linkedin"
    );


    loadPlatformForm(
        "facebook"
    );


    loadPlatformForm(
        "instagram"
    );


    loadPlatformForm(
        "x"
    );

}


function loadPlatformForm(
    platform
) {

    const data =
        analytics.platforms[
            platform
        ];


    setValue(
        `${platform}Impressions`,
        data.impressions
    );


    setValue(
        `${platform}Engagement`,
        data.engagement
    );


    setValue(
        `${platform}Followers`,
        data.follower_growth
    );

}


/* =========================================================
   SAVE FORM
   ========================================================= */

function saveAnalyticsFromForm(
    event
) {

    event.preventDefault();


    analytics = {

        ...analytics,

        impressions:
            normalizeCount(
                getValue(
                    "analyticsImpressions"
                )
            ),

        impressions_change:
            normalizeSignedNumber(
                getValue(
                    "analyticsImpressionsChange"
                )
            ),

        engagement_rate:
            clampPercent(
                getValue(
                    "analyticsEngagement"
                )
            ),

        engagement_change:
            normalizeSignedNumber(
                getValue(
                    "analyticsEngagementChange"
                )
            ),

        clicks:
            normalizeCount(
                getValue(
                    "analyticsClicks"
                )
            ),

        clicks_change:
            normalizeSignedNumber(
                getValue(
                    "analyticsClicksChange"
                )
            ),

        follower_growth:
            normalizeSignedNumber(
                getValue(
                    "analyticsFollowers"
                )
            ),

        posts_published:
            normalizeCount(
                getValue(
                    "analyticsPosts"
                )
            ),

        summary:
            getValue(
                "analyticsSummary"
            ),

        platforms: {

            linkedin:
                readPlatformForm(
                    "linkedin"
                ),

            facebook:
                readPlatformForm(
                    "facebook"
                ),

            instagram:
                readPlatformForm(
                    "instagram"
                ),

            x:
                readPlatformForm(
                    "x"
                )

        }

    };


    saveAnalytics();

    closeDrawer();

    renderAnalytics();

}


/* =========================================================
   PLATFORM FORM
   ========================================================= */

function readPlatformForm(
    platform
) {

    return {

        impressions:
            normalizeCount(
                getValue(
                    `${platform}Impressions`
                )
            ),

        engagement:
            clampPercent(
                getValue(
                    `${platform}Engagement`
                )
            ),

        follower_growth:
            normalizeSignedNumber(
                getValue(
                    `${platform}Followers`
                )
            )

    };

}


/* =========================================================
   SAVE
   ========================================================= */

function saveAnalytics() {

    localStorage.setItem(
        ANALYTICS_STORAGE_KEY,
        JSON.stringify(
            analytics
        )
    );

}


/* =========================================================
   FORMATTING
   ========================================================= */

function formatPlatform(
    platform
) {

    const labels = {

        linkedin:
            "LinkedIn",

        facebook:
            "Facebook",

        instagram:
            "Instagram",

        x:
            "X / Twitter"

    };


    return (
        labels[
            platform
        ]
        ||
        platform
        ||
        "—"
    );

}


function formatChange(
    value
) {

    const number =
        Number(
            value ||
            0
        );


    if (
        number >
        0
    ) {

        return `+${number}% vs. prior period`;

    }


    return `${number}% vs. prior period`;

}


function formatSignedNumber(
    value
) {

    const number =
        Number(
            value ||
            0
        );


    if (
        number >
        0
    ) {

        return `+${formatNumber(number)}`;

    }


    return formatNumber(
        number
    );

}


function formatNumber(
    value
) {

    return new Intl.NumberFormat(
        "en-US",
        {
            notation:
                Math.abs(
                    Number(
                        value ||
                        0
                    )
                )
                >=
                100000
                ?
                "compact"
                :
                "standard",

            maximumFractionDigits:
                1
        }
    )
        .format(
            Number(
                value ||
                0
            )
        );

}


/* =========================================================
   NORMALIZE
   ========================================================= */

function normalizeCount(
    value
) {

    const number =
        Number(
            value
        );


    if (
        Number.isNaN(
            number
        )
    ) {

        return 0;

    }


    return Math.max(
        0,
        Math.round(
            number
        )
    );

}


function normalizeSignedNumber(
    value
) {

    const number =
        Number(
            value
        );


    return Number.isNaN(
        number
    )
        ?
        0
        :
        number;

}


function clampPercent(
    value
) {

    const number =
        Number(
            value
        );


    if (
        Number.isNaN(
            number
        )
    ) {

        return 0;

    }


    return Math.min(
        100,
        Math.max(
            0,
            Math.round(
                number * 10
            )
            /
            10
        )
    );

}


/* =========================================================
   HELPERS
   ========================================================= */

function getValue(
    id
) {

    return (
        document
            .getElementById(
                id
            )
            ?.value
            ?.trim()
        ||
        ""
    );

}


function setValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (
        element
    ) {

        element.value =
            value ??
            "";

    }

}


function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (
        element
    ) {

        element.textContent =
            value;

    }

}


function escapeHTML(
    value
) {

    return String(
        value ??
        ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}
