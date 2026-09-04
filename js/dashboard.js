/* =========================================================
   HELIX CRM
   DASHBOARD
   ========================================================= */


/* =========================================================
   STATE
   ========================================================= */

let data = null;


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);


function initializeDashboard() {

    data =
        window.HELIX_DATA ||
        createEmptyData();


    bindControls();

    renderDate();

    renderMetrics();

    renderPriorities();

    renderPipeline();

    renderFollowUps();

    renderContracts();

    renderEvents();

    renderMarketing();

    renderSEO();

    renderActivity();

}


/* =========================================================
   FALLBACK DATA
   ========================================================= */

function createEmptyData() {

    return {

        customers: [],

        contacts: [],

        opportunities: [],

        contracts: [],

        tasks: [],

        campaigns: [],

        socialPosts: [],

        socialAnalytics: {

            impressions: 0,

            engagementRate: 0

        },

        seo: {

            score: 0,

            keywords: []

        },

        tradeshows: [],

        activities: []

    };

}


/* =========================================================
   CONTROLS
   ========================================================= */

function bindControls() {

    const quickCreateButton =
        document.getElementById(
            "quickCreateButton"
        );


    const menu =
        document.getElementById(
            "quickCreateMenu"
        );


    quickCreateButton
        ?.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                if (!menu) {
                    return;
                }


                menu.hidden =
                    !menu.hidden;

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


    document
        .getElementById(
            "globalSearch"
        )
        ?.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    handleGlobalSearch(
                        event.target.value
                    );

                }

            }
        );


    document.addEventListener(
        "keydown",
        event => {

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
            ) {

                event.preventDefault();


                document
                    .getElementById(
                        "globalSearch"
                    )
                    ?.focus();

            }

        }
    );

}


/* =========================================================
   DATE
   ========================================================= */

function renderDate() {

    const today =
        new Date();


    setText(
        "currentDate",

        today.toLocaleDateString(
            "en-US",
            {
                weekday:
                    "long",

                month:
                    "long",

                day:
                    "numeric"
            }
        )

    );

}


/* =========================================================
   METRICS
   ========================================================= */

function renderMetrics() {

    const openOpportunities =
        data.opportunities.filter(
            opportunity =>
                opportunity.stage !==
                "won"
                &&
                opportunity.stage !==
                "lost"
        );


    const pipelineValue =
        openOpportunities.reduce(
            (total,opportunity) =>
                total +
                Number(
                    opportunity.value ||
                    0
                ),
            0
        );


    const weightedValue =
        openOpportunities.reduce(
            (total,opportunity) => {

                const value =
                    Number(
                        opportunity.value ||
                        0
                    );


                const probability =
                    Number(
                        opportunity.probability ||
                        0
                    );


                return (
                    total +
                    (
                        value *
                        probability /
                        100
                    )
                );

            },
            0
        );


    const today =
        todayISO();


    const dueTasks =
        data.tasks.filter(
            task =>
                !task.completed
                &&
                task.due_date
                &&
                task.due_date <=
                today
        );


    const followUps =
        data.contacts.filter(
            contact =>
                contact.follow_up_date
                &&
                contact.follow_up_date <=
                today
        );


    const contractsDue =
        data.contracts.filter(
            contract => {

                if (
                    !contract.deadline
                ) {

                    return false;

                }


                const days =
                    daysUntil(
                        contract.deadline
                    );


                return (
                    days >= 0 &&
                    days <= 30
                );

            }
        );


    setText(
        "pipelineValue",
        formatCurrency(
            pipelineValue
        )
    );


    setText(
        "weightedValue",
        formatCurrency(
            weightedValue
        )
    );


    setText(
        "tasksDue",
        dueTasks.length
    );


    setText(
        "followUpsDue",
        followUps.length
    );


    setText(
        "contractDeadlines",
        contractsDue.length
    );

}


/* =========================================================
   PRIORITIES
   ========================================================= */

function renderPriorities() {

    const container =
        document.getElementById(
            "priorityList"
        );


    if (!container) {
        return;
    }


    const items =
        data.tasks
            .filter(
                task =>
                    !task.completed
            )
            .sort(
                comparePriorityTasks
            )
            .slice(
                0,
                5
            );


    if (
        !items.length
    ) {

        renderEmpty(
            container,
            "No priority actions yet.",
            "Mock task data will populate this workspace."
        );


        return;

    }


    container.innerHTML = "";


    items.forEach(
        (
            task,
            index
        ) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "priority-item";


            item.innerHTML = `

                <div class="priority-index">

                    ${
                        String(
                            index + 1
                        )
                            .padStart(
                                2,
                                "0"
                            )
                    }

                </div>


                <div class="priority-copy">

                    <strong>
                        ${escapeHTML(task.title)}
                    </strong>

                    <span>
                        ${escapeHTML(task.description || "")}
                    </span>

                </div>


                <span class="priority-state">
                    ${escapeHTML((task.priority || "normal").toUpperCase())}
                </span>

            `;


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   PIPELINE
   ========================================================= */

function renderPipeline() {

    const container =
        document.getElementById(
            "pipelineStageList"
        );


    if (!container) {
        return;
    }


    const stages = [

        "qualified",

        "discovery",

        "proposal",

        "negotiation"

    ];


    const active =
        data.opportunities.filter(
            opportunity =>
                opportunity.stage !==
                "won"
                &&
                opportunity.stage !==
                "lost"
        );


    if (
        !active.length
    ) {

        renderEmpty(
            container,
            "No pipeline data yet.",
            "Opportunities will appear here once mock CRM data is added."
        );


        setText(
            "openOpportunityCount",
            "0"
        );


        setText(
            "averageProbability",
            "0%"
        );


        return;

    }


    const totalValue =
        active.reduce(
            (sum,item) =>
                sum +
                Number(
                    item.value ||
                    0
                ),
            0
        );


    container.innerHTML = "";


    stages.forEach(
        stage => {

            const stageItems =
                active.filter(
                    opportunity =>
                        opportunity.stage ===
                        stage
                );


            const value =
                stageItems.reduce(
                    (sum,item) =>
                        sum +
                            Number(
                                item.value ||
                                0
                            ),
                    0
                );


            const width =
                totalValue > 0
                ?
                Math.max(
                    3,
                    (
                        value /
                        totalValue
                    ) *
                    100
                )
                :
                0;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "pipeline-stage";


            row.innerHTML = `

                <div class="pipeline-stage-head">

                    <span>
                        ${escapeHTML(stage.toUpperCase())}
                    </span>

                    <strong>
                        ${formatCurrency(value)}
                    </strong>

                </div>


                <div class="pipeline-bar">

                    <div
                        class="pipeline-fill"
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


    const averageProbability =
        active.length
        ?
        Math.round(
            active.reduce(
                (sum,item) =>
                    sum +
                    Number(
                        item.probability ||
                        0
                    ),
                0
            )
            /
            active.length
        )
        :
        0;


    setText(
        "openOpportunityCount",
        active.length
    );


    setText(
        "averageProbability",
        `${averageProbability}%`
    );

}


/* =========================================================
   FOLLOW UPS
   ========================================================= */

function renderFollowUps() {

    const container =
        document.getElementById(
            "followUpList"
        );


    if (!container) {
        return;
    }


    const contacts =
        data.contacts
            .filter(
                contact =>
                    contact.follow_up_date
            )
            .sort(
                (a,b) =>
                    a.follow_up_date
                        .localeCompare(
                            b.follow_up_date
                        )
            )
            .slice(
                0,
                3
            );


    if (
        !contacts.length
    ) {

        renderEmpty(
            container,
            "No follow-ups scheduled.",
            "Contact reminders will appear here."
        );


        return;

    }


    container.innerHTML = "";


    contacts.forEach(
        contact => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "compact-item";


            item.innerHTML = `

                <div class="compact-copy">

                    <strong>
                        ${escapeHTML(contact.name)}
                    </strong>

                    <span>
                        ${escapeHTML(contact.company || "")}
                    </span>

                </div>


                <div class="compact-meta">

                    <strong>
                        ${escapeHTML(formatShortDate(contact.follow_up_date))}
                    </strong>

                    <span>
                        FOLLOW-UP
                    </span>

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   CONTRACTS
   ========================================================= */

function renderContracts() {

    const container =
        document.getElementById(
            "contractList"
        );


    if (!container) {
        return;
    }


    const contracts =
        data.contracts
            .filter(
                contract =>
                    contract.deadline
            )
            .sort(
                (a,b) =>
                    a.deadline
                        .localeCompare(
                            b.deadline
                        )
            )
            .slice(
                0,
                3
            );


    if (
        !contracts.length
    ) {

        renderEmpty(
            container,
            "No tracked deadlines.",
            "Government opportunities will appear here."
        );


        return;

    }


    container.innerHTML = "";


    contracts.forEach(
        contract => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "compact-item";


            item.innerHTML = `

                <div class="compact-copy">

                    <strong>
                        ${escapeHTML(contract.title)}
                    </strong>

                    <span>
                        ${escapeHTML(contract.agency || "")}
                    </span>

                </div>


                <div class="compact-meta">

                    <strong>
                        ${escapeHTML(formatShortDate(contract.deadline))}
                    </strong>

                    <span>
                        DEADLINE
                    </span>

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   EVENTS
   ========================================================= */

function renderEvents() {

    const container =
        document.getElementById(
            "eventList"
        );


    if (!container) {
        return;
    }


    const events =
        data.tradeshows
            .filter(
                event =>
                    event.start_date
            )
            .sort(
                (a,b) =>
                    a.start_date
                        .localeCompare(
                            b.start_date
                        )
            )
            .slice(
                0,
                3
            );


    if (
        !events.length
    ) {

        renderEmpty(
            container,
            "No events scheduled.",
            "Upcoming tradeshows will appear here."
        );


        return;

    }


    container.innerHTML = "";


    events.forEach(
        event => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "compact-item";


            item.innerHTML = `

                <div class="compact-copy">

                    <strong>
                        ${escapeHTML(event.name)}
                    </strong>

                    <span>
                        ${escapeHTML(event.location || "")}
                    </span>

                </div>


                <div class="compact-meta">

                    <strong>
                        ${escapeHTML(formatShortDate(event.start_date))}
                    </strong>

                    <span>
                        EVENT
                    </span>

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   MARKETING
   ========================================================= */

function renderMarketing() {

    const activeCampaigns =
        data.campaigns.filter(
            campaign =>
                campaign.status ===
                "active"
        );


    setText(
        "activeCampaigns",
        activeCampaigns.length
    );


    setText(
        "emailOpenRate",
        `${averageValue(
            data.campaigns,
            "open_rate"
        )}%`
    );


    setText(
        "emailClickRate",
        `${averageValue(
            data.campaigns,
            "click_rate"
        )}%`
    );


    setText(
        "socialImpressions",
        formatCompactNumber(
            data.socialAnalytics
                ?.impressions ||
            0
        )
    );


    setText(
        "socialEngagement",
        `${
            Number(
                data.socialAnalytics
                    ?.engagementRate ||
                0
            )
        }%`
    );


    setText(
        "socialPostCount",
        data.socialPosts.length
    );

}


/* =========================================================
   SEO
   ========================================================= */

function renderSEO() {

    setText(
        "seoScore",
        Number(
            data.seo
                ?.score ||
            0
        )
    );

}


/* =========================================================
   ACTIVITY
   ========================================================= */

function renderActivity() {

    const container =
        document.getElementById(
            "activityList"
        );


    if (!container) {
        return;
    }


    const activities =
        data.activities
            .slice(
                0,
                6
            );


    if (
        !activities.length
    ) {

        renderEmpty(
            container,
            "No recent activity.",
            "CRM actions will appear here as the mock environment is populated."
        );


        return;

    }


    container.innerHTML = "";


    activities.forEach(
        activity => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "activity-item";


            row.innerHTML = `

                <div class="activity-time">

                    ${escapeHTML(activity.time || "")}

                </div>


                <div class="activity-copy">

                    ${escapeHTML(activity.description || "")}

                </div>


                <div class="activity-type">

                    ${escapeHTML((activity.type || "ACTIVITY").toUpperCase())}

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   GLOBAL SEARCH
   ========================================================= */

function handleGlobalSearch(
    query
) {

    const value =
        String(
            query ||
            ""
        )
            .trim();


    if (!value) {
        return;
    }


    /*
       When we build the shared data/search layer,
       this will become a real cross-CRM search.

       For now it routes to customers.
    */

    window.location.href =
        `customers.html?search=${
            encodeURIComponent(
                value
            )
        }`;

}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function renderEmpty(
    container,
    title,
    description
) {

    container.innerHTML = `

        <div class="empty-state">

            <strong>
                ${escapeHTML(title)}
            </strong>

            <span>
                ${escapeHTML(description)}
            </span>

        </div>

    `;

}


/* =========================================================
   HELPERS
   ========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


function todayISO() {

    const now =
        new Date();


    return [
        now.getFullYear(),

        String(
            now.getMonth() + 1
        )
            .padStart(
                2,
                "0"
            ),

        String(
            now.getDate()
        )
            .padStart(
                2,
                "0"
            )
    ]
        .join("-");

}


function daysUntil(
    isoDate
) {

    const today =
        new Date(
            `${todayISO()}T12:00:00`
        );


    const target =
        new Date(
            `${isoDate}T12:00:00`
        );


    return Math.ceil(
        (
            target -
            today
        )
        /
        86400000
    );

}


function formatCurrency(
    value
) {

    return new Intl.NumberFormat(
        "en-US",
        {
            style:
                "currency",

            currency:
                "USD",

            maximumFractionDigits:
                0
        }
    )
        .format(
            Number(
                value ||
                0
            )
        );

}


function formatCompactNumber(
    value
) {

    return new Intl.NumberFormat(
        "en-US",
        {
            notation:
                "compact",

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


function formatShortDate(
    isoDate
) {

    if (!isoDate) {
        return "—";
    }


    return new Date(
        `${isoDate}T12:00:00`
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


function averageValue(
    items,
    key
) {

    if (
        !items.length
    ) {

        return 0;

    }


    const values =
        items
            .map(
                item =>
                    Number(
                        item[key] ||
                        0
                    )
            );


    return Math.round(
        (
            values.reduce(
                (sum,value) =>
                    sum +
                    value,
                0
            )
            /
            values.length
        )
        *
        10
    )
    /
    10;

}


function comparePriorityTasks(
    a,
    b
) {

    const order = {

        urgent: 0,

        high: 1,

        normal: 2,

        low: 3

    };


    const priorityDifference =
        (
            order[
                a.priority
            ]
            ??
            99
        )
        -
        (
            order[
                b.priority
            ]
            ??
            99
        );


    if (
        priorityDifference !==
        0
    ) {

        return priorityDifference;

    }


    return String(
        a.due_date ||
        "9999-12-31"
    )
        .localeCompare(
            String(
                b.due_date ||
                "9999-12-31"
            )
        );

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
