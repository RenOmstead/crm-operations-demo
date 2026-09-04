/* =========================================================
   HELIX CRM
   CONTACT MANAGEMENT
   ========================================================= */


/* =========================================================
   STATE
   ========================================================= */

let contacts = [];

let customers = [];

let filteredContacts = [];


/* =========================================================
   STORAGE
   ========================================================= */

const CONTACT_STORAGE_KEY =
    "helix_crm_contacts";

const CUSTOMER_STORAGE_KEY =
    "helix_crm_customers";


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeContacts
);


function initializeContacts() {

    loadCustomers();

    loadContacts();

    bindControls();

    populateCompanySelect();

    populateCompanyFilter();

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

        customers =
            [];

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

    catch (error) {

        console.error(
            "Unable to load contacts:",
            error
        );


        contacts =
            [];

    }


    contacts =
        contacts.map(
            normalizeContact
        );

}


/* =========================================================
   NORMALIZE
   ========================================================= */

function normalizeContact(
    contact
) {

    return {

        id:
            contact.id ||
            generateId(),

        customer_id:
            contact.customer_id ||
            "",

        first_name:
            contact.first_name ||
            "",

        last_name:
            contact.last_name ||
            "",

        title:
            contact.title ||
            "",

        department:
            contact.department ||
            "",

        role:
            normalizeRole(
                contact.role
            ),

        owner:
            contact.owner ||
            "",

        email:
            contact.email ||
            "",

        phone:
            contact.phone ||
            "",

        linkedin:
            contact.linkedin ||
            "",

        last_contact:
            contact.last_contact ||
            "",

        follow_up_date:
            contact.follow_up_date ||
            "",

        notes:
            contact.notes ||
            "",

        created_at:
            contact.created_at ||
            new Date()
                .toISOString(),

        updated_at:
            contact.updated_at ||
            ""

    };

}


/* =========================================================
   CONTROLS
   ========================================================= */

function bindControls() {

    document
        .getElementById(
            "addContactButton"
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
            "cancelContactButton"
        )
        ?.addEventListener(
            "click",
            closeDrawer
        );


    document
        .getElementById(
            "contactOverlay"
        )
        ?.addEventListener(
            "click",
            closeDrawer
        );


    document
        .getElementById(
            "contactForm"
        )
        ?.addEventListener(
            "submit",
            saveContactFromForm
        );


    document
        .getElementById(
            "contactSearch"
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
                        "contactSearch"
                    );


                if (search) {

                    search.value =
                        event.target.value;

                }


                applyFilters();

            }
        );


    [
        "companyFilter",
        "roleFilter",
        "followUpFilter",
        "contactSort"
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
            ) {

                event.preventDefault();


                document
                    .getElementById(
                        "contactSearch"
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
            "companyFilter",
            customerId
        );

    }


    if (
        search
    ) {

        setValue(
            "contactSearch",
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
                    customerId
                );

            },
            50
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
            contact
        ) {

            setTimeout(
                () => openDrawer(
                    contact.id
                ),
                50
            );

        }

    }

}


/* =========================================================
   COMPANY SELECT
   ========================================================= */

function populateCompanySelect() {

    const select =
        document.getElementById(
            "contactCustomer"
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
                a.company_name
                    .localeCompare(
                        b.company_name
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
   COMPANY FILTER
   ========================================================= */

function populateCompanyFilter() {

    const select =
        document.getElementById(
            "companyFilter"
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
                a.company_name
                    .localeCompare(
                        b.company_name
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
   FILTER
   ========================================================= */

function applyFilters() {

    const search =
        getValue(
            "contactSearch"
        )
            .toLowerCase();


    const customer =
        getValue(
            "companyFilter"
        );


    const role =
        getValue(
            "roleFilter"
        );


    const followUp =
        getValue(
            "followUpFilter"
        );


    const sort =
        getValue(
            "contactSort"
        )
        ||
        "name";


    filteredContacts =
        contacts.filter(
            contact => {

                const company =
                    getCustomerById(
                        contact.customer_id
                    );


                const searchable =
                    [
                        contact.first_name,
                        contact.last_name,
                        contact.title,
                        contact.department,
                        contact.email,
                        contact.phone,
                        contact.owner,
                        contact.notes,
                        company?.company_name
                    ]
                        .join(" ")
                        .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchable.includes(
                        search
                    );


                const matchesCompany =
                    !customer ||
                    String(
                        contact.customer_id
                    )
                    ===
                    String(
                        customer
                    );


                const matchesRole =
                    !role ||
                    contact.role ===
                    role;


                let matchesFollowUp =
                    true;


                if (
                    followUp ===
                    "due"
                ) {

                    matchesFollowUp =
                        isFollowUpDue(
                            contact
                        );

                }


                if (
                    followUp ===
                    "scheduled"
                ) {

                    matchesFollowUp =
                        Boolean(
                            contact.follow_up_date
                        )
                        &&
                        !isFollowUpDue(
                            contact
                        );

                }


                if (
                    followUp ===
                    "none"
                ) {

                    matchesFollowUp =
                        !contact.follow_up_date;

                }


                return (
                    matchesSearch &&
                    matchesCompany &&
                    matchesRole &&
                    matchesFollowUp
                );

            }
        );


    sortContacts(
        filteredContacts,
        sort
    );


    renderContacts();

    updateMetrics();

}


/* =========================================================
   SORT
   ========================================================= */

function sortContacts(
    list,
    sort
) {

    list.sort(
        (a,b) => {

            if (
                sort ===
                "company"
            ) {

                return (
                    getCompanyName(a)
                        .localeCompare(
                            getCompanyName(b)
                        )
                );

            }


            if (
                sort ===
                "follow-up"
            ) {

                return compareDates(
                    a.follow_up_date,
                    b.follow_up_date
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


            return (
                getFullName(a)
                    .localeCompare(
                        getFullName(b)
                    )
            );

        }
    );

}


/* =========================================================
   RENDER
   ========================================================= */

function renderContacts() {

    const container =
        document.getElementById(
            "contactGrid"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    setText(
        "visibleContactCount",
        filteredContacts.length
    );


    if (
        !filteredContacts.length
    ) {

        renderEmptyState(
            container
        );

        return;

    }


    const fragment =
        document.createDocumentFragment();


    filteredContacts.forEach(
        contact => {

            fragment.appendChild(
                createContactCard(
                    contact
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

function createContactCard(
    contact
) {

    const company =
        getCustomerById(
            contact.customer_id
        );


    const followUpDue =
        isFollowUpDue(
            contact
        );


    const card =
        document.createElement(
            "article"
        );


    card.className =
        "contact-card";


    card.innerHTML = `

        <div class="contact-card-head">


            <div class="contact-avatar">

                ${
                    escapeHTML(
                        getInitials(
                            contact
                        )
                    )
                }

            </div>


            <div class="contact-name-wrap">


                <span
                    class="relationship-pill ${escapeHTML(contact.role)}"
                >

                    ${
                        escapeHTML(
                            formatRole(
                                contact.role
                            )
                        )
                    }

                </span>


                <h3>

                    ${
                        escapeHTML(
                            getFullName(
                                contact
                            )
                        )
                    }

                </h3>


                <span class="job-title">

                    ${
                        escapeHTML(
                            contact.title ||
                            "No title recorded"
                        )
                    }

                </span>


            </div>


        </div>



        <div class="contact-card-body">


            <div class="contact-company">

                ${
                    escapeHTML(
                        company?.company_name ||
                        "NO COMPANY LINKED"
                    )
                }

            </div>



            <div class="contact-meta-grid">


                <div class="contact-meta">

                    <span>
                        EMAIL
                    </span>

                    <strong>

                        ${
                            escapeHTML(
                                contact.email ||
                                "—"
                            )
                        }

                    </strong>

                </div>


                <div class="contact-meta">

                    <span>
                        OWNER
                    </span>

                    <strong>

                        ${
                            escapeHTML(
                                contact.owner ||
                                "Unassigned"
                            )
                        }

                    </strong>

                </div>


                <div class="contact-meta">

                    <span>
                        DEPARTMENT
                    </span>

                    <strong>

                        ${
                            escapeHTML(
                                contact.department ||
                                "—"
                            )
                        }

                    </strong>

                </div>


                <div class="contact-meta">

                    <span>
                        LAST CONTACT
                    </span>

                    <strong>

                        ${
                            escapeHTML(
                                formatDate(
                                    contact.last_contact
                                )
                            )
                        }

                    </strong>

                </div>


            </div>



            <p class="contact-notes">

                ${
                    escapeHTML(
                        contact.notes ||
                        "No relationship notes have been added yet."
                    )
                }

            </p>


            ${
                contact.follow_up_date

                ?

                `
                    <div
                        class="contact-followup ${
                            followUpDue
                            ?
                            "due"
                            :
                            ""
                        }"
                    >

                        <span>

                            ${
                                followUpDue
                                ?
                                "FOLLOW-UP DUE"
                                :
                                "NEXT FOLLOW-UP"
                            }

                        </span>

                        <strong>

                            ${
                                escapeHTML(
                                    formatDate(
                                        contact.follow_up_date
                                    )
                                )
                            }

                        </strong>

                    </div>
                `

                :

                ""
            }


        </div>



        <div class="contact-card-actions">


            <button
                type="button"
                data-action="edit"
            >
                EDIT
            </button>


            ${
                company

                ?

                `
                    <a
                        href="customers.html?id=${
                            encodeURIComponent(
                                company.id
                            )
                        }"
                    >
                        COMPANY
                    </a>
                `

                :

                `
                    <span>
                        COMPANY
                    </span>
                `
            }


            <a
                href="pipeline.html?contact=${
                    encodeURIComponent(
                        contact.id
                    )
                }"
            >
                PIPELINE
            </a>


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
                    contact.id
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

    const hasContacts =
        contacts.length >
        0;


    container.innerHTML = `

        <div class="contacts-empty">


            <div>

                <span class="empty-label">

                    ${
                        hasContacts
                        ?
                        "NO HUMANS FOUND"
                        :
                        "RELATIONSHIP NETWORK = EMPTY"
                    }

                </span>


                <h3>

                    ${
                        hasContacts
                        ?
                        "Nobody matches those filters."
                        :
                        "Time to meet some people."
                    }

                </h3>


                <p>

                    ${
                        hasContacts

                        ?

                        "Try changing your search or filters."

                        :

                        "Contacts will connect individual people to customer companies, pipeline opportunities, tasks, and future outreach."

                    }

                </p>


                ${
                    !hasContacts

                    ?

                    `
                        <button
                            id="emptyAddContact"
                            type="button"
                        >
                            + ADD FIRST CONTACT
                        </button>
                    `

                    :

                    ""
                }


            </div>


            <div class="empty-art">
                ◉
            </div>


        </div>

    `;


    document
        .getElementById(
            "emptyAddContact"
        )
        ?.addEventListener(
            "click",
            () => openDrawer()
        );

}


/* =========================================================
   DRAWER
   ========================================================= */

function openDrawer(
    contactId = null,
    customerId = null
) {

    resetForm();


    if (
        contactId
    ) {

        loadContactIntoForm(
            contactId
        );

    }

    else if (
        customerId
    ) {

        setValue(
            "contactCustomer",
            customerId
        );

    }


    const overlay =
        document.getElementById(
            "contactOverlay"
        );


    const drawer =
        document.getElementById(
            "contactDrawer"
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
            "contactOverlay"
        );


    const drawer =
        document.getElementById(
            "contactDrawer"
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
   RESET
   ========================================================= */

function resetForm() {

    document
        .getElementById(
            "contactForm"
        )
        ?.reset();


    setValue(
        "editingContactId",
        ""
    );


    setValue(
        "contactRole",
        "other"
    );


    setText(
        "drawerTitle",
        "Add contact"
    );


    setText(
        "saveContactLabel",
        "SAVE CONTACT"
    );

}


/* =========================================================
   LOAD INTO FORM
   ========================================================= */

function loadContactIntoForm(
    contactId
) {

    const contact =
        getContactById(
            contactId
        );


    if (!contact) {
        return;
    }


    setValue(
        "editingContactId",
        contact.id
    );


    setValue(
        "contactFirstName",
        contact.first_name
    );


    setValue(
        "contactLastName",
        contact.last_name
    );


    setValue(
        "contactCustomer",
        contact.customer_id
    );


    setValue(
        "contactTitle",
        contact.title
    );


    setValue(
        "contactDepartment",
        contact.department
    );


    setValue(
        "contactRole",
        contact.role
    );


    setValue(
        "contactOwner",
        contact.owner
    );


    setValue(
        "contactEmail",
        contact.email
    );


    setValue(
        "contactPhone",
        contact.phone
    );


    setValue(
        "contactLinkedIn",
        contact.linkedin
    );


    setValue(
        "contactLastContact",
        contact.last_contact
    );


    setValue(
        "contactFollowUp",
        contact.follow_up_date
    );


    setValue(
        "contactNotes",
        contact.notes
    );


    setText(
        "drawerTitle",
        "Edit contact"
    );


    setText(
        "saveContactLabel",
        "UPDATE CONTACT"
    );

}


/* =========================================================
   SAVE
   ========================================================= */

function saveContactFromForm(
    event
) {

    event.preventDefault();


    const firstName =
        getValue(
            "contactFirstName"
        );


    const lastName =
        getValue(
            "contactLastName"
        );


    if (
        !firstName ||
        !lastName
    ) {

        return;

    }


    const editingId =
        getValue(
            "editingContactId"
        );


    const existing =
        editingId
        ?
        getContactById(
            editingId
        )
        :
        null;


    const record = {

        id:
            editingId ||
            generateId(),

        customer_id:
            getValue(
                "contactCustomer"
            ),

        first_name:
            firstName,

        last_name:
            lastName,

        title:
            getValue(
                "contactTitle"
            ),

        department:
            getValue(
                "contactDepartment"
            ),

        role:
            normalizeRole(
                getValue(
                    "contactRole"
                )
            ),

        owner:
            getValue(
                "contactOwner"
            ),

        email:
            getValue(
                "contactEmail"
            ),

        phone:
            getValue(
                "contactPhone"
            ),

        linkedin:
            getValue(
                "contactLinkedIn"
            ),

        last_contact:
            getValue(
                "contactLastContact"
            ),

        follow_up_date:
            getValue(
                "contactFollowUp"
            ),

        notes:
            getValue(
                "contactNotes"
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
            contacts.findIndex(
                contact =>
                    String(
                        contact.id
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

            contacts[index] =
                record;

        }

    }

    else {

        contacts.push(
            record
        );

    }


    saveContacts();

    closeDrawer();

    applyFilters();

}


/* =========================================================
   SAVE
   ========================================================= */

function saveContacts() {

    localStorage.setItem(
        CONTACT_STORAGE_KEY,
        JSON.stringify(
            contacts
        )
    );

}


/* =========================================================
   METRICS
   ========================================================= */

function updateMetrics() {

    setText(
        "metricTotal",
        contacts.length
    );


    setText(
        "metricDecisionMakers",

        contacts.filter(
            contact =>
                contact.role ===
                "decision-maker"
        ).length

    );


    setText(
        "metricFollowUps",

        contacts.filter(
            isFollowUpDue
        ).length

    );


    setText(
        "metricCompanies",

        new Set(
            contacts
                .map(
                    contact =>
                        contact.customer_id
                )
                .filter(Boolean)
        )
            .size

    );


    setText(
        "visibleContactCount",
        filteredContacts.length
    );

}


/* =========================================================
   FOLLOW-UP
   ========================================================= */

function isFollowUpDue(
    contact
) {

    if (
        !contact.follow_up_date
    ) {

        return false;

    }


    return (
        contact.follow_up_date <=
        todayISO()
    );

}


/* =========================================================
   LOOKUPS
   ========================================================= */

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


function getCompanyName(
    contact
) {

    return (
        getCustomerById(
            contact.customer_id
        )
        ?.company_name
        ||
        ""
    );

}


/* =========================================================
   NAME
   ========================================================= */

function getFullName(
    contact
) {

    return [
        contact.first_name,
        contact.last_name
    ]
        .filter(Boolean)
        .join(" ");

}


function getInitials(
    contact
) {

    return (
        (
            contact.first_name
                ?.charAt(0)
            ||
            ""
        )
        +
        (
            contact.last_name
                ?.charAt(0)
            ||
            ""
        )
    )
        .toUpperCase()
        ||
        "?";

}


/* =========================================================
   ROLE
   ========================================================= */

function normalizeRole(
    role
) {

    const value =
        String(
            role ||
            ""
        )
            .toLowerCase();


    const valid = [

        "decision-maker",

        "influencer",

        "technical",

        "procurement",

        "champion",

        "other"

    ];


    return valid.includes(
        value
    )
        ?
        value
        :
        "other";

}


function formatRole(
    role
) {

    const labels = {

        "decision-maker":
            "Decision Maker",

        influencer:
            "Influencer",

        technical:
            "Technical",

        procurement:
            "Procurement",

        champion:
            "Champion",

        other:
            "Other"

    };


    return (
        labels[
            role
        ]
        ||
        "Other"
    );

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
   TIMESTAMP
   ========================================================= */

function getUpdatedTimestamp(
    contact
) {

    return new Date(
        contact.updated_at ||
        contact.created_at ||
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
