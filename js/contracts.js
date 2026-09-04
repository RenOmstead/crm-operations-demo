/* =========================================================
   HELIX CRM
   GOVERNMENT CONTRACT MANAGEMENT
   ========================================================= */


/* =========================================================
   STATE
   ========================================================= */

let contracts = [];

let filteredContracts = [];


/* =========================================================
   STORAGE
   ========================================================= */

const CONTRACT_STORAGE_KEY =
    "helix_crm_contracts";


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeContracts
);


function initializeContracts() {

    loadContracts();

    bindControls();

    populateAgencyFilter();

    readURLParameters();

    applyFilters();

    updateMetrics();

}


/* =========================================================
   LOAD
   ========================================================= */

function loadContracts() {

    try {

        const stored =
            localStorage.getItem(
                CONTRACT_STORAGE_KEY
            );


        if (stored) {

            contracts =
                JSON.parse(
                    stored
                );

        }

        else {

            contracts =
                Array.isArray(
                    window.HELIX_DATA
                        ?.contracts
                )
                ?
                [...window.HELIX_DATA.contracts]
                :
                [];

        }

    }

    catch (error) {

        console.error(
            "Unable to load contracts:",
            error
        );


        contracts = [];

    }


    contracts =
        contracts.map(
            normalizeContract
        );

}


/* =========================================================
   NORMALIZE
   ========================================================= */

function normalizeContract(
    contract
) {

    return {

        id:
            contract.id ||
            generateId(),

        title:
            contract.title ||
            "",

        agency:
            contract.agency ||
            "",

        solicitation_number:
            contract.solicitation_number ||
            "",

        status:
            normalizeStatus(
                contract.status
            ),

        owner:
            contract.owner ||
            "",

        deadline:
            contract.deadline ||
            "",

        posted_date:
            contract.posted_date ||
            "",

        estimated_value:
            Math.max(
                0,
                Number(
                    contract.estimated_value ||
                    0
                )
            ),

        match_score:
            clampScore(
                contract.match_score
            ),

        naics:
            contract.naics ||
            "",

        set_aside:
            contract.set_aside ||
            "",

        vehicle:
            contract.vehicle ||
            "",

        source:
            contract.source ||
            "sam",

        source_url:
            contract.source_url ||
            "",

        next_action:
            contract.next_action ||
            "",

        summary:
            contract.summary ||
            "",

        fit:
            contract.fit ||
            "",

        risks:
            contract.risks ||
            "",

        notes:
            contract.notes ||
            "",

        created_at:
            contract.created_at ||
            new Date()
                .toISOString(),

        updated_at:
            contract.updated_at ||
            ""

    };

}


/* =========================================================
   CONTROLS
   ========================================================= */

function bindControls() {

    document
        .getElementById(
            "addContractButton"
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
            "cancelContractButton"
        )
        ?.addEventListener(
            "click",
            closeDrawer
        );


    document
        .getElementById(
            "contractOverlay"
        )
        ?.addEventListener(
            "click",
            closeDrawer
        );


    document
        .getElementById(
            "contractForm"
        )
        ?.addEventListener(
            "submit",
            saveContractFromForm
        );


    document
        .getElementById(
            "contractSearch"
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
                        "contractSearch"
                    );


                if (search) {

                    search.value =
                        event.target.value;

                }


                applyFilters();

            }
        );


    [
        "statusFilter",
        "agencyFilter",
        "deadlineFilter",
        "contractSort"
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
                        "contractSearch"
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


                if (menu) {

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


            menu.hidden = true;

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
            "contractSearch",
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

        const contract =
            getContractById(
                id
            );


        if (
            contract
        ) {

            setTimeout(
                () => openDrawer(
                    contract.id
                ),
                50
            );

        }

    }

}


/* =========================================================
   AGENCY FILTER
   ========================================================= */

function populateAgencyFilter() {

    const select =
        document.getElementById(
            "agencyFilter"
        );


    if (!select) {
        return;
    }


    while (
        select.options.length >
        1
    ) {

        select.remove(1);

    }


    const agencies =
        [
            ...new Set(
                contracts
                    .map(
                        contract =>
                            contract.agency
                                .trim()
                    )
                    .filter(Boolean)
            )
        ]
            .sort(
                (a,b) =>
                    a.localeCompare(b)
            );


    agencies.forEach(
        agency => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                agency;


            option.textContent =
                agency.toUpperCase();


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
            "contractSearch"
        )
            .toLowerCase();


    const status =
        getValue(
            "statusFilter"
        );


    const agency =
        getValue(
            "agencyFilter"
        );


    const deadlineFilter =
        getValue(
            "deadlineFilter"
        );


    const sort =
        getValue(
            "contractSort"
        )
        ||
        "deadline";


    filteredContracts =
        contracts.filter(
            contract => {

                const searchable =
                    [
                        contract.title,
                        contract.agency,
                        contract.solicitation_number,
                        contract.owner,
                        contract.naics,
                        contract.set_aside,
                        contract.vehicle,
                        contract.source,
                        contract.summary,
                        contract.fit,
                        contract.risks,
                        contract.notes,
                        contract.next_action
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
                    contract.status ===
                    status;


                const matchesAgency =
                    !agency ||
                    contract.agency ===
                    agency;


                const matchesDeadline =
                    matchesDeadlineFilter(
                        contract,
                        deadlineFilter
                    );


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesAgency &&
                    matchesDeadline
                );

            }
        );


    sortContracts(
        filteredContracts,
        sort
    );


    renderContracts();

    updateMetrics();

}


/* =========================================================
   DEADLINE FILTER
   ========================================================= */

function matchesDeadlineFilter(
    contract,
    filter
) {

    if (
        !filter
    ) {

        return true;

    }


    if (
        filter ===
        "none"
    ) {

        return (
            !contract.deadline
        );

    }


    if (
        !contract.deadline
    ) {

        return false;

    }


    const days =
        daysUntil(
            contract.deadline
        );


    if (
        filter ===
        "overdue"
    ) {

        return (
            days < 0
        );

    }


    const max =
        Number(
            filter
        );


    return (
        days >= 0 &&
        days <= max
    );

}


/* =========================================================
   SORT
   ========================================================= */

function sortContracts(
    list,
    sort
) {

    list.sort(
        (a,b) => {

            if (
                sort ===
                "match"
            ) {

                return (
                    b.match_score -
                    a.match_score
                );

            }


            if (
                sort ===
                "value"
            ) {

                return (
                    b.estimated_value -
                    a.estimated_value
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
                "agency"
            ) {

                return (
                    a.agency
                        .localeCompare(
                            b.agency
                        )
                );

            }


            return compareDates(
                a.deadline,
                b.deadline
            );

        }
    );

}


/* =========================================================
   RENDER
   ========================================================= */

function renderContracts() {

    const container =
        document.getElementById(
            "contractList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    setText(
        "visibleContractCount",
        filteredContracts.length
    );


    if (
        !filteredContracts.length
    ) {

        renderEmptyState(
            container
        );

        return;

    }


    const fragment =
        document.createDocumentFragment();


    filteredContracts.forEach(
        contract => {

            fragment.appendChild(
                createContractCard(
                    contract
                )
            );

        }
    );


    container.appendChild(
        fragment
    );

}


/* =========================================================
   CARD
   ========================================================= */

function createContractCard(
    contract
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "contract-card";


    const deadlineState =
        getDeadlineState(
            contract
        );


    const matchLevel =
        getMatchLevel(
            contract.match_score
        );


    card.innerHTML = `

        <div
            class="match-strip ${matchLevel}"
        >
        </div>



        <div class="contract-main">


            <div class="contract-topline">

                <span
                    class="contract-status ${escapeHTML(contract.status)}"
                >
                    ${escapeHTML(formatStatus(contract.status))}
                </span>

                <span class="contract-solicitation">

                    ${
                        escapeHTML(
                            contract.solicitation_number ||
                            "NO SOLICITATION #"
                        )
                    }

                </span>

            </div>


            <h3>

                ${
                    escapeHTML(
                        contract.title
                    )
                }

            </h3>


            <div class="contract-agency">

                ${
                    escapeHTML(
                        contract.agency ||
                        "Agency not recorded"
                    )
                }

            </div>


            <p class="contract-summary">

                ${
                    escapeHTML(
                        contract.summary ||
                        "No opportunity summary has been added yet."
                    )
                }

            </p>


        </div>



        <div class="contract-column deadline-column ${deadlineState.className}">

            <span>
                DEADLINE
            </span>

            <strong>

                ${
                    escapeHTML(
                        formatDate(
                            contract.deadline
                        )
                    )
                }

            </strong>

            ${
                deadlineState.label

                ?

                `
                    <div
                        class="deadline-tag ${deadlineState.className}"
                    >
                        ${escapeHTML(deadlineState.label)}
                    </div>
                `

                :

                ""
            }

        </div>



        <div class="contract-column">

            <span>
                MATCH SCORE
            </span>

            <strong
                class="match-score ${matchLevel}"
            >
                ${contract.match_score}%
            </strong>

            <small>
                ${escapeHTML(formatMatchLabel(matchLevel))}
            </small>

        </div>



        <div class="contract-column value-column">

            <span>
                EST. VALUE
            </span>

            <strong>
                ${formatCurrency(contract.estimated_value)}
            </strong>

            <small>
                ${escapeHTML(contract.vehicle || "Vehicle not recorded")}
            </small>

        </div>



        <div class="contract-column owner-column">

            <span>
                OWNER
            </span>

            <strong>

                ${
                    escapeHTML(
                        contract.owner ||
                        "Unassigned"
                    )
                }

            </strong>

            <small>

                ${
                    escapeHTML(
                        contract.set_aside ||
                        "Set-aside not recorded"
                    )
                }

            </small>

        </div>



        <div class="contract-column next-action-column">

            <span>
                NEXT ACTION
            </span>

            <p>

                ${
                    escapeHTML(
                        contract.next_action ||
                        "No next action recorded."
                    )
                }

            </p>

        </div>



        <div class="contract-actions">


            <button
                class="contract-action"
                type="button"
                data-action="edit"
            >
                EDIT
                <span>→</span>
            </button>


            <button
                class="contract-action"
                type="button"
                data-action="pursue"
            >
                PURSUE
                <span>✓</span>
            </button>


            <button
                class="contract-action"
                type="button"
                data-action="no-bid"
            >
                NO BID
                <span>×</span>
            </button>


            ${
                contract.source_url

                ?

                `
                    <button
                        class="contract-action"
                        type="button"
                        data-action="source"
                    >
                        SOURCE
                        <span>↗</span>
                    </button>
                `

                :

                ""
            }


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
                    contract.id
                );

            }
        );


    card
        .querySelector(
            '[data-action="pursue"]'
        )
        ?.addEventListener(
            "click",
            () => {

                updateContractStatus(
                    contract.id,
                    "pursue"
                );

            }
        );


    card
        .querySelector(
            '[data-action="no-bid"]'
        )
        ?.addEventListener(
            "click",
            () => {

                updateContractStatus(
                    contract.id,
                    "no-bid"
                );

            }
        );


    card
        .querySelector(
            '[data-action="source"]'
        )
        ?.addEventListener(
            "click",
            () => {

                openSource(
                    contract.source_url
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

    const hasContracts =
        contracts.length >
        0;


    container.innerHTML = `

        <div class="contract-empty">

            <span>

                ${
                    hasContracts
                    ?
                    "NO MATCHING OPPORTUNITIES"
                    :
                    "PROCUREMENT TRACKER IS EMPTY"
                }

            </span>


            <h3>

                ${
                    hasContracts
                    ?
                    "Nothing matches those filters."
                    :
                    "Start building the opportunity queue."
                }

            </h3>


            <p>

                ${
                    hasContracts

                    ?

                    "Try adjusting status, agency, deadline, or search."

                    :

                    "Government opportunities can be captured, qualified, scored, researched, and moved through bid/no-bid decisions here."

                }

            </p>


            ${
                !hasContracts

                ?

                `
                    <button
                        id="emptyAddContract"
                        type="button"
                    >
                        + ADD FIRST OPPORTUNITY
                    </button>
                `

                :

                ""
            }

        </div>

    `;


    document
        .getElementById(
            "emptyAddContract"
        )
        ?.addEventListener(
            "click",
            () => openDrawer()
        );

}


/* =========================================================
   OPEN DRAWER
   ========================================================= */

function openDrawer(
    contractId = null
) {

    resetForm();


    if (
        contractId
    ) {

        loadContractIntoForm(
            contractId
        );

    }


    const overlay =
        document.getElementById(
            "contractOverlay"
        );


    const drawer =
        document.getElementById(
            "contractDrawer"
        );


    if (overlay) {
        overlay.hidden = false;
    }


    if (drawer) {
        drawer.hidden = false;
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
            "contractOverlay"
        );


    const drawer =
        document.getElementById(
            "contractDrawer"
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

            if (overlay) {
                overlay.hidden = true;
            }


            if (drawer) {
                drawer.hidden = true;
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
            "contractForm"
        )
        ?.reset();


    setValue(
        "editingContractId",
        ""
    );


    setValue(
        "contractStatus",
        "researching"
    );


    setValue(
        "contractSource",
        "sam"
    );


    setValue(
        "contractMatchScore",
        "50"
    );


    setText(
        "drawerTitle",
        "Add opportunity"
    );


    setText(
        "saveContractLabel",
        "SAVE OPPORTUNITY"
    );

}


/* =========================================================
   LOAD FORM
   ========================================================= */

function loadContractIntoForm(
    contractId
) {

    const contract =
        getContractById(
            contractId
        );


    if (!contract) {
        return;
    }


    setValue(
        "editingContractId",
        contract.id
    );


    setValue(
        "contractTitle",
        contract.title
    );


    setValue(
        "contractAgency",
        contract.agency
    );


    setValue(
        "contractSolicitation",
        contract.solicitation_number
    );


    setValue(
        "contractStatus",
        contract.status
    );


    setValue(
        "contractOwner",
        contract.owner
    );


    setValue(
        "contractDeadline",
        contract.deadline
    );


    setValue(
        "contractPostedDate",
        contract.posted_date
    );


    setValue(
        "contractValue",
        contract.estimated_value
    );


    setValue(
        "contractMatchScore",
        contract.match_score
    );


    setValue(
        "contractNaics",
        contract.naics
    );


    setValue(
        "contractSetAside",
        contract.set_aside
    );


    setValue(
        "contractVehicle",
        contract.vehicle
    );


    setValue(
        "contractSource",
        contract.source
    );


    setValue(
        "contractSourceUrl",
        contract.source_url
    );


    setValue(
        "contractNextAction",
        contract.next_action
    );


    setValue(
        "contractSummary",
        contract.summary
    );


    setValue(
        "contractFit",
        contract.fit
    );


    setValue(
        "contractRisks",
        contract.risks
    );


    setValue(
        "contractNotes",
        contract.notes
    );


    setText(
        "drawerTitle",
        "Edit opportunity"
    );


    setText(
        "saveContractLabel",
        "UPDATE OPPORTUNITY"
    );

}


/* =========================================================
   SAVE FORM
   ========================================================= */

function saveContractFromForm(
    event
) {

    event.preventDefault();


    const title =
        getValue(
            "contractTitle"
        );


    if (
        !title
    ) {

        return;

    }


    const editingId =
        getValue(
            "editingContractId"
        );


    const existing =
        editingId
        ?
        getContractById(
            editingId
        )
        :
        null;


    const record = {

        id:
            editingId ||
            generateId(),

        title,

        agency:
            getValue(
                "contractAgency"
            ),

        solicitation_number:
            getValue(
                "contractSolicitation"
            ),

        status:
            normalizeStatus(
                getValue(
                    "contractStatus"
                )
            ),

        owner:
            getValue(
                "contractOwner"
            ),

        deadline:
            getValue(
                "contractDeadline"
            ),

        posted_date:
            getValue(
                "contractPostedDate"
            ),

        estimated_value:
            Math.max(
                0,
                Number(
                    getValue(
                        "contractValue"
                    )
                    ||
                    0
                )
            ),

        match_score:
            clampScore(
                getValue(
                    "contractMatchScore"
                )
            ),

        naics:
            getValue(
                "contractNaics"
            ),

        set_aside:
            getValue(
                "contractSetAside"
            ),

        vehicle:
            getValue(
                "contractVehicle"
            ),

        source:
            getValue(
                "contractSource"
            )
            ||
            "sam",

        source_url:
            getValue(
                "contractSourceUrl"
            ),

        next_action:
            getValue(
                "contractNextAction"
            ),

        summary:
            getValue(
                "contractSummary"
            ),

        fit:
            getValue(
                "contractFit"
            ),

        risks:
            getValue(
                "contractRisks"
            ),

        notes:
            getValue(
                "contractNotes"
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
            contracts.findIndex(
                contract =>
                    String(
                        contract.id
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

            contracts[index] =
                record;

        }

    }

    else {

        contracts.push(
            record
        );

    }


    saveContracts();

    populateAgencyFilter();

    closeDrawer();

    applyFilters();

}


/* =========================================================
   STATUS CHANGE
   ========================================================= */

function updateContractStatus(
    contractId,
    status
) {

    const contract =
        getContractById(
            contractId
        );


    if (!contract) {
        return;
    }


    contract.status =
        normalizeStatus(
            status
        );


    contract.updated_at =
        new Date()
            .toISOString();


    saveContracts();

    applyFilters();

}


/* =========================================================
   SOURCE
   ========================================================= */

function openSource(
    value
) {

    if (
        !value
    ) {

        return;

    }


    let url =
        value.trim();


    if (
        !/^https?:\/\//i.test(
            url
        )
    ) {

        url =
            `https://${url}`;

    }


    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}


/* =========================================================
   STORAGE
   ========================================================= */

function saveContracts() {

    localStorage.setItem(
        CONTRACT_STORAGE_KEY,
        JSON.stringify(
            contracts
        )
    );

}


/* =========================================================
   METRICS
   ========================================================= */

function updateMetrics() {

    setText(
        "metricTracked",
        contracts.length
    );


    setText(
        "metricPursue",

        contracts.filter(
            contract =>
                contract.status ===
                "pursue"
        ).length

    );


    setText(
        "metricDeadlines",

        contracts.filter(
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
        ).length

    );


    setText(
        "metricHighFit",

        contracts.filter(
            contract =>
                contract.match_score >=
                80
        ).length

    );


    const totalValue =
        contracts
            .filter(
                contract =>
                    contract.status !==
                    "no-bid"
                    &&
                    contract.status !==
                    "lost"
            )
            .reduce(
                (sum,contract) =>
                    sum +
                    contract.estimated_value,
                0
            );


    setText(
        "metricValue",
        formatCurrency(
            totalValue
        )
    );


    setText(
        "visibleContractCount",
        filteredContracts.length
    );

}


/* =========================================================
   DEADLINE STATE
   ========================================================= */

function getDeadlineState(
    contract
) {

    if (
        !contract.deadline
    ) {

        return {

            className:
                "",

            label:
                ""

        };

    }


    const days =
        daysUntil(
            contract.deadline
        );


    if (
        days < 0
    ) {

        return {

            className:
                "overdue",

            label:
                `${Math.abs(days)} DAYS OVERDUE`

        };

    }


    if (
        days ===
        0
    ) {

        return {

            className:
                "due",

            label:
                "DUE TODAY"

        };

    }


    if (
        days <=
        7
    ) {

        return {

            className:
                "due",

            label:
                `${days} DAYS LEFT`

        };

    }


    return {

        className:
            "",

        label:
            `${days} DAYS`

    };

}


/* =========================================================
   MATCH LEVEL
   ========================================================= */

function getMatchLevel(
    score
) {

    if (
        score >=
        80
    ) {

        return "high";

    }


    if (
        score >=
        55
    ) {

        return "medium";

    }


    return "low";

}


function formatMatchLabel(
    level
) {

    const labels = {

        high:
            "Strong fit",

        medium:
            "Worth reviewing",

        low:
            "Limited fit"

    };


    return labels[level];

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

        "researching",
        "review",
        "pursue",
        "no-bid",
        "submitted",
        "awarded",
        "lost"

    ];


    return valid.includes(
        value
    )
        ?
        value
        :
        "researching";

}


function formatStatus(
    status
) {

    const labels = {

        researching:
            "Researching",

        review:
            "Review",

        pursue:
            "Pursue",

        "no-bid":
            "No Bid",

        submitted:
            "Submitted",

        awarded:
            "Awarded",

        lost:
            "Lost"

    };


    return (
        labels[status]
        ||
        status
    );

}


/* =========================================================
   SCORE
   ========================================================= */

function clampScore(
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

        return 50;

    }


    return Math.min(
        100,
        Math.max(
            0,
            Math.round(number)
        )
    );

}


/* =========================================================
   LOOKUP
   ========================================================= */

function getContractById(
    id
) {

    return contracts.find(
        contract =>
            String(
                contract.id
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
   DATE
   ========================================================= */

function todayISO() {

    const date =
        new Date();


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


function formatDate(
    date
) {

    if (!date) {
        return "—";
    }


    return new Date(
        `${date}T12:00:00`
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


    if (!a) {
        return 1;
    }


    if (!b) {
        return -1;
    }


    return a.localeCompare(
        b
    );

}


/* =========================================================
   CURRENCY
   ========================================================= */

function formatCurrency(
    value
) {

    const number =
        Number(
            value ||
            0
        );


    return new Intl.NumberFormat(
        "en-US",
        {
            style:
                "currency",

            currency:
                "USD",

            notation:
                number >=
                1000000
                ?
                "compact"
                :
                "standard",

            maximumFractionDigits:
                number >=
                1000000
                ?
                1
                :
                0
        }
    )
        .format(
            number
        );

}


/* =========================================================
   UPDATED
   ========================================================= */

function getUpdatedTimestamp(
    contract
) {

    return new Date(
        contract.updated_at ||
        contract.created_at ||
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


    if (element) {

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


    if (element) {

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
   ESCAPE HTML
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
