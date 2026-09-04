/* =========================================================
   HELIX CRM
   SOCIAL CONTENT PLANNER
   ========================================================= */


/* =========================================================
   STATE
   ========================================================= */

let socialPosts = [];

let filteredPosts = [];


/* =========================================================
   STORAGE
   ========================================================= */

const SOCIAL_STORAGE_KEY =
    "helix_crm_social_posts";


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeSocialPlanner
);


function initializeSocialPlanner() {

    loadPosts();

    bindControls();

    populateOwnerFilter();

    readURLParameters();

    renderWeekPlanner();

    applyFilters();

}


/* =========================================================
   LOAD
   ========================================================= */

function loadPosts() {

    try {

        const stored =
            localStorage.getItem(
                SOCIAL_STORAGE_KEY
            );


        if (
            stored
        ) {

            socialPosts =
                JSON.parse(
                    stored
                );

        }

        else {

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

    }

    catch (error) {

        console.error(
            "Unable to load social posts:",
            error
        );


        socialPosts =
            [];

    }


    socialPosts =
        socialPosts.map(
            normalizePost
        );

}


/* =========================================================
   NORMALIZE
   ========================================================= */

function normalizePost(
    post
) {

    return {

        id:
            post.id ||
            generateId(),

        title:
            post.title ||
            "",

        status:
            normalizeStatus(
                post.status
            ),

        owner:
            post.owner ||
            "",

        platforms:
            Array.isArray(
                post.platforms
            )
            ?
            post.platforms
            :
            [],

        publish_date:
            post.publish_date ||
            "",

        publish_time:
            post.publish_time ||
            "",

        campaign:
            post.campaign ||
            "",

        content_type:
            post.content_type ||
            "educational",

        copy:
            post.copy ||
            "",

        cta:
            post.cta ||
            "",

        link:
            post.link ||
            "",

        hashtags:
            post.hashtags ||
            "",

        asset:
            post.asset ||
            "",

        notes:
            post.notes ||
            "",

        created_at:
            post.created_at ||
            new Date()
                .toISOString(),

        updated_at:
            post.updated_at ||
            ""

    };

}


/* =========================================================
   EVENTS
   ========================================================= */

function bindControls() {

    document
        .getElementById(
            "addPostButton"
        )
        ?.addEventListener(
            "click",
            () => openDrawer()
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
            "cancelPostButton"
        )
        ?.addEventListener(
            "click",
            closeDrawer
        );


    document
        .getElementById(
            "postOverlay"
        )
        ?.addEventListener(
            "click",
            closeDrawer
        );


    document
        .getElementById(
            "postForm"
        )
        ?.addEventListener(
            "submit",
            savePostFromForm
        );


    document
        .getElementById(
            "postSearch"
        )
        ?.addEventListener(
            "input",
            applyFilters
        );


    document
        .getElementById(
            "globalSearch"
        )
        ?.addEventListener(
            "input",
            event => {

                const input =
                    document.getElementById(
                        "postSearch"
                    );


                if (
                    input
                ) {

                    input.value =
                        event.target.value;

                }


                applyFilters();

            }
        );


    [
        "statusFilter",
        "platformFilter",
        "ownerFilter",
        "postSort"
    ]
        .forEach(
            id => {

                document
                    .getElementById(
                        id
                    )
                    ?.addEventListener(
                        "change",
                        applyFilters
                    );

            }
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


            if (
                event.key ===
                "/"
                &&
                ![
                    "INPUT",
                    "TEXTAREA",
                    "SELECT"
                ]
                    .includes(
                        document.activeElement
                            ?.tagName
                    )
            ) {

                event.preventDefault();


                document
                    .getElementById(
                        "postSearch"
                    )
                    ?.focus();

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
   URL
   ========================================================= */

function readURLParameters() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const action =
        params.get(
            "action"
        );


    const id =
        params.get(
            "id"
        );


    const search =
        params.get(
            "search"
        );


    if (
        search
    ) {

        setValue(
            "postSearch",
            search
        );


        setValue(
            "globalSearch",
            search
        );

    }


    if (
        action ===
        "new"
    ) {

        setTimeout(
            () => openDrawer(),
            50
        );

    }


    if (
        id
    ) {

        const post =
            getPostById(
                id
            );


        if (
            post
        ) {

            setTimeout(
                () => openDrawer(
                    post.id
                ),
                50
            );

        }

    }

}


/* =========================================================
   OWNER FILTER
   ========================================================= */

function populateOwnerFilter() {

    const select =
        document.getElementById(
            "ownerFilter"
        );


    if (
        !select
    ) {

        return;

    }


    while (
        select.options.length >
        1
    ) {

        select.remove(1);

    }


    const owners =
        [
            ...new Set(
                socialPosts
                    .map(
                        post =>
                            post.owner
                                ?.trim()
                    )
                    .filter(Boolean)
            )
        ]
            .sort();


    owners.forEach(
        owner => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                owner;


            option.textContent =
                owner.toUpperCase();


            select.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   FILTER
   ========================================================= */

function applyFilters() {

    const search =
        getValue(
            "postSearch"
        )
            .toLowerCase();


    const status =
        getValue(
            "statusFilter"
        );


    const platform =
        getValue(
            "platformFilter"
        );


    const owner =
        getValue(
            "ownerFilter"
        );


    const sort =
        getValue(
            "postSort"
        )
        ||
        "scheduled";


    filteredPosts =
        socialPosts.filter(
            post => {

                const searchable =
                    [
                        post.title,
                        post.owner,
                        post.campaign,
                        post.content_type,
                        post.copy,
                        post.cta,
                        post.hashtags,
                        post.asset,
                        post.notes,
                        post.platforms.join(" ")
                    ]
                        .join(" ")
                        .toLowerCase();


                return (

                    (
                        !search ||
                        searchable.includes(
                            search
                        )
                    )

                    &&

                    (
                        !status ||
                        post.status ===
                        status
                    )

                    &&

                    (
                        !platform ||
                        post.platforms.includes(
                            platform
                        )
                    )

                    &&

                    (
                        !owner ||
                        post.owner ===
                        owner
                    )

                );

            }
        );


    sortPosts(
        filteredPosts,
        sort
    );


    renderPosts();

    updateMetrics();

    renderWeekPlanner();

}


/* =========================================================
   SORT
   ========================================================= */

function sortPosts(
    list,
    sort
) {

    list.sort(
        (a,b) => {

            if (
                sort ===
                "recent"
            ) {

                return (
                    getUpdatedTimestamp(b)
                    -
                    getUpdatedTimestamp(a)
                );

            }


            if (
                sort ===
                "status"
            ) {

                return (
                    getStatusRank(a.status)
                    -
                    getStatusRank(b.status)
                );

            }


            if (
                sort ===
                "platform"
            ) {

                return (
                    String(
                        a.platforms[0] ||
                        ""
                    )
                        .localeCompare(
                            String(
                                b.platforms[0] ||
                                ""
                            )
                        )
                );

            }


            return compareDates(
                a.publish_date,
                b.publish_date
            );

        }
    );

}


/* =========================================================
   RENDER POSTS
   ========================================================= */

function renderPosts() {

    const container =
        document.getElementById(
            "postList"
        );


    if (
        !container
    ) {

        return;

    }


    container.innerHTML =
        "";


    setText(
        "visiblePostCount",
        filteredPosts.length
    );


    if (
        !filteredPosts.length
    ) {

        renderEmptyState(
            container
        );

        return;

    }


    filteredPosts.forEach(
        post => {

            container.appendChild(
                createPostCard(
                    post
                )
            );

        }
    );

}


/* =========================================================
   POST CARD
   ========================================================= */

function createPostCard(
    post
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "post-card";


    card.innerHTML = `

        <div class="post-card-header">


            <div class="post-topline">

                <span
                    class="post-status ${escapeHTML(post.status)}"
                >
                    ${escapeHTML(formatStatus(post.status))}
                </span>


                <span class="post-date">

                    ${
                        escapeHTML(
                            formatSchedule(
                                post
                            )
                        )
                    }

                </span>

            </div>


            <h3>
                ${escapeHTML(post.title)}
            </h3>


        </div>



        <div class="platform-row">

            ${
                post.platforms.length

                ?

                post.platforms
                    .map(
                        platform =>
                            `
                                <span class="platform-tag">
                                    ${escapeHTML(formatPlatform(platform))}
                                </span>
                            `
                    )
                    .join("")

                :

                `
                    <span class="platform-tag">
                        NO PLATFORM
                    </span>
                `
            }

        </div>



        ${
            post.campaign

            ?

            `
                <div class="post-campaign">

                    <span>
                        CAMPAIGN / THEME
                    </span>

                    <strong>
                        ${escapeHTML(post.campaign)}
                    </strong>

                </div>
            `

            :

            ""
        }



        <div class="post-copy-preview">

            <span>
                POST COPY
            </span>

            <p>

                ${
                    escapeHTML(
                        post.copy ||
                        "No copy has been drafted yet."
                    )
                }

            </p>

        </div>



        <div class="post-meta">


            <div>

                <span>
                    OWNER
                </span>

                <strong>
                    ${escapeHTML(post.owner || "Unassigned")}
                </strong>

            </div>


            <div>

                <span>
                    CONTENT TYPE
                </span>

                <strong>
                    ${escapeHTML(formatContentType(post.content_type))}
                </strong>

            </div>


        </div>



        <div class="post-actions">


            <button
                type="button"
                data-action="edit"
            >
                EDIT
            </button>


            <button
                type="button"
                data-action="duplicate"
            >
                DUPLICATE
            </button>


            <button
                type="button"
                data-action="advance"
            >
                ${escapeHTML(getAdvanceLabel(post))}
            </button>


        </div>

    `;


    card
        .querySelector(
            '[data-action="edit"]'
        )
        ?.addEventListener(
            "click",
            () => openDrawer(
                post.id
            )
        );


    card
        .querySelector(
            '[data-action="duplicate"]'
        )
        ?.addEventListener(
            "click",
            () => duplicatePost(
                post.id
            )
        );


    card
        .querySelector(
            '[data-action="advance"]'
        )
        ?.addEventListener(
            "click",
            () => advancePost(
                post.id
            )
        );


    return card;

}


/* =========================================================
   EMPTY
   ========================================================= */

function renderEmptyState(
    container
) {

    const hasPosts =
        socialPosts.length >
        0;


    container.innerHTML = `

        <div class="post-empty">


            <span>

                ${
                    hasPosts
                    ?
                    "NO MATCHING CONTENT"
                    :
                    "CONTENT QUEUE IS EMPTY"
                }

            </span>


            <h3>

                ${
                    hasPosts
                    ?
                    "Nothing matches those filters."
                    :
                    "Start planning the content calendar."
                }

            </h3>


            <p>

                ${
                    hasPosts
                    ?
                    "Try changing the status, platform, owner, or search."
                    :
                    "Ideas, drafts, scheduled posts, platforms, campaigns, creative notes, and publishing dates will live here."
                }

            </p>


            ${
                !hasPosts

                ?

                `
                    <button
                        id="emptyAddPost"
                        type="button"
                    >
                        + CREATE FIRST POST
                    </button>
                `

                :

                ""
            }


        </div>

    `;


    document
        .getElementById(
            "emptyAddPost"
        )
        ?.addEventListener(
            "click",
            () => openDrawer()
        );

}


/* =========================================================
   WEEK PLANNER
   ========================================================= */

function renderWeekPlanner() {

    const container =
        document.getElementById(
            "weekPlanner"
        );


    if (
        !container
    ) {

        return;

    }


    container.innerHTML =
        "";


    const week =
        getCurrentWeek();


    setText(
        "weekRange",
        `${formatShortDate(week[0])} — ${formatShortDate(week[6])}`
    );


    week.forEach(
        date => {

            const iso =
                toISODate(
                    date
                );


            const posts =
                socialPosts.filter(
                    post =>
                        post.publish_date ===
                        iso
                        &&
                        (
                            post.status ===
                            "scheduled"
                            ||
                            post.status ===
                            "published"
                        )
                );


            const day =
                document.createElement(
                    "div"
                );


            day.className =
                "week-day";


            if (
                iso ===
                todayISO()
            ) {

                day.classList.add(
                    "today"
                );

            }


            day.innerHTML = `

                <span class="week-day-name">
                    ${
                        date
                            .toLocaleDateString(
                                "en-US",
                                {
                                    weekday:
                                        "short"
                                }
                            )
                            .toUpperCase()
                    }
                </span>


                <strong class="week-day-number">
                    ${date.getDate()}
                </strong>


                <div class="week-post-count">
                    ${posts.length} scheduled
                </div>


                ${
                    posts
                        .slice(
                            0,
                            3
                        )
                        .map(
                            post =>
                                `
                                    <div class="week-post-item">
                                        ${escapeHTML(post.title)}
                                    </div>
                                `
                        )
                        .join("")
                }

            `;


            container.appendChild(
                day
            );

        }
    );

}


/* =========================================================
   METRICS
   ========================================================= */

function updateMetrics() {

    setText(
        "metricIdeas",
        countStatus(
            "idea"
        )
    );


    setText(
        "metricDrafts",
        countStatus(
            "draft"
        )
    );


    setText(
        "metricScheduled",
        countStatus(
            "scheduled"
        )
    );


    setText(
        "metricPublished",
        countStatus(
            "published"
        )
    );


    const weekDates =
        getCurrentWeek()
            .map(
                toISODate
            );


    const thisWeek =
        socialPosts.filter(
            post =>
                post.status ===
                "scheduled"
                &&
                weekDates.includes(
                    post.publish_date
                )
        );


    setText(
        "metricWeek",
        thisWeek.length
    );

}


/* =========================================================
   STATUS COUNT
   ========================================================= */

function countStatus(
    status
) {

    return socialPosts.filter(
        post =>
            post.status ===
            status
    ).length;

}


/* =========================================================
   ADVANCE
   ========================================================= */

function advancePost(
    id
) {

    const post =
        getPostById(
            id
        );


    if (
        !post
    ) {

        return;

    }


    const next = {

        idea:
            "draft",

        draft:
            "review",

        review:
            "scheduled",

        scheduled:
            "published",

        published:
            "published"

    };


    post.status =
        next[
            post.status
        ];


    post.updated_at =
        new Date()
            .toISOString();


    savePosts();

    applyFilters();

}


/* =========================================================
   ADVANCE LABEL
   ========================================================= */

function getAdvanceLabel(
    post
) {

    const labels = {

        idea:
            "START DRAFT",

        draft:
            "SEND TO REVIEW",

        review:
            "SCHEDULE",

        scheduled:
            "MARK PUBLISHED",

        published:
            "PUBLISHED"

    };


    return labels[
        post.status
    ];

}


/* =========================================================
   DUPLICATE
   ========================================================= */

function duplicatePost(
    id
) {

    const post =
        getPostById(
            id
        );


    if (
        !post
    ) {

        return;

    }


    socialPosts.push(
        {

            ...post,

            id:
                generateId(),

            title:
                `${post.title} Copy`,

            status:
                "draft",

            publish_date:
                "",

            publish_time:
                "",

            created_at:
                new Date()
                    .toISOString(),

            updated_at:
                new Date()
                    .toISOString()

        }
    );


    savePosts();

    populateOwnerFilter();

    applyFilters();

}


/* =========================================================
   DRAWER
   ========================================================= */

function openDrawer(
    postId = null
) {

    resetForm();


    if (
        postId
    ) {

        loadPostIntoForm(
            postId
        );

    }


    const overlay =
        document.getElementById(
            "postOverlay"
        );


    const drawer =
        document.getElementById(
            "postDrawer"
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
            "postOverlay"
        );


    const drawer =
        document.getElementById(
            "postDrawer"
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
   RESET
   ========================================================= */

function resetForm() {

    document
        .getElementById(
            "postForm"
        )
        ?.reset();


    setValue(
        "editingPostId",
        ""
    );


    setValue(
        "postStatus",
        "idea"
    );


    setValue(
        "postContentType",
        "educational"
    );


    setText(
        "drawerTitle",
        "New post"
    );


    setText(
        "savePostLabel",
        "SAVE POST"
    );

}


/* =========================================================
   LOAD FORM
   ========================================================= */

function loadPostIntoForm(
    id
) {

    const post =
        getPostById(
            id
        );


    if (
        !post
    ) {

        return;

    }


    setValue(
        "editingPostId",
        post.id
    );


    setValue(
        "postTitle",
        post.title
    );


    setValue(
        "postStatus",
        post.status
    );


    setValue(
        "postOwner",
        post.owner
    );


    setValue(
        "postDate",
        post.publish_date
    );


    setValue(
        "postTime",
        post.publish_time
    );


    setValue(
        "postCampaign",
        post.campaign
    );


    setValue(
        "postContentType",
        post.content_type
    );


    setValue(
        "postCopy",
        post.copy
    );


    setValue(
        "postCta",
        post.cta
    );


    setValue(
        "postLink",
        post.link
    );


    setValue(
        "postHashtags",
        post.hashtags
    );


    setValue(
        "postAsset",
        post.asset
    );


    setValue(
        "postNotes",
        post.notes
    );


    setSelectedPlatforms(
        post.platforms
    );


    setText(
        "drawerTitle",
        "Edit post"
    );


    setText(
        "savePostLabel",
        "UPDATE POST"
    );

}


/* =========================================================
   SAVE FORM
   ========================================================= */

function savePostFromForm(
    event
) {

    event.preventDefault();


    const title =
        getValue(
            "postTitle"
        );


    if (
        !title
    ) {

        return;

    }


    const editingId =
        getValue(
            "editingPostId"
        );


    const existing =
        editingId
        ?
        getPostById(
            editingId
        )
        :
        null;


    const record = {

        id:
            editingId ||
            generateId(),

        title,

        status:
            normalizeStatus(
                getValue(
                    "postStatus"
                )
            ),

        owner:
            getValue(
                "postOwner"
            ),

        platforms:
            getSelectedPlatforms(),

        publish_date:
            getValue(
                "postDate"
            ),

        publish_time:
            getValue(
                "postTime"
            ),

        campaign:
            getValue(
                "postCampaign"
            ),

        content_type:
            getValue(
                "postContentType"
            )
            ||
            "educational",

        copy:
            getValue(
                "postCopy"
            ),

        cta:
            getValue(
                "postCta"
            ),

        link:
            getValue(
                "postLink"
            ),

        hashtags:
            getValue(
                "postHashtags"
            ),

        asset:
            getValue(
                "postAsset"
            ),

        notes:
            getValue(
                "postNotes"
            ),

        created_at:
            existing?.created_at
            ||
            new Date()
                .toISOString(),

        updated_at:
            new Date()
                .toISOString()

    };


    if (
        editingId
    ) {

        const index =
            socialPosts.findIndex(
                post =>
                    String(
                        post.id
                    )
                    ===
                    String(
                        editingId
                    )
            );


        if (
            index >=
            0
        ) {

            socialPosts[index] =
                record;

        }

    }

    else {

        socialPosts.push(
            record
        );

    }


    savePosts();

    populateOwnerFilter();

    closeDrawer();

    applyFilters();

}


/* =========================================================
   PLATFORMS
   ========================================================= */

function getSelectedPlatforms() {

    return [
        ...document.querySelectorAll(
            'input[name="platform"]:checked'
        )
    ]
        .map(
            input =>
                input.value
        );

}


function setSelectedPlatforms(
    platforms
) {

    document
        .querySelectorAll(
            'input[name="platform"]'
        )
        .forEach(
            input => {

                input.checked =
                    platforms.includes(
                        input.value
                    );

            }
        );

}


/* =========================================================
   SAVE
   ========================================================= */

function savePosts() {

    localStorage.setItem(
        SOCIAL_STORAGE_KEY,
        JSON.stringify(
            socialPosts
        )
    );

}


/* =========================================================
   STATUS
   ========================================================= */

function normalizeStatus(
    status
) {

    const value =
        String(
            status ||
            ""
        )
            .toLowerCase();


    const valid = [

        "idea",
        "draft",
        "review",
        "scheduled",
        "published"

    ];


    return valid.includes(
        value
    )
        ?
        value
        :
        "idea";

}


function getStatusRank(
    status
) {

    const order = {

        idea: 0,
        draft: 1,
        review: 2,
        scheduled: 3,
        published: 4

    };


    return order[
        status
    ]
    ??
    99;

}


/* =========================================================
   FORMATTING
   ========================================================= */

function formatStatus(
    value
) {

    return value
        .replace(
            /-/g,
            " "
        );

}


function formatPlatform(
    value
) {

    const labels = {

        linkedin:
            "LinkedIn",

        facebook:
            "Facebook",

        instagram:
            "Instagram",

        x:
            "X"

    };


    return labels[
        value
    ]
    ||
    value;

}


function formatContentType(
    value
) {

    const labels = {

        educational:
            "Educational",

        "thought-leadership":
            "Thought Leadership",

        company:
            "Company Update",

        event:
            "Event",

        "case-study":
            "Case Study",

        promotion:
            "Promotion",

        employee:
            "Employee / Culture",

        other:
            "Other"

    };


    return labels[
        value
    ]
    ||
    value;

}


/* =========================================================
   SCHEDULE
   ========================================================= */

function formatSchedule(
    post
) {

    if (
        !post.publish_date
    ) {

        return "NOT SCHEDULED";

    }


    let result =
        formatDate(
            post.publish_date
        );


    if (
        post.publish_time
    ) {

        const time =
            new Date(
                `2000-01-01T${post.publish_time}`
            )
                .toLocaleTimeString(
                    "en-US",
                    {
                        hour:
                            "numeric",

                        minute:
                            "2-digit"
                    }
                );


        result +=
            ` · ${time}`;

    }


    return result;

}


/* =========================================================
   WEEK
   ========================================================= */

function getCurrentWeek() {

    const now =
        new Date();


    const day =
        now.getDay();


    const mondayOffset =
        day === 0
        ?
        -6
        :
        1 - day;


    const monday =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() +
            mondayOffset
        );


    return Array.from(
        {
            length:
                7
        },
        (_,index) =>
            new Date(
                monday.getFullYear(),
                monday.getMonth(),
                monday.getDate() +
                index
            )
    );

}


function todayISO() {

    return toISODate(
        new Date()
    );

}


function toISODate(
    date
) {

    return [

        date.getFullYear(),

        String(
            date.getMonth() + 1
        )
            .padStart(
                2,
                "0"
            ),

        String(
            date.getDate()
        )
            .padStart(
                2,
                "0"
            )

    ]
        .join("-");

}


/* =========================================================
   DATES
   ========================================================= */

function formatDate(
    value
) {

    if (
        !value
    ) {

        return "—";

    }


    return new Date(
        `${value}T12:00:00`
    )
        .toLocaleDateString(
            "en-US",
            {
                month:
                    "short",

                day:
                    "numeric"
            }
        );

}


function formatShortDate(
    date
) {

    return date.toLocaleDateString(
        "en-US",
        {
            month:
                "short",

            day:
                "numeric"
        }
    );

}


function compareDates(
    a,
    b
) {

    if (
        !a &&
        !b
    ) {

        return 0;

    }


    if (
        !a
    ) {

        return 1;

    }


    if (
        !b
    ) {

        return -1;

    }


    return a.localeCompare(
        b
    );

}


/* =========================================================
   LOOKUP
   ========================================================= */

function getPostById(
    id
) {

    return socialPosts.find(
        post =>
            String(
                post.id
            )
            ===
            String(
                id
            )
    )
    ||
    null;

}


/* =========================================================
   UPDATED
   ========================================================= */

function getUpdatedTimestamp(
    post
) {

    return new Date(
        post.updated_at ||
        post.created_at ||
        0
    )
        .getTime();

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


/* =========================================================
   ID
   ========================================================= */

function generateId() {

    if (
        window.crypto &&
        typeof crypto.randomUUID ===
        "function"
    ) {

        return crypto.randomUUID();

    }


    return (
        Date.now()
        +
        "-"
        +
        Math.random()
            .toString(16)
            .slice(2)
    );

}


/* =========================================================
   ESCAPE
   ========================================================= */

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
