/* =========================================================
   HELIX CRM
   SEO WORKSPACE
   ========================================================= */


/* =========================================================
   STORAGE
   ========================================================= */

const KEYWORD_STORAGE_KEY =
    "helix_crm_seo_keywords";

const SNAPSHOT_STORAGE_KEY =
    "helix_crm_seo_snapshot";


/* =========================================================
   STATE
   ========================================================= */

let keywords =
    [];

let filteredKeywords =
    [];

let snapshot =
    createEmptySnapshot();


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeSEO
);


function initializeSEO() {

    loadKeywords();

    loadSnapshot();

    bindControls();

    readURLParameters();

    applyFilters();

    renderSnapshot();

}


/* =========================================================
   EMPTY SNAPSHOT
   ========================================================= */

function createEmptySnapshot() {

    return {

        score:
            0,

        indexed_pages:
            0,

        broken_links:
            0,

        missing_meta:
            0,

        slow_pages:
            0,

        schema_issues:
            0,

        notes:
            ""

    };

}


/* =========================================================
   LOAD KEYWORDS
   ========================================================= */

function loadKeywords() {

    try {

        const stored =
            localStorage.getItem(
                KEYWORD_STORAGE_KEY
            );


        if (
            stored
        ) {

            keywords =
                JSON.parse(
                    stored
                );

        }

        else {

            keywords =
                Array.isArray(
                    window.HELIX_DATA
                        ?.seo
                        ?.keywords
                )
                ?
                [...window.HELIX_DATA.seo.keywords]
                :
                [];

        }

    }

    catch (error) {

        console.error(
            "Unable to load SEO keywords:",
            error
        );


        keywords =
            [];

    }


    keywords =
        keywords.map(
            normalizeKeyword
        );

}


/* =========================================================
   LOAD SNAPSHOT
   ========================================================= */

function loadSnapshot() {

    try {

        const stored =
            localStorage.getItem(
                SNAPSHOT_STORAGE_KEY
            );


        if (
            stored
        ) {

            snapshot = {

                ...createEmptySnapshot(),

                ...JSON.parse(
                    stored
                )

            };

            return;

        }

    }

    catch (error) {

        console.error(
            "Unable to load SEO snapshot:",
            error
        );

    }


    if (
        window.HELIX_DATA
            ?.seo
    ) {

        snapshot.score =
            clampPercent(
                window.HELIX_DATA
                    .seo
                    .score
            );

    }

}


/* =========================================================
   NORMALIZE KEYWORD
   ========================================================= */

function normalizeKeyword(
    keyword
) {

    return {

        id:
            keyword.id ||
            generateId(),

        keyword:
            keyword.keyword ||
            "",

        intent:
            normalizeIntent(
                keyword.intent
            ),

        status:
            normalizeStatus(
                keyword.status
            ),

        position:
            normalizeRank(
                keyword.position
            ),

        previous_position:
            normalizeRank(
                keyword.previous_position
            ),

        volume:
            normalizeCount(
                keyword.volume
            ),

        difficulty:
            clampPercent(
                keyword.difficulty
            ),

        target_page:
            keyword.target_page ||
            "",

        content_needed:
            keyword.content_needed ||
            "",

        notes:
            keyword.notes ||
            "",

        created_at:
            keyword.created_at ||
            new Date()
                .toISOString(),

        updated_at:
            keyword.updated_at ||
            ""

    };

}


/* =========================================================
   CONTROLS
   ========================================================= */

function bindControls() {

    document
        .getElementById(
            "addKeywordButton"
        )
        ?.addEventListener(
            "click",
            () => openKeywordDrawer()
        );


    document
        .getElementById(
            "keywordDrawerClose"
        )
        ?.addEventListener(
            "click",
            closeKeywordDrawer
        );


    document
        .getElementById(
            "cancelKeywordButton"
        )
        ?.addEventListener(
            "click",
            closeKeywordDrawer
        );


    document
        .getElementById(
            "keywordOverlay"
        )
        ?.addEventListener(
            "click",
            closeKeywordDrawer
        );


    document
        .getElementById(
            "keywordForm"
        )
        ?.addEventListener(
            "submit",
            saveKeywordFromForm
        );


    document
        .getElementById(
            "editSeoSnapshotButton"
        )
        ?.addEventListener(
            "click",
            openSnapshotDrawer
        );


    document
        .getElementById(
            "snapshotDrawerClose"
        )
        ?.addEventListener(
            "click",
            closeSnapshotDrawer
        );


    document
        .getElementById(
            "cancelSnapshotButton"
        )
        ?.addEventListener(
            "click",
            closeSnapshotDrawer
        );


    document
        .getElementById(
            "snapshotOverlay"
        )
        ?.addEventListener(
            "click",
            closeSnapshotDrawer
        );


    document
        .getElementById(
            "snapshotForm"
        )
        ?.addEventListener(
            "submit",
            saveSnapshotFromForm
        );


    document
        .getElementById(
            "keywordSearch"
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
                        "keywordSearch"
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
        "intentFilter",
        "statusFilter",
        "rankingFilter",
        "keywordSort"
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

                closeKeywordDrawer();

                closeSnapshotDrawer();

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
   URL PARAMETERS
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
            "keywordSearch",
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
            () => openKeywordDrawer(),
            50
        );

    }


    if (
        id
    ) {

        const keyword =
            getKeywordById(
                id
            );


        if (
            keyword
        ) {

            setTimeout(
                () => openKeywordDrawer(
                    keyword.id
                ),
                50
            );

        }

    }

}


/* =========================================================
   FILTERS
   ========================================================= */

function applyFilters() {

    const search =
        getValue(
            "keywordSearch"
        )
            .toLowerCase();


    const intent =
        getValue(
            "intentFilter"
        );


    const status =
        getValue(
            "statusFilter"
        );


    const ranking =
        getValue(
            "rankingFilter"
        );


    const sort =
        getValue(
            "keywordSort"
        )
        ||
        "position";


    filteredKeywords =
        keywords.filter(
            item => {

                const searchable =
                    [
                        item.keyword,
                        item.intent,
                        item.status,
                        item.target_page,
                        item.content_needed,
                        item.notes
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
                        !intent ||
                        item.intent ===
                        intent
                    )

                    &&

                    (
                        !status ||
                        item.status ===
                        status
                    )

                    &&

                    matchesRankingFilter(
                        item,
                        ranking
                    )

                );

            }
        );


    sortKeywords(
        filteredKeywords,
        sort
    );


    renderKeywords();

    updateMetrics();

}


/* =========================================================
   RANKING FILTER
   ========================================================= */

function matchesRankingFilter(
    keyword,
    filter
) {

    if (
        !filter
    ) {

        return true;

    }


    const position =
        keyword.position;


    if (
        filter ===
        "unranked"
    ) {

        return (
            position <=
            0
        );

    }


    if (
        filter ===
        "top3"
    ) {

        return (
            position >=
            1
            &&
            position <=
            3
        );

    }


    if (
        filter ===
        "top10"
    ) {

        return (
            position >=
            1
            &&
            position <=
            10
        );

    }


    if (
        filter ===
        "top20"
    ) {

        return (
            position >=
            1
            &&
            position <=
            20
        );

    }


    return true;

}


/* =========================================================
   SORT
   ========================================================= */

function sortKeywords(
    list,
    sort
) {

    list.sort(
        (a,b) => {

            if (
                sort ===
                "movement"
            ) {

                return (
                    getMovement(b)
                    -
                    getMovement(a)
                );

            }


            if (
                sort ===
                "volume"
            ) {

                return (
                    b.volume -
                    a.volume
                );

            }


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
                "keyword"
            ) {

                return (
                    a.keyword
                        .localeCompare(
                            b.keyword
                        )
                );

            }


            return comparePositions(
                a.position,
                b.position
            );

        }
    );

}


/* =========================================================
   RENDER KEYWORDS
   ========================================================= */

function renderKeywords() {

    const container =
        document.getElementById(
            "keywordList"
        );


    if (
        !container
    ) {

        return;

    }


    container.innerHTML =
        "";


    setText(
        "visibleKeywordCount",
        filteredKeywords.length
    );


    if (
        !filteredKeywords.length
    ) {

        renderEmptyState(
            container
        );

        return;

    }


    filteredKeywords.forEach(
        keyword => {

            container.appendChild(
                createKeywordRow(
                    keyword
                )
            );

        }
    );

}


/* =========================================================
   KEYWORD ROW
   ========================================================= */

function createKeywordRow(
    keyword
) {

    const movement =
        getMovement(
            keyword
        );


    const movementClass =
        movement >
        0
        ?
        "movement-up"
        :
        movement <
        0
        ?
        "movement-down"
        :
        "movement-flat";


    const movementLabel =
        movement >
        0
        ?
        `↑ ${movement}`
        :
        movement <
        0
        ?
        `↓ ${Math.abs(movement)}`
        :
        "—";


    const positionLabel =
        keyword.position >
        0
        ?
        keyword.position
        :
        "—";


    const row =
        document.createElement(
            "article"
        );


    row.className =
        "keyword-row";


    row.innerHTML = `

        <div class="keyword-cell keyword-primary">

            <strong>
                ${escapeHTML(keyword.keyword)}
            </strong>

            <div class="keyword-tags">

                <span class="keyword-tag">
                    ${escapeHTML(keyword.intent)}
                </span>

                <span
                    class="keyword-tag ${escapeHTML(keyword.status)}"
                >
                    ${escapeHTML(formatStatus(keyword.status))}
                </span>

            </div>

        </div>



        <div class="keyword-cell">

            <span>
                POSITION
            </span>

            <strong
                class="position-number ${keyword.position <= 0 ? "unranked" : ""}"
            >
                ${positionLabel}
            </strong>

        </div>



        <div class="keyword-cell">

            <span>
                MOVEMENT
            </span>

            <strong class="${movementClass}">
                ${movementLabel}
            </strong>

        </div>



        <div class="keyword-cell">

            <span>
                VOLUME
            </span>

            <strong>
                ${formatNumber(keyword.volume)}
            </strong>

        </div>



        <div class="keyword-cell">

            <span>
                DIFFICULTY
            </span>

            <strong>
                ${keyword.difficulty}%
            </strong>

        </div>



        <div class="keyword-cell">

            <span>
                TARGET PAGE
            </span>

            <strong class="target-page">
                ${escapeHTML(keyword.target_page || "Not assigned")}
            </strong>

        </div>



        <div class="keyword-cell">

            <button
                class="keyword-edit"
                type="button"
            >
                EDIT
            </button>

        </div>

    `;


    row
        .querySelector(
            ".keyword-edit"
        )
        ?.addEventListener(
            "click",
            () => {

                openKeywordDrawer(
                    keyword.id
                );

            }
        );


    return row;

}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function renderEmptyState(
    container
) {

    const hasKeywords =
        keywords.length >
        0;


    container.innerHTML = `

        <div class="keyword-empty">

            <span>
                ${
                    hasKeywords
                    ?
                    "NO MATCHING KEYWORDS"
                    :
                    "SEARCH TRACKER IS EMPTY"
                }
            </span>


            <h3>
                ${
                    hasKeywords
                    ?
                    "Nothing matches those filters."
                    :
                    "Start tracking organic search."
                }
            </h3>


            <p>
                ${
                    hasKeywords
                    ?
                    "Try changing the search, intent, ranking, or status filters."
                    :
                    "Keyword position, search volume, target pages, ranking movement, and optimization work will appear here."
                }
            </p>


            ${
                !hasKeywords
                ?
                `
                    <button
                        id="emptyAddKeyword"
                        type="button"
                    >
                        + TRACK FIRST KEYWORD
                    </button>
                `
                :
                ""
            }

        </div>

    `;


    document
        .getElementById(
            "emptyAddKeyword"
        )
        ?.addEventListener(
            "click",
            () => openKeywordDrawer()
        );

}


/* =========================================================
   METRICS
   ========================================================= */

function updateMetrics() {

    setText(
        "metricKeywords",
        keywords.length
    );


    const topTen =
        keywords.filter(
            keyword =>
                keyword.position >=
                1
                &&
                keyword.position <=
                10
        );


    setText(
        "metricTop10",
        topTen.length
    );


    const improved =
        keywords.filter(
            keyword =>
                getMovement(
                    keyword
                )
                >
                0
        );


    setText(
        "metricImproved",
        improved.length
    );


    const pages =
        new Set(
            keywords
                .map(
                    keyword =>
                        keyword.target_page
                            ?.trim()
                )
                .filter(Boolean)
        );


    setText(
        "metricPages",
        pages.size
    );

}


/* =========================================================
   SNAPSHOT RENDER
   ========================================================= */

function renderSnapshot() {

    setText(
        "seoHealthScore",
        snapshot.score
    );


    const fill =
        document.getElementById(
            "seoScoreFill"
        );


    if (
        fill
    ) {

        fill.style.width =
            `${snapshot.score}%`;

    }


    renderTechnicalChecks();

}


/* =========================================================
   TECHNICAL CHECKS
   ========================================================= */

function renderTechnicalChecks() {

    const container =
        document.getElementById(
            "technicalChecks"
        );


    if (
        !container
    ) {

        return;

    }


    const checks = [

        {
            label:
                "INDEXED PAGES",
            value:
                snapshot.indexed_pages,
            detail:
                "pages visible to search",
            type:
                "good"
        },

        {
            label:
                "BROKEN LINKS",
            value:
                snapshot.broken_links,
            detail:
                "links requiring attention",
            type:
                getIssueClass(
                    snapshot.broken_links
                )
        },

        {
            label:
                "MISSING META",
            value:
                snapshot.missing_meta,
            detail:
                "pages missing metadata",
            type:
                getIssueClass(
                    snapshot.missing_meta
                )
        },

        {
            label:
                "SLOW PAGES",
            value:
                snapshot.slow_pages,
            detail:
                "performance issues",
            type:
                getIssueClass(
                    snapshot.slow_pages
                )
        },

        {
            label:
                "SCHEMA ISSUES",
            value:
                snapshot.schema_issues,
            detail:
                "structured data issues",
            type:
                getIssueClass(
                    snapshot.schema_issues
                )
        }

    ];


    container.innerHTML =
        checks
            .map(
                check => `

                    <article
                        class="technical-check ${check.type}"
                    >

                        <span>
                            ${escapeHTML(check.label)}
                        </span>

                        <strong>
                            ${formatNumber(check.value)}
                        </strong>

                        <small>
                            ${escapeHTML(check.detail)}
                        </small>

                    </article>

                `
            )
            .join("");

}


/* =========================================================
   ISSUE CLASS
   ========================================================= */

function getIssueClass(
    value
) {

    const number =
        Number(
            value ||
            0
        );


    if (
        number ===
        0
    ) {

        return "good";

    }


    if (
        number <=
        3
    ) {

        return "warning";

    }


    return "issue";

}


/* =========================================================
   MOVEMENT
   ========================================================= */

function getMovement(
    keyword
) {

    if (
        keyword.position <=
        0
        ||
        keyword.previous_position <=
        0
    ) {

        return 0;

    }


    return (
        keyword.previous_position -
        keyword.position
    );

}


/* =========================================================
   KEYWORD DRAWER
   ========================================================= */

function openKeywordDrawer(
    id = null
) {

    resetKeywordForm();


    if (
        id
    ) {

        loadKeywordIntoForm(
            id
        );

    }


    const overlay =
        document.getElementById(
            "keywordOverlay"
        );


    const drawer =
        document.getElementById(
            "keywordDrawer"
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
   CLOSE KEYWORD DRAWER
   ========================================================= */

function closeKeywordDrawer() {

    closeDrawerPair(
        "keywordOverlay",
        "keywordDrawer"
    );

}


/* =========================================================
   RESET KEYWORD FORM
   ========================================================= */

function resetKeywordForm() {

    document
        .getElementById(
            "keywordForm"
        )
        ?.reset();


    setValue(
        "editingKeywordId",
        ""
    );


    setValue(
        "keywordIntent",
        "commercial"
    );


    setValue(
        "keywordStatus",
        "tracking"
    );


    setValue(
        "keywordPosition",
        "0"
    );


    setValue(
        "keywordPreviousPosition",
        "0"
    );


    setValue(
        "keywordVolume",
        "0"
    );


    setValue(
        "keywordDifficulty",
        "0"
    );


    setText(
        "keywordDrawerTitle",
        "Track keyword"
    );


    setText(
        "saveKeywordLabel",
        "SAVE KEYWORD"
    );

}


/* =========================================================
   LOAD KEYWORD
   ========================================================= */

function loadKeywordIntoForm(
    id
) {

    const keyword =
        getKeywordById(
            id
        );


    if (
        !keyword
    ) {

        return;

    }


    setValue(
        "editingKeywordId",
        keyword.id
    );


    setValue(
        "keywordName",
        keyword.keyword
    );


    setValue(
        "keywordIntent",
        keyword.intent
    );


    setValue(
        "keywordStatus",
        keyword.status
    );


    setValue(
        "keywordPosition",
        keyword.position
    );


    setValue(
        "keywordPreviousPosition",
        keyword.previous_position
    );


    setValue(
        "keywordVolume",
        keyword.volume
    );


    setValue(
        "keywordDifficulty",
        keyword.difficulty
    );


    setValue(
        "keywordTargetPage",
        keyword.target_page
    );


    setValue(
        "keywordContent",
        keyword.content_needed
    );


    setValue(
        "keywordNotes",
        keyword.notes
    );


    setText(
        "keywordDrawerTitle",
        "Edit keyword"
    );


    setText(
        "saveKeywordLabel",
        "UPDATE KEYWORD"
    );

}


/* =========================================================
   SAVE KEYWORD
   ========================================================= */

function saveKeywordFromForm(
    event
) {

    event.preventDefault();


    const name =
        getValue(
            "keywordName"
        );


    if (
        !name
    ) {

        return;

    }


    const editingId =
        getValue(
            "editingKeywordId"
        );


    const existing =
        editingId
        ?
        getKeywordById(
            editingId
        )
        :
        null;


    const record = {

        id:
            editingId ||
            generateId(),

        keyword:
            name,

        intent:
            normalizeIntent(
                getValue(
                    "keywordIntent"
                )
            ),

        status:
            normalizeStatus(
                getValue(
                    "keywordStatus"
                )
            ),

        position:
            normalizeRank(
                getValue(
                    "keywordPosition"
                )
            ),

        previous_position:
            normalizeRank(
                getValue(
                    "keywordPreviousPosition"
                )
            ),

        volume:
            normalizeCount(
                getValue(
                    "keywordVolume"
                )
            ),

        difficulty:
            clampPercent(
                getValue(
                    "keywordDifficulty"
                )
            ),

        target_page:
            getValue(
                "keywordTargetPage"
            ),

        content_needed:
            getValue(
                "keywordContent"
            ),

        notes:
            getValue(
                "keywordNotes"
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
            keywords.findIndex(
                keyword =>
                    String(
                        keyword.id
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

            keywords[index] =
                record;

        }

    }

    else {

        keywords.push(
            record
        );

    }


    saveKeywords();

    closeKeywordDrawer();

    applyFilters();

}


/* =========================================================
   SNAPSHOT DRAWER
   ========================================================= */

function openSnapshotDrawer() {

    loadSnapshotIntoForm();


    const overlay =
        document.getElementById(
            "snapshotOverlay"
        );


    const drawer =
        document.getElementById(
            "snapshotDrawer"
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
   CLOSE SNAPSHOT
   ========================================================= */

function closeSnapshotDrawer() {

    closeDrawerPair(
        "snapshotOverlay",
        "snapshotDrawer"
    );

}


/* =========================================================
   SNAPSHOT FORM
   ========================================================= */

function loadSnapshotIntoForm() {

    setValue(
        "snapshotScore",
        snapshot.score
    );


    setValue(
        "snapshotIndexedPages",
        snapshot.indexed_pages
    );


    setValue(
        "snapshotBrokenLinks",
        snapshot.broken_links
    );


    setValue(
        "snapshotMissingMeta",
        snapshot.missing_meta
    );


    setValue(
        "snapshotSlowPages",
        snapshot.slow_pages
    );


    setValue(
        "snapshotSchemaIssues",
        snapshot.schema_issues
    );


    setValue(
        "snapshotNotes",
        snapshot.notes
    );

}


/* =========================================================
   SAVE SNAPSHOT
   ========================================================= */

function saveSnapshotFromForm(
    event
) {

    event.preventDefault();


    snapshot = {

        score:
            clampPercent(
                getValue(
                    "snapshotScore"
                )
            ),

        indexed_pages:
            normalizeCount(
                getValue(
                    "snapshotIndexedPages"
                )
            ),

        broken_links:
            normalizeCount(
                getValue(
                    "snapshotBrokenLinks"
                )
            ),

        missing_meta:
            normalizeCount(
                getValue(
                    "snapshotMissingMeta"
                )
            ),

        slow_pages:
            normalizeCount(
                getValue(
                    "snapshotSlowPages"
                )
            ),

        schema_issues:
            normalizeCount(
                getValue(
                    "snapshotSchemaIssues"
                )
            ),

        notes:
            getValue(
                "snapshotNotes"
            )

    };


    saveSnapshot();

    closeSnapshotDrawer();

    renderSnapshot();

}


/* =========================================================
   GENERIC CLOSE
   ========================================================= */

function closeDrawerPair(
    overlayId,
    drawerId
) {

    const overlay =
        document.getElementById(
            overlayId
        );


    const drawer =
        document.getElementById(
            drawerId
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
   SAVE STORAGE
   ========================================================= */

function saveKeywords() {

    localStorage.setItem(
        KEYWORD_STORAGE_KEY,
        JSON.stringify(
            keywords
        )
    );

}


function saveSnapshot() {

    localStorage.setItem(
        SNAPSHOT_STORAGE_KEY,
        JSON.stringify(
            snapshot
        )
    );

}


/* =========================================================
   LOOKUP
   ========================================================= */

function getKeywordById(
    id
) {

    return keywords.find(
        keyword =>
            String(
                keyword.id
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
   NORMALIZE
   ========================================================= */

function normalizeIntent(
    value
) {

    const intent =
        String(
            value ||
            ""
        )
            .toLowerCase();


    const valid = [

        "commercial",

        "informational",

        "transactional",

        "navigational"

    ];


    return valid.includes(
        intent
    )
        ?
        intent
        :
        "commercial";

}


function normalizeStatus(
    value
) {

    const status =
        String(
            value ||
            ""
        )
            .toLowerCase();


    const valid = [

        "tracking",

        "priority",

        "content-needed",

        "optimized",

        "paused"

    ];


    return valid.includes(
        status
    )
        ?
        status
        :
        "tracking";

}


function normalizeRank(
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
                number
            )
        )
    );

}


/* =========================================================
   SORT HELPERS
   ========================================================= */

function comparePositions(
    a,
    b
) {

    const positionA =
        a > 0
        ?
        a
        :
        9999;


    const positionB =
        b > 0
        ?
        b
        :
        9999;


    return (
        positionA -
        positionB
    );

}


function getUpdatedTimestamp(
    keyword
) {

    return new Date(
        keyword.updated_at ||
        keyword.created_at ||
        0
    )
        .getTime();

}


/* =========================================================
   FORMAT
   ========================================================= */

function formatStatus(
    value
) {

    return String(
        value ||
        ""
    )
        .replace(
            /-/g,
            " "
        );

}


function formatNumber(
    value
) {

    return new Intl.NumberFormat(
        "en-US"
    )
        .format(
            Number(
                value ||
                0
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
