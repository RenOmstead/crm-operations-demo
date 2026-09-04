/* =========================================================
   HELIX CRM
   EMAIL CAMPAIGNS
   ========================================================= */


/* =========================================================
   STATE
   ========================================================= */

let campaigns = [];

let filteredCampaigns = [];


/* =========================================================
   STORAGE
   ========================================================= */

const CAMPAIGN_STORAGE_KEY =
    "helix_crm_campaigns";


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeEmailCampaigns
);


function initializeEmailCampaigns() {

    loadCampaigns();

    bindControls();

    populateOwnerFilter();

    readURLParameters();

    applyFilters();

}


/* =========================================================
   LOAD
   ========================================================= */

function loadCampaigns() {

    try {

        const stored =
            localStorage.getItem(
                CAMPAIGN_STORAGE_KEY
            );


        if (
            stored
        ) {

            campaigns =
                JSON.parse(
                    stored
                );

        }

        else {

            campaigns =
                Array.isArray(
                    window.HELIX_DATA
                        ?.campaigns
                )
                ?
                [...window.HELIX_DATA.campaigns]
                :
                [];

        }

    }

    catch (error) {

        console.error(
            "Unable to load campaigns:",
            error
        );


        campaigns =
            [];

    }


    campaigns =
        campaigns.map(
            normalizeCampaign
        );

}


/* =========================================================
   NORMALIZE
   ========================================================= */

function normalizeCampaign(
    campaign
) {

    return {

        id:
            campaign.id ||
            generateId(),

        name:
            campaign.name ||
            "",

        type:
            normalizeType(
                campaign.type
            ),

        status:
            normalizeStatus(
                campaign.status
            ),

        owner:
            campaign.owner ||
            "",

        audience:
            campaign.audience ||
            "",

        subject:
            campaign.subject ||
            "",

        preview_text:
            campaign.preview_text ||
            "",

        send_date:
            campaign.send_date ||
            "",

        send_time:
            campaign.send_time ||
            "",

        recipients:
            normalizeCount(
                campaign.recipients
            ),

        delivered:
            normalizeCount(
                campaign.delivered
            ),

        open_rate:
            clampPercent(
                campaign.open_rate
            ),

        click_rate:
            clampPercent(
                campaign.click_rate
            ),

        replies:
            normalizeCount(
                campaign.replies
            ),

        conversions:
            normalizeCount(
                campaign.conversions
            ),

        goal:
            campaign.goal ||
            "",

        body_summary:
            campaign.body_summary ||
            "",

        cta:
            campaign.cta ||
            "",

        notes:
            campaign.notes ||
            "",

        created_at:
            campaign.created_at ||
            new Date()
                .toISOString(),

        updated_at:
            campaign.updated_at ||
            ""

    };

}


/* =========================================================
   CONTROLS
   ========================================================= */

function bindControls() {

    document
        .getElementById(
            "addCampaignButton"
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
            "cancelCampaignButton"
        )
        ?.addEventListener(
            "click",
            closeDrawer
        );


    document
        .getElementById(
            "campaignOverlay"
        )
        ?.addEventListener(
            "click",
            closeDrawer
        );


    document
        .getElementById(
            "campaignForm"
        )
        ?.addEventListener(
            "submit",
            saveCampaignFromForm
        );


    document
        .getElementById(
            "campaignSearch"
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

                const search =
                    document.getElementById(
                        "campaignSearch"
                    );


                if (
                    search
                ) {

                    search.value =
                        event.target.value;

                }


                applyFilters();

            }
        );


    [
        "statusFilter",
        "typeFilter",
        "ownerFilter",
        "campaignSort"
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
                document.activeElement
                    ?.tagName !==
                    "INPUT"
                &&
                document.activeElement
                    ?.tagName !==
                    "TEXTAREA"
                &&
                document.activeElement
                    ?.tagName !==
                    "SELECT"
            ) {

                event.preventDefault();


                document
                    .getElementById(
                        "campaignSearch"
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
            "campaignSearch",
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

        const campaign =
            getCampaignById(
                id
            );


        if (
            campaign
        ) {

            setTimeout(
                () => openDrawer(
                    campaign.id
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
                campaigns
                    .map(
                        campaign =>
                            String(
                                campaign.owner ||
                                ""
                            )
                                .trim()
                    )
                    .filter(Boolean)
            )
        ]
            .sort(
                (a,b) =>
                    a.localeCompare(b)
            );


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
   FILTERS
   ========================================================= */

function applyFilters() {

    const search =
        getValue(
            "campaignSearch"
        )
            .toLowerCase();


    const status =
        getValue(
            "statusFilter"
        );


    const type =
        getValue(
            "typeFilter"
        );


    const owner =
        getValue(
            "ownerFilter"
        );


    const sort =
        getValue(
            "campaignSort"
        )
        ||
        "recent";


    filteredCampaigns =
        campaigns.filter(
            campaign => {

                const searchable =
                    [
                        campaign.name,
                        campaign.type,
                        campaign.owner,
                        campaign.audience,
                        campaign.subject,
                        campaign.preview_text,
                        campaign.goal,
                        campaign.body_summary,
                        campaign.cta,
                        campaign.notes
                    ]
                        .join(" ")
                        .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchable.includes(
                        search
                    );


                const matchesStatus =
                    !status ||
                    campaign.status ===
                    status;


                const matchesType =
                    !type ||
                    campaign.type ===
                    type;


                const matchesOwner =
                    !owner ||
                    campaign.owner ===
                    owner;


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesType &&
                    matchesOwner
                );

            }
        );


    sortCampaigns(
        filteredCampaigns,
        sort
    );


    renderCampaigns();

    updateMetrics();

}


/* =========================================================
   SORT
   ========================================================= */

function sortCampaigns(
    list,
    sort
) {

    list.sort(
        (a,b) => {

            if (
                sort ===
                "send-date"
            ) {

                return compareDates(
                    a.send_date,
                    b.send_date
                );

            }


            if (
                sort ===
                "open-rate"
            ) {

                return (
                    b.open_rate -
                    a.open_rate
                );

            }


            if (
                sort ===
                "click-rate"
            ) {

                return (
                    b.click_rate -
                    a.click_rate
                );

            }


            if (
                sort ===
                "name"
            ) {

                return a.name
                    .localeCompare(
                        b.name
                    );

            }


            return (
                getUpdatedTimestamp(b)
                -
                getUpdatedTimestamp(a)
            );

        }
    );

}


/* =========================================================
   RENDER
   ========================================================= */

function renderCampaigns() {

    const container =
        document.getElementById(
            "campaignList"
        );


    if (
        !container
    ) {

        return;

    }


    container.innerHTML =
        "";


    setText(
        "visibleCampaignCount",
        filteredCampaigns.length
    );


    if (
        !filteredCampaigns.length
    ) {

        renderEmptyState(
            container
        );

        return;

    }


    filteredCampaigns.forEach(
        campaign => {

            container.appendChild(
                createCampaignCard(
                    campaign
                )
            );

        }
    );

}


/* =========================================================
   CARD
   ========================================================= */

function createCampaignCard(
    campaign
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "campaign-card";


    card.innerHTML = `

        <div class="campaign-card-header">


            <div class="campaign-topline">


                <div class="campaign-badges">

                    <span
                        class="campaign-status ${escapeHTML(campaign.status)}"
                    >
                        ${escapeHTML(formatStatus(campaign.status))}
                    </span>


                    <span class="campaign-type">
                        ${escapeHTML(formatType(campaign.type))}
                    </span>

                </div>


                <span class="campaign-send-date">

                    ${
                        escapeHTML(
                            formatSendDate(
                                campaign
                            )
                        )
                    }

                </span>


            </div>


            <h3>

                ${
                    escapeHTML(
                        campaign.name
                    )
                }

            </h3>


            <p class="campaign-subject">

                ${
                    campaign.subject
                    ?
                    `“${escapeHTML(campaign.subject)}”`
                    :
                    "No subject line added yet."
                }

            </p>


        </div>



        <div class="campaign-audience">

            <span>
                AUDIENCE
            </span>

            <strong>

                ${
                    escapeHTML(
                        campaign.audience ||
                        "Audience not defined"
                    )
                }

            </strong>

        </div>



        <div class="campaign-performance">


            <div class="performance-item">

                <span>
                    RECIPIENTS
                </span>

                <strong>
                    ${formatNumber(campaign.recipients)}
                </strong>

            </div>


            <div class="performance-item">

                <span>
                    DELIVERED
                </span>

                <strong>
                    ${formatNumber(campaign.delivered)}
                </strong>

            </div>


            <div class="performance-item">

                <span>
                    REPLIES
                </span>

                <strong>
                    ${formatNumber(campaign.replies)}
                </strong>

            </div>


            <div class="performance-item">

                <span>
                    LEADS
                </span>

                <strong>
                    ${formatNumber(campaign.conversions)}
                </strong>

            </div>


        </div>



        <div class="rate-section">


            <div class="rate-item">

                <span>
                    OPEN RATE · ${campaign.open_rate}%
                </span>

                <div class="rate-track">

                    <div
                        class="rate-fill open-rate"
                        style="width:${campaign.open_rate}%"
                    >
                    </div>

                </div>

            </div>


            <div class="rate-item">

                <span>
                    CLICK RATE · ${campaign.click_rate}%
                </span>

                <div class="rate-track">

                    <div
                        class="rate-fill click-rate"
                        style="width:${campaign.click_rate}%"
                    >
                    </div>

                </div>

            </div>


        </div>



        <div class="campaign-summary">

            <span>
                CAMPAIGN GOAL
            </span>

            <p>

                ${
                    escapeHTML(
                        campaign.goal ||
                        "No campaign goal has been documented yet."
                    )
                }

            </p>

        </div>



        <div class="campaign-actions">


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
                ${escapeHTML(getAdvanceLabel(campaign))}
            </button>


        </div>

    `;


    card
        .querySelector(
            '[data-action="edit"]'
        )
        ?.addEventListener(
            "click",
            () => {

                openDrawer(
                    campaign.id
                );

            }
        );


    card
        .querySelector(
            '[data-action="duplicate"]'
        )
        ?.addEventListener(
            "click",
            () => {

                duplicateCampaign(
                    campaign.id
                );

            }
        );


    card
        .querySelector(
            '[data-action="advance"]'
        )
        ?.addEventListener(
            "click",
            () => {

                advanceCampaign(
                    campaign.id
                );

            }
        );


    return card;

}


/* =========================================================
   EMPTY
   ========================================================= */

function renderEmptyState(
    container
) {

    const hasCampaigns =
        campaigns.length >
        0;


    container.innerHTML = `

        <div class="campaign-empty">

            <span>

                ${
                    hasCampaigns
                    ?
                    "NO MATCHING CAMPAIGNS"
                    :
                    "EMAIL WORKSPACE IS EMPTY"
                }

            </span>


            <h3>

                ${
                    hasCampaigns
                    ?
                    "Nothing matches those filters."
                    :
                    "Start planning the first campaign."
                }

            </h3>


            <p>

                ${
                    hasCampaigns
                    ?
                    "Try adjusting your search, campaign status, type, or owner."
                    :
                    "Campaign planning, audience strategy, send scheduling, and performance reporting will live here."
                }

            </p>


            ${
                !hasCampaigns

                ?

                `
                    <button
                        id="emptyAddCampaign"
                        type="button"
                    >
                        + CREATE CAMPAIGN
                    </button>
                `

                :

                ""
            }

        </div>

    `;


    document
        .getElementById(
            "emptyAddCampaign"
        )
        ?.addEventListener(
            "click",
            () => openDrawer()
        );

}


/* =========================================================
   ADVANCE STATUS
   ========================================================= */

function advanceCampaign(
    id
) {

    const campaign =
        getCampaignById(
            id
        );


    if (
        !campaign
    ) {

        return;

    }


    const nextStatus = {

        draft:
            "scheduled",

        scheduled:
            "active",

        active:
            "sent",

        sent:
            "archived",

        paused:
            "active",

        archived:
            "archived"

    };


    campaign.status =
        nextStatus[
            campaign.status
        ]
        ||
        campaign.status;


    campaign.updated_at =
        new Date()
            .toISOString();


    saveCampaigns();

    applyFilters();

}


/* =========================================================
   ADVANCE LABEL
   ========================================================= */

function getAdvanceLabel(
    campaign
) {

    const labels = {

        draft:
            "SCHEDULE",

        scheduled:
            "ACTIVATE",

        active:
            "MARK SENT",

        sent:
            "ARCHIVE",

        paused:
            "RESUME",

        archived:
            "ARCHIVED"

    };


    return (
        labels[
            campaign.status
        ]
        ||
        "UPDATE"
    );

}


/* =========================================================
   DUPLICATE
   ========================================================= */

function duplicateCampaign(
    id
) {

    const campaign =
        getCampaignById(
            id
        );


    if (
        !campaign
    ) {

        return;

    }


    const copy = {

        ...campaign,

        id:
            generateId(),

        name:
            `${campaign.name} Copy`,

        status:
            "draft",

        send_date:
            "",

        send_time:
            "",

        recipients:
            0,

        delivered:
            0,

        open_rate:
            0,

        click_rate:
            0,

        replies:
            0,

        conversions:
            0,

        created_at:
            new Date()
                .toISOString(),

        updated_at:
            new Date()
                .toISOString()

    };


    campaigns.push(
        copy
    );


    saveCampaigns();

    populateOwnerFilter();

    applyFilters();

}


/* =========================================================
   DRAWER
   ========================================================= */

function openDrawer(
    campaignId = null
) {

    resetForm();


    if (
        campaignId
    ) {

        loadCampaignIntoForm(
            campaignId
        );

    }


    const overlay =
        document.getElementById(
            "campaignOverlay"
        );


    const drawer =
        document.getElementById(
            "campaignDrawer"
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
            "campaignOverlay"
        );


    const drawer =
        document.getElementById(
            "campaignDrawer"
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
   RESET FORM
   ========================================================= */

function resetForm() {

    document
        .getElementById(
            "campaignForm"
        )
        ?.reset();


    setValue(
        "editingCampaignId",
        ""
    );


    setValue(
        "campaignType",
        "outreach"
    );


    setValue(
        "campaignStatus",
        "draft"
    );


    setValue(
        "campaignRecipients",
        "0"
    );


    setValue(
        "campaignDelivered",
        "0"
    );


    setValue(
        "campaignOpenRate",
        "0"
    );


    setValue(
        "campaignClickRate",
        "0"
    );


    setValue(
        "campaignReplies",
        "0"
    );


    setValue(
        "campaignConversions",
        "0"
    );


    setText(
        "drawerTitle",
        "New campaign"
    );


    setText(
        "saveCampaignLabel",
        "SAVE CAMPAIGN"
    );

}


/* =========================================================
   LOAD INTO FORM
   ========================================================= */

function loadCampaignIntoForm(
    id
) {

    const campaign =
        getCampaignById(
            id
        );


    if (
        !campaign
    ) {

        return;

    }


    setValue(
        "editingCampaignId",
        campaign.id
    );


    setValue(
        "campaignName",
        campaign.name
    );


    setValue(
        "campaignType",
        campaign.type
    );


    setValue(
        "campaignStatus",
        campaign.status
    );


    setValue(
        "campaignOwner",
        campaign.owner
    );


    setValue(
        "campaignAudience",
        campaign.audience
    );


    setValue(
        "campaignSubject",
        campaign.subject
    );


    setValue(
        "campaignPreviewText",
        campaign.preview_text
    );


    setValue(
        "campaignSendDate",
        campaign.send_date
    );


    setValue(
        "campaignSendTime",
        campaign.send_time
    );


    setValue(
        "campaignRecipients",
        campaign.recipients
    );


    setValue(
        "campaignDelivered",
        campaign.delivered
    );


    setValue(
        "campaignOpenRate",
        campaign.open_rate
    );


    setValue(
        "campaignClickRate",
        campaign.click_rate
    );


    setValue(
        "campaignReplies",
        campaign.replies
    );


    setValue(
        "campaignConversions",
        campaign.conversions
    );


    setValue(
        "campaignGoal",
        campaign.goal
    );


    setValue(
        "campaignBody",
        campaign.body_summary
    );


    setValue(
        "campaignCta",
        campaign.cta
    );


    setValue(
        "campaignNotes",
        campaign.notes
    );


    setText(
        "drawerTitle",
        "Edit campaign"
    );


    setText(
        "saveCampaignLabel",
        "UPDATE CAMPAIGN"
    );

}


/* =========================================================
   SAVE
   ========================================================= */

function saveCampaignFromForm(
    event
) {

    event.preventDefault();


    const name =
        getValue(
            "campaignName"
        );


    if (
        !name
    ) {

        return;

    }


    const editingId =
        getValue(
            "editingCampaignId"
        );


    const existing =
        editingId
        ?
        getCampaignById(
            editingId
        )
        :
        null;


    const record = {

        id:
            editingId ||
            generateId(),

        name,

        type:
            normalizeType(
                getValue(
                    "campaignType"
                )
            ),

        status:
            normalizeStatus(
                getValue(
                    "campaignStatus"
                )
            ),

        owner:
            getValue(
                "campaignOwner"
            ),

        audience:
            getValue(
                "campaignAudience"
            ),

        subject:
            getValue(
                "campaignSubject"
            ),

        preview_text:
            getValue(
                "campaignPreviewText"
            ),

        send_date:
            getValue(
                "campaignSendDate"
            ),

        send_time:
            getValue(
                "campaignSendTime"
            ),

        recipients:
            normalizeCount(
                getValue(
                    "campaignRecipients"
                )
            ),

        delivered:
            normalizeCount(
                getValue(
                    "campaignDelivered"
                )
            ),

        open_rate:
            clampPercent(
                getValue(
                    "campaignOpenRate"
                )
            ),

        click_rate:
            clampPercent(
                getValue(
                    "campaignClickRate"
                )
            ),

        replies:
            normalizeCount(
                getValue(
                    "campaignReplies"
                )
            ),

        conversions:
            normalizeCount(
                getValue(
                    "campaignConversions"
                )
            ),

        goal:
            getValue(
                "campaignGoal"
            ),

        body_summary:
            getValue(
                "campaignBody"
            ),

        cta:
            getValue(
                "campaignCta"
            ),

        notes:
            getValue(
                "campaignNotes"
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
            campaigns.findIndex(
                campaign =>
                    String(
                        campaign.id
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

            campaigns[index] =
                record;

        }

    }

    else {

        campaigns.push(
            record
        );

    }


    saveCampaigns();

    populateOwnerFilter();

    closeDrawer();

    applyFilters();

}


/* =========================================================
   STORAGE
   ========================================================= */

function saveCampaigns() {

    localStorage.setItem(
        CAMPAIGN_STORAGE_KEY,
        JSON.stringify(
            campaigns
        )
    );

}


/* =========================================================
   METRICS
   ========================================================= */

function updateMetrics() {

    const active =
        campaigns.filter(
            campaign =>
                campaign.status ===
                "active"
        );


    const scheduled =
        campaigns.filter(
            campaign =>
                campaign.status ===
                "scheduled"
        );


    const sent =
        campaigns.filter(
            campaign =>
                campaign.status ===
                "sent"
                ||
                campaign.status ===
                "archived"
        );


    const recipients =
        campaigns.reduce(
            (sum,campaign) =>
                sum +
                campaign.recipients,
            0
        );


    setText(
        "metricActive",
        active.length
    );


    setText(
        "metricScheduled",
        scheduled.length
    );


    setText(
        "metricOpenRate",
        `${averageMetric(sent,"open_rate")}%`
    );


    setText(
        "metricClickRate",
        `${averageMetric(sent,"click_rate")}%`
    );


    setText(
        "metricRecipients",
        formatNumber(
            recipients
        )
    );


    setText(
        "visibleCampaignCount",
        filteredCampaigns.length
    );

}


/* =========================================================
   AVERAGE
   ========================================================= */

function averageMetric(
    items,
    key
) {

    if (
        !items.length
    ) {

        return 0;

    }


    const result =
        items.reduce(
            (sum,item) =>
                sum +
                Number(
                    item[key] ||
                    0
                ),
            0
        )
        /
        items.length;


    return Math.round(
        result * 10
    )
    /
    10;

}


/* =========================================================
   NORMALIZE STATUS
   ========================================================= */

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

        "draft",

        "scheduled",

        "active",

        "sent",

        "paused",

        "archived"

    ];


    return valid.includes(
        status
    )
        ?
        status
        :
        "draft";

}


/* =========================================================
   NORMALIZE TYPE
   ========================================================= */

function normalizeType(
    value
) {

    const type =
        String(
            value ||
            ""
        )
            .toLowerCase();


    const valid = [

        "outreach",

        "nurture",

        "newsletter",

        "event",

        "follow-up",

        "announcement"

    ];


    return valid.includes(
        type
    )
        ?
        type
        :
        "outreach";

}


/* =========================================================
   FORMAT LABELS
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


function formatType(
    value
) {

    const labels = {

        outreach:
            "Outreach",

        nurture:
            "Nurture",

        newsletter:
            "Newsletter",

        event:
            "Event",

        "follow-up":
            "Follow-Up",

        announcement:
            "Announcement"

    };


    return (
        labels[
            value
        ]
        ||
        value
    );

}


/* =========================================================
   COUNTS / PERCENT
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
   FORMAT SEND DATE
   ========================================================= */

function formatSendDate(
    campaign
) {

    if (
        !campaign.send_date
    ) {

        return "NO SEND DATE";

    }


    let label =
        formatDate(
            campaign.send_date
        );


    if (
        campaign.send_time
    ) {

        const time =
            new Date(
                `2000-01-01T${campaign.send_time}`
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


        label +=
            ` · ${time}`;

    }


    return label;

}


/* =========================================================
   DATE
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
                    "numeric",

                year:
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
   NUMBER
   ========================================================= */

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
   LOOKUP
   ========================================================= */

function getCampaignById(
    id
) {

    return campaigns.find(
        campaign =>
            String(
                campaign.id
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
    campaign
) {

    return new Date(
        campaign.updated_at ||
        campaign.created_at ||
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
