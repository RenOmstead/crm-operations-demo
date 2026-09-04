/* =========================================================
   HELIX CRM
   OPPORTUNITY PIPELINE
   ========================================================= */


/* =========================================================
   STATE
   ========================================================= */

let opportunities = [];

let customers = [];

let contacts = [];

let filteredOpportunities = [];


/* =========================================================
   STORAGE
   ========================================================= */

const OPPORTUNITY_STORAGE_KEY =
    "helix_crm_opportunities";

const CUSTOMER_STORAGE_KEY =
    "helix_crm_customers";

const CONTACT_STORAGE_KEY =
    "helix_crm_contacts";


/* =========================================================
   STAGES
   ========================================================= */

const OPEN_STAGES = [
    "qualified",
    "discovery",
    "proposal",
    "negotiation"
];


const ALL_STAGES = [
    ...OPEN_STAGES,
    "won",
    "lost"
];


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializePipeline
);


function initializePipeline() {

    loadCustomers();

    loadContacts();

    loadOpportunities();

    bindControls();

    populateCustomerSelect();

    populateCustomerFilter();

    populateOwnerFilter();

    readURLParameters();

    applyFilters();

    updateMetrics();

}


/* =========================================================
   LOAD CUSTOMERS
   ========================================================= */

function loadCustomers() {

    try {

        const stored =
            localStorage.getItem(
                CUSTOMER_STORAGE_KEY
            );


        if (stored) {

            customers =
                JSON.parse(
                    stored
                );

        }

        else {

            customers =
                Array.isArray(
                    window.HELIX_DATA
                        ?.customers
                )
                ?
                [...window.HELIX_DATA.customers]
                :
                [];

        }

    }

    catch {

        customers = [];

    }

}


/* =========================================================
   LOAD CONTACTS
   ========================================================= */

function loadContacts() {

    try {

        const stored =
            localStorage.getItem(
                CONTACT_STORAGE_KEY
            );


        if (stored) {

            contacts =
                JSON.parse(
                    stored
                );

        }

        else {

            contacts =
                Array.isArray(
                    window.HELIX_DATA
                        ?.contacts
                )
                ?
                [...window.HELIX_DATA.contacts]
                :
                [];

        }

    }

    catch {

        contacts = [];

    }

}


/* =========================================================
   LOAD OPPORTUNITIES
   ========================================================= */

function loadOpportunities() {

    try {

        const stored =
            localStorage.getItem(
                OPPORTUNITY_STORAGE_KEY
            );


        if (stored) {

            opportunities =
                JSON.parse(
                    stored
                );

        }

        else {

            opportunities =
                Array.isArray(
                    window.HELIX_DATA
                        ?.opportunities
                )
                ?
                [...window.HELIX_DATA.opportunities]
                :
                [];

        }

    }

    catch (error) {

        console.error(
            "Unable to load opportunities:",
            error
        );


        opportunities = [];

    }


    opportunities =
        opportunities.map(
            normalizeOpportunity
        );

}


/* =========================================================
   NORMALIZE
   ========================================================= */

function normalizeOpportunity(
    opportunity
) {

    return {

        id:
            opportunity.id ||
            generateId(),

        name:
            opportunity.name ||
            "",

        customer_id:
            opportunity.customer_id ||
            "",

        contact_id:
            opportunity.contact_id ||
            "",

        stage:
            normalizeStage(
                opportunity.stage
            ),

        owner:
            opportunity.owner ||
            "",

        value:
            Math.max(
                0,
                Number(
                    opportunity.value ||
                    0
                )
            ),

        probability:
            clampProbability(
                opportunity.probability
            ),

        close_date:
            opportunity.close_date ||
            "",

        priority:
            opportunity.priority ||
            "normal",

        next_step:
            opportunity.next_step ||
            "",

        description:
            opportunity.description ||
            "",

        notes:
            opportunity.notes ||
            "",

        created_at:
            opportunity.created_at ||
            new Date()
                .toISOString(),

        updated_at:
            opportunity.updated_at ||
            ""

    };

}


/* =========================================================
   CONTROLS
   ========================================================= */

function bindControls() {

    document
        .getElementById(
            "addOpportunityButton"
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
            "cancelOpportunityButton"
        )
        ?.addEventListener(
            "click",
            closeDrawer
        );


    document
        .getElementById(
            "opportunityOverlay"
        )
        ?.addEventListener(
            "click",
            closeDrawer
        );


    document
        .getElementById(
            "opportunityForm"
        )
        ?.addEventListener(
            "submit",
            saveOpportunityFromForm
        );


    document
        .getElementById(
            "opportunityCustomer"
        )
        ?.addEventListener(
            "change",
            populateContactSelect
        );


    document
        .getElementById(
            "opportunityStage"
        )
        ?.addEventListener(
            "change",
            applySuggestedProbability
        );


    document
        .getElementById(
            "pipelineSearch"
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
                        "pipelineSearch"
                    );


                if (search) {

                    search.value =
                        event.target.value;

                }


                applyFilters();

            }
        );


    [
        "customerFilter",
        "ownerFilter",
        "statusFilter",
        "pipelineSort"
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
                        "pipelineSearch"
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


    const customerId =
        params.get(
            "customer"
        );


    const contactId =
        params.get(
            "contact"
        );


    const opportunityId =
        params.get(
            "id"
        );


    const search =
        params.get(
            "search"
        );


    if (
        customerId
    ) {

        setValue(
            "customerFilter",
            customerId
        );

    }


    if (
        contactId
    ) {

        const contact =
            getContactById(
                contactId
            );


        if (
            contact?.customer_id
        ) {

            setValue(
                "customerFilter",
                contact.customer_id
            );

        }

    }


    if (
        search
    ) {

        setValue(
            "pipelineSearch",
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
            () => {

                openDrawer(
                    null,
                    customerId,
                    contactId
                );

            },
            50
        );

    }


    if (
        opportunityId
    ) {

        const opportunity =
            getOpportunityById(
                opportunityId
            );


        if (
            opportunity
        ) {

            setTimeout(
                () => {

                    openDrawer(
                        opportunity.id
                    );

                },
                50
            );

        }

    }

}


/* =========================================================
   CUSTOMER SELECT
   ========================================================= */

function populateCustomerSelect() {

    const select =
        document.getElementById(
            "opportunityCustomer"
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


    [...customers]
        .sort(
            (a,b) =>
                String(
                    a.company_name
                )
                    .localeCompare(
                        String(
                            b.company_name
                        )
                    )
        )
        .forEach(
            customer => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    customer.id;


                option.textContent =
                    customer.company_name;


                select.appendChild(
                    option
                );

            }
        );

}


/* =========================================================
   CONTACT SELECT
   ========================================================= */

function populateContactSelect(
    selectedContactId = null
) {

    const select =
        document.getElementById(
            "opportunityContact"
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


    const customerId =
        getValue(
            "opportunityCustomer"
        );


    if (
        !customerId
    ) {

        return;

    }


    contacts
        .filter(
            contact =>
                String(
                    contact.customer_id
                )
                ===
                String(
                    customerId
                )
        )
        .sort(
            (a,b) =>
                getContactName(a)
                    .localeCompare(
                        getContactName(b)
                    )
        )
        .forEach(
            contact => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    contact.id;


                option.textContent =
                    getContactName(
                        contact
                    );


                select.appendChild(
                    option
                );

            }
        );


    if (
        selectedContactId
    ) {

        setValue(
            "opportunityContact",
            selectedContactId
        );

    }

}


/* =========================================================
   CUSTOMER FILTER
   ========================================================= */

function populateCustomerFilter() {

    const select =
        document.getElementById(
            "customerFilter"
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


    [...customers]
        .sort(
            (a,b) =>
                String(
                    a.company_name
                )
                    .localeCompare(
                        String(
                            b.company_name
                        )
                    )
        )
        .forEach(
            customer => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    customer.id;


                option.textContent =
                    customer.company_name
                        .toUpperCase();


                select.appendChild(
                    option
                );

            }
        );

}


/* =========================================================
   OWNER FILTER
   ========================================================= */

function populateOwnerFilter() {

    const select =
        document.getElementById(
            "ownerFilter"
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


    const owners =
        [
            ...new Set(
                opportunities
                    .map(
                        item =>
                            String(
                                item.owner ||
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
            "pipelineSearch"
        )
            .toLowerCase();


    const customer =
        getValue(
            "customerFilter"
        );


    const owner =
        getValue(
            "ownerFilter"
        );


    const status =
        getValue(
            "statusFilter"
        );


    const sort =
        getValue(
            "pipelineSort"
        )
        ||
        "value";


    filteredOpportunities =
        opportunities.filter(
            opportunity => {

                const customerRecord =
                    getCustomerById(
                        opportunity.customer_id
                    );


                const contactRecord =
                    getContactById(
                        opportunity.contact_id
                    );


                const searchable =
                    [
                        opportunity.name,
                        opportunity.owner,
                        opportunity.next_step,
                        opportunity.description,
                        opportunity.notes,
                        customerRecord?.company_name,
                        contactRecord
                            ?
                            getContactName(
                                contactRecord
                            )
                            :
                            ""
                    ]
                        .join(" ")
                        .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchable.includes(
                        search
                    );


                const matchesCustomer =
                    !customer ||
                    String(
                        opportunity.customer_id
                    )
                    ===
                    String(
                        customer
                    );


                const matchesOwner =
                    !owner ||
                    opportunity.owner ===
                    owner;


                let matchesStatus =
                    true;


                if (
                    status ===
                    "open"
                ) {

                    matchesStatus =
                        OPEN_STAGES.includes(
                            opportunity.stage
                        );

                }


                if (
                    status ===
                    "won"
                ) {

                    matchesStatus =
                        opportunity.stage ===
                        "won";

                }


                if (
                    status ===
                    "lost"
                ) {

                    matchesStatus =
                        opportunity.stage ===
                        "lost";

                }


                return (
                    matchesSearch &&
                    matchesCustomer &&
                    matchesOwner &&
                    matchesStatus
                );

            }
        );


    sortOpportunities(
        filteredOpportunities,
        sort
    );


    renderPipeline();

    renderClosed();

    updateMetrics();

}


/* =========================================================
   SORT
   ========================================================= */

function sortOpportunities(
    list,
    sort
) {

    list.sort(
        (a,b) => {

            if (
                sort ===
                "probability"
            ) {

                return (
                    b.probability -
                    a.probability
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
                "company"
            ) {

                return (
                    getCustomerName(a)
                        .localeCompare(
                            getCustomerName(b)
                        )
                );

            }


            if (
                sort ===
                "close-date"
            ) {

                return compareDates(
                    a.close_date,
                    b.close_date
                );

            }


            return (
                b.value -
                a.value
            );

        }
    );

}


/* =========================================================
   RENDER PIPELINE
   ========================================================= */

function renderPipeline() {

    OPEN_STAGES.forEach(
        stage => {

            const items =
                filteredOpportunities.filter(
                    opportunity =>
                        opportunity.stage ===
                        stage
                );


            const list =
                document.getElementById(
                    `${stage}List`
                );


            if (!list) {
                return;
            }


            list.innerHTML = "";


            const totalValue =
                items.reduce(
                    (sum,item) =>
                        sum +
                        item.value,
                    0
                );


            setText(
                `${stage}Count`,
                items.length
            );


            setText(
                `${stage}Value`,
                formatCurrency(
                    totalValue
                )
            );


            if (
                !items.length
            ) {

                list.innerHTML = `

                    <div class="column-empty">

                        No opportunities in this stage.

                    </div>

                `;


                return;

            }


            items.forEach(
                opportunity => {

                    list.appendChild(
                        createOpportunityCard(
                            opportunity
                        )
                    );

                }
            );

        }
    );


    setText(
        "visibleOpportunityCount",
        filteredOpportunities.length
    );

}


/* =========================================================
   OPPORTUNITY CARD
   ========================================================= */

function createOpportunityCard(
    opportunity
) {

    const customer =
        getCustomerById(
            opportunity.customer_id
        );


    const contact =
        getContactById(
            opportunity.contact_id
        );


    const card =
        document.createElement(
            "article"
        );


    card.className =
        `opportunity-card priority-${escapeHTML(opportunity.priority)}`;


    card.innerHTML = `

        <div class="opportunity-card-top">

            <span class="opportunity-company">

                ${
                    escapeHTML(
                        customer?.company_name ||
                        "No customer"
                    )
                }

            </span>


            <h3>

                ${
                    escapeHTML(
                        opportunity.name
                    )
                }

            </h3>

        </div>



        <div class="opportunity-value-row">


            <div class="opportunity-value">

                <strong>

                    ${
                        formatCurrency(
                            opportunity.value
                        )
                    }

                </strong>

                <span>
                    ESTIMATED VALUE
                </span>

            </div>


            <div class="probability-box">

                <strong>
                    ${opportunity.probability}%
                </strong>

                <span>
                    PROBABILITY
                </span>

            </div>


        </div>



        <div class="probability-track">

            <div
                class="probability-fill"
                style="width:${opportunity.probability}%"
            >
            </div>

        </div>



        <div class="opportunity-meta">


            <div>

                <span>
                    OWNER
                </span>

                <strong>

                    ${
                        escapeHTML(
                            opportunity.owner ||
                            "Unassigned"
                        )
                    }

                </strong>

            </div>


            <div>

                <span>
                    CLOSE DATE
                </span>

                <strong>

                    ${
                        escapeHTML(
                            formatDate(
                                opportunity.close_date
                            )
                        )
                    }

                </strong>

            </div>


            <div>

                <span>
                    CONTACT
                </span>

                <strong>

                    ${
                        escapeHTML(
                            contact
                            ?
                            getContactName(
                                contact
                            )
                            :
                            "—"
                        )
                    }

                </strong>

            </div>


            <div>

                <span>
                    WEIGHTED
                </span>

                <strong>

                    ${
                        formatCurrency(
                            getWeightedValue(
                                opportunity
                            )
                        )
                    }

                </strong>

            </div>


        </div>



        <div class="opportunity-next-step">

            <span>
                NEXT STEP
            </span>

            ${
                escapeHTML(
                    opportunity.next_step ||
                    "No next step recorded."
                )
            }

        </div>



        <div class="opportunity-actions">

            <button
                type="button"
                data-action="edit"
            >
                EDIT
            </button>

            <button
                type="button"
                data-action="advance"
            >
                ADVANCE →
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
                    opportunity.id
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

                advanceOpportunity(
                    opportunity.id
                );

            }
        );


    return card;

}


/* =========================================================
   ADVANCE STAGE
   ========================================================= */

function advanceOpportunity(
    opportunityId
) {

    const opportunity =
        getOpportunityById(
            opportunityId
        );


    if (!opportunity) {
        return;
    }


    const index =
        OPEN_STAGES.indexOf(
            opportunity.stage
        );


    if (
        index ===
        -1
    ) {

        return;

    }


    if (
        index <
        OPEN_STAGES.length - 1
    ) {

        opportunity.stage =
            OPEN_STAGES[
                index + 1
            ];


        opportunity.probability =
            getSuggestedProbability(
                opportunity.stage
            );

    }

    else {

        opportunity.stage =
            "won";


        opportunity.probability =
            100;

    }


    opportunity.updated_at =
        new Date()
            .toISOString();


    saveOpportunities();

    applyFilters();

}


/* =========================================================
   CLOSED
   ========================================================= */

function renderClosed() {

    const container =
        document.getElementById(
            "closedOpportunityList"
        );


    if (!container) {
        return;
    }


    const closed =
        filteredOpportunities.filter(
            opportunity =>
                opportunity.stage ===
                "won"
                ||
                opportunity.stage ===
                "lost"
        );


    container.innerHTML =
        "";


    if (
        !closed.length
    ) {

        container.innerHTML = `

            <div class="closed-empty">

                No closed opportunities are visible with the current filters.

            </div>

        `;


        return;

    }


    closed.forEach(
        opportunity => {

            const customer =
                getCustomerById(
                    opportunity.customer_id
                );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "closed-row";


            row.innerHTML = `

                <div>

                    <strong>
                        ${escapeHTML(opportunity.name)}
                    </strong>

                    <span>
                        ${escapeHTML(customer?.company_name || "—")}
                    </span>

                </div>


                <div>

                    <strong>
                        ${formatCurrency(opportunity.value)}
                    </strong>

                    <span>
                        OPPORTUNITY VALUE
                    </span>

                </div>


                <div>

                    <span
                        class="closed-status ${escapeHTML(opportunity.stage)}"
                    >
                        ${escapeHTML(opportunity.stage.toUpperCase())}
                    </span>

                </div>


                <div>

                    <strong>
                        ${escapeHTML(opportunity.owner || "Unassigned")}
                    </strong>

                    <span>
                        OWNER
                    </span>

                </div>


                <div>

                    <button
                        class="closed-edit"
                        type="button"
                    >
                        EDIT
                    </button>

                </div>

            `;


            row
                .querySelector(
                    ".closed-edit"
                )
                ?.addEventListener(
                    "click",
                    () => {

                        openDrawer(
                            opportunity.id
                        );

                    }
                );


            container.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   DRAWER
   ========================================================= */

function openDrawer(
    opportunityId = null,
    customerId = null,
    contactId = null
) {

    resetForm();


    if (
        opportunityId
    ) {

        loadOpportunityIntoForm(
            opportunityId
        );

    }

    else {

        if (
            customerId
        ) {

            setValue(
                "opportunityCustomer",
                customerId
            );


            populateContactSelect(
                contactId
            );

        }


        if (
            contactId &&
            !customerId
        ) {

            const contact =
                getContactById(
                    contactId
                );


            if (
                contact
            ) {

                setValue(
                    "opportunityCustomer",
                    contact.customer_id
                );


                populateContactSelect(
                    contact.id
                );

            }

        }

    }


    const overlay =
        document.getElementById(
            "opportunityOverlay"
        );


    const drawer =
        document.getElementById(
            "opportunityDrawer"
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
   CLOSE DRAWER
   ========================================================= */

function closeDrawer() {

    const overlay =
        document.getElementById(
            "opportunityOverlay"
        );


    const drawer =
        document.getElementById(
            "opportunityDrawer"
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
            "opportunityForm"
        )
        ?.reset();


    setValue(
        "editingOpportunityId",
        ""
    );


    setValue(
        "opportunityStage",
        "qualified"
    );


    setValue(
        "opportunityProbability",
        "25"
    );


    setValue(
        "opportunityPriority",
        "normal"
    );


    populateContactSelect();


    setText(
        "drawerTitle",
        "Add opportunity"
    );


    setText(
        "saveOpportunityLabel",
        "SAVE OPPORTUNITY"
    );

}


/* =========================================================
   LOAD OPPORTUNITY
   ========================================================= */

function loadOpportunityIntoForm(
    opportunityId
) {

    const opportunity =
        getOpportunityById(
            opportunityId
        );


    if (!opportunity) {
        return;
    }


    setValue(
        "editingOpportunityId",
        opportunity.id
    );


    setValue(
        "opportunityName",
        opportunity.name
    );


    setValue(
        "opportunityCustomer",
        opportunity.customer_id
    );


    populateContactSelect(
        opportunity.contact_id
    );


    setValue(
        "opportunityStage",
        opportunity.stage
    );


    setValue(
        "opportunityOwner",
        opportunity.owner
    );


    setValue(
        "opportunityValue",
        opportunity.value
    );


    setValue(
        "opportunityProbability",
        opportunity.probability
    );


    setValue(
        "opportunityCloseDate",
        opportunity.close_date
    );


    setValue(
        "opportunityPriority",
        opportunity.priority
    );


    setValue(
        "opportunityNextStep",
        opportunity.next_step
    );


    setValue(
        "opportunityDescription",
        opportunity.description
    );


    setValue(
        "opportunityNotes",
        opportunity.notes
    );


    setText(
        "drawerTitle",
        "Edit opportunity"
    );


    setText(
        "saveOpportunityLabel",
        "UPDATE OPPORTUNITY"
    );

}


/* =========================================================
   SAVE
   ========================================================= */

function saveOpportunityFromForm(
    event
) {

    event.preventDefault();


    const name =
        getValue(
            "opportunityName"
        );


    const customerId =
        getValue(
            "opportunityCustomer"
        );


    if (
        !name ||
        !customerId
    ) {

        return;

    }


    const editingId =
        getValue(
            "editingOpportunityId"
        );


    const existing =
        editingId
        ?
        getOpportunityById(
            editingId
        )
        :
        null;


    const stage =
        normalizeStage(
            getValue(
                "opportunityStage"
            )
        );


    let probability =
        clampProbability(
            getValue(
                "opportunityProbability"
            )
        );


    if (
        stage ===
        "won"
    ) {

        probability = 100;

    }


    if (
        stage ===
        "lost"
    ) {

        probability = 0;

    }


    const record = {

        id:
            editingId ||
            generateId(),

        name:
            name,

        customer_id:
            customerId,

        contact_id:
            getValue(
                "opportunityContact"
            ),

        stage:
            stage,

        owner:
            getValue(
                "opportunityOwner"
            ),

        value:
            Math.max(
                0,
                Number(
                    getValue(
                        "opportunityValue"
                    )
                    ||
                    0
                )
            ),

        probability:
            probability,

        close_date:
            getValue(
                "opportunityCloseDate"
            ),

        priority:
            getValue(
                "opportunityPriority"
            )
            ||
            "normal",

        next_step:
            getValue(
                "opportunityNextStep"
            ),

        description:
            getValue(
                "opportunityDescription"
            ),

        notes:
            getValue(
                "opportunityNotes"
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
            opportunities.findIndex(
                opportunity =>
                    String(
                        opportunity.id
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

            opportunities[index] =
                record;

        }

    }

    else {

        opportunities.push(
            record
        );

    }


    saveOpportunities();

    populateOwnerFilter();

    closeDrawer();

    applyFilters();

}


/* =========================================================
   SAVE STORAGE
   ========================================================= */

function saveOpportunities() {

    localStorage.setItem(
        OPPORTUNITY_STORAGE_KEY,
        JSON.stringify(
            opportunities
        )
    );

}


/* =========================================================
   METRICS
   ========================================================= */

function updateMetrics() {

    const open =
        opportunities.filter(
            opportunity =>
                OPEN_STAGES.includes(
                    opportunity.stage
                )
        );


    const openValue =
        open.reduce(
            (sum,item) =>
                sum +
                item.value,
            0
        );


    const weighted =
        open.reduce(
            (sum,item) =>
                sum +
                getWeightedValue(
                    item
                ),
            0
        );


    const probability =
        open.length
        ?
        Math.round(
            open.reduce(
                (sum,item) =>
                    sum +
                    item.probability,
                0
            )
            /
            open.length
        )
        :
        0;


    const won =
        opportunities.filter(
            opportunity =>
                opportunity.stage ===
                "won"
        );


    setText(
        "metricOpenValue",
        formatCurrency(
            openValue
        )
    );


    setText(
        "metricWeightedValue",
        formatCurrency(
            weighted
        )
    );


    setText(
        "metricOpenCount",
        open.length
    );


    setText(
        "metricProbability",
        `${probability}%`
    );


    setText(
        "metricWon",
        won.length
    );

}


/* =========================================================
   SUGGESTED PROBABILITY
   ========================================================= */

function applySuggestedProbability() {

    const stage =
        getValue(
            "opportunityStage"
        );


    setValue(
        "opportunityProbability",
        getSuggestedProbability(
            stage
        )
    );

}


function getSuggestedProbability(
    stage
) {

    const probabilities = {

        qualified:
            25,

        discovery:
            40,

        proposal:
            60,

        negotiation:
            80,

        won:
            100,

        lost:
            0

    };


    return (
        probabilities[
            stage
        ]
        ??
        25
    );

}


/* =========================================================
   WEIGHTED VALUE
   ========================================================= */

function getWeightedValue(
    opportunity
) {

    return (
        opportunity.value *
        (
            opportunity.probability /
            100
        )
    );

}


/* =========================================================
   LOOKUPS
   ========================================================= */

function getOpportunityById(
    id
) {

    return opportunities.find(
        opportunity =>
            String(
                opportunity.id
            )
            ===
            String(
                id
            )
    )
    ||
    null;

}


function getCustomerById(
    id
) {

    return customers.find(
        customer =>
            String(
                customer.id
            )
            ===
            String(
                id
            )
    )
    ||
    null;

}


function getContactById(
    id
) {

    return contacts.find(
        contact =>
            String(
                contact.id
            )
            ===
            String(
                id
            )
    )
    ||
    null;

}


function getCustomerName(
    opportunity
) {

    return (
        getCustomerById(
            opportunity.customer_id
        )
        ?.company_name
        ||
        ""
    );

}


function getContactName(
    contact
) {

    return [
        contact.first_name,
        contact.last_name
    ]
        .filter(Boolean)
        .join(" ");

}


/* =========================================================
   STAGE
   ========================================================= */

function normalizeStage(
    stage
) {

    const value =
        String(
            stage ||
            ""
        )
            .toLowerCase();


    return ALL_STAGES.includes(
        value
    )
        ?
        value
        :
        "qualified";

}


/* =========================================================
   PROBABILITY
   ========================================================= */

function clampProbability(
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

        return 25;

    }


    return Math.min(
        100,
        Math.max(
            0,
            number
        )
    );

}


/* =========================================================
   FORMAT CURRENCY
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
   DATE
   ========================================================= */

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
   UPDATED
   ========================================================= */

function getUpdatedTimestamp(
    opportunity
) {

    return new Date(
        opportunity.updated_at ||
        opportunity.created_at ||
        0
    )
        .getTime();

}


/* =========================================================
   FORM HELPERS
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
