/* =========================================================
   HELIX CRM
   TASK MANAGEMENT
   ========================================================= */


/* =========================================================
   STATE
   ========================================================= */

let tasks = [];

let customers = [];

let contacts = [];

let opportunities = [];

let contracts = [];

let filteredTasks = [];


/* =========================================================
   STORAGE
   ========================================================= */

const TASK_STORAGE_KEY =
    "helix_crm_tasks";

const CUSTOMER_STORAGE_KEY =
    "helix_crm_customers";

const CONTACT_STORAGE_KEY =
    "helix_crm_contacts";

const OPPORTUNITY_STORAGE_KEY =
    "helix_crm_opportunities";

const CONTRACT_STORAGE_KEY =
    "helix_crm_contracts";


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeTasks
);


function initializeTasks() {

    loadRelatedData();

    loadTasks();

    bindControls();

    populateLinkedRecordSelects();

    populateOwnerFilter();

    readURLParameters();

    applyFilters();

}


/* =========================================================
   LOAD RELATED DATA
   ========================================================= */

function loadRelatedData() {

    customers =
        loadCollection(
            CUSTOMER_STORAGE_KEY,
            window.HELIX_DATA?.customers
        );


    contacts =
        loadCollection(
            CONTACT_STORAGE_KEY,
            window.HELIX_DATA?.contacts
        );


    opportunities =
        loadCollection(
            OPPORTUNITY_STORAGE_KEY,
            window.HELIX_DATA?.opportunities
        );


    contracts =
        loadCollection(
            CONTRACT_STORAGE_KEY,
            window.HELIX_DATA?.contracts
        );

}


function loadCollection(
    key,
    fallback
) {

    try {

        const stored =
            localStorage.getItem(
                key
            );


        if (stored) {

            return JSON.parse(
                stored
            );

        }

    }

    catch (error) {

        console.error(
            `Unable to load ${key}:`,
            error
        );

    }


    return Array.isArray(
        fallback
    )
        ?
        [...fallback]
        :
        [];

}


/* =========================================================
   LOAD TASKS
   ========================================================= */

function loadTasks() {

    try {

        const stored =
            localStorage.getItem(
                TASK_STORAGE_KEY
            );


        if (
            stored
        ) {

            tasks =
                JSON.parse(
                    stored
                );

        }

        else {

            tasks =
                Array.isArray(
                    window.HELIX_DATA
                        ?.tasks
                )
                ?
                [...window.HELIX_DATA.tasks]
                :
                [];

        }

    }

    catch (error) {

        console.error(
            "Unable to load tasks:",
            error
        );


        tasks = [];

    }


    tasks =
        tasks.map(
            normalizeTask
        );

}


/* =========================================================
   NORMALIZE
   ========================================================= */

function normalizeTask(
    task
) {

    return {

        id:
            task.id ||
            generateId(),

        title:
            task.title ||
            "",

        priority:
            normalizePriority(
                task.priority
            ),

        owner:
            task.owner ||
            "",

        due_date:
            task.due_date ||
            "",

        due_time:
            task.due_time ||
            "",

        type:
            task.type ||
            "other",

        status:
            normalizeStatus(
                task.status,
                task.completed
            ),

        customer_id:
            task.customer_id ||
            "",

        contact_id:
            task.contact_id ||
            "",

        opportunity_id:
            task.opportunity_id ||
            "",

        contract_id:
            task.contract_id ||
            "",

        description:
            task.description ||
            "",

        notes:
            task.notes ||
            "",

        completed:
            task.status ===
            "completed"
            ||
            task.completed ===
            true,

        completed_at:
            task.completed_at ||
            "",

        created_at:
            task.created_at ||
            new Date()
                .toISOString(),

        updated_at:
            task.updated_at ||
            ""

    };

}


/* =========================================================
   CONTROLS
   ========================================================= */

function bindControls() {

    document
        .getElementById(
            "addTaskButton"
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
            "cancelTaskButton"
        )
        ?.addEventListener(
            "click",
            closeDrawer
        );


    document
        .getElementById(
            "taskOverlay"
        )
        ?.addEventListener(
            "click",
            closeDrawer
        );


    document
        .getElementById(
            "taskForm"
        )
        ?.addEventListener(
            "submit",
            saveTaskFromForm
        );


    document
        .getElementById(
            "taskCustomer"
        )
        ?.addEventListener(
            "change",
            () => {

                populateContactSelect();

                populateOpportunitySelect();

            }
        );


    document
        .getElementById(
            "taskSearch"
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
                        "taskSearch"
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
        "priorityFilter",
        "ownerFilter",
        "dueFilter",
        "taskSort"
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
                        "taskSearch"
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
   URL PARAMS
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
            "opportunity"
        );


    const contractId =
        params.get(
            "contract"
        );


    if (
        action ===
        "new"
    ) {

        setTimeout(
            () => {

                openDrawer(
                    null,
                    {
                        customerId,
                        contactId,
                        opportunityId,
                        contractId
                    }
                );

            },
            50
        );

    }


    if (
        id
    ) {

        const task =
            getTaskById(
                id
            );


        if (
            task
        ) {

            setTimeout(
                () => {

                    openDrawer(
                        task.id
                    );

                },
                50
            );

        }

    }

}


/* =========================================================
   LINKED RECORD SELECTS
   ========================================================= */

function populateLinkedRecordSelects() {

    populateCustomerSelect();

    populateContactSelect();

    populateOpportunitySelect();

    populateContractSelect();

}


/* =========================================================
   CUSTOMER SELECT
   ========================================================= */

function populateCustomerSelect() {

    const select =
        document.getElementById(
            "taskCustomer"
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
    selectedId = null
) {

    const select =
        document.getElementById(
            "taskContact"
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


    const customerId =
        getValue(
            "taskCustomer"
        );


    let list =
        [...contacts];


    if (
        customerId
    ) {

        list =
            list.filter(
                contact =>
                    String(
                        contact.customer_id
                    )
                    ===
                    String(
                        customerId
                    )
            );

    }


    list
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
        selectedId
    ) {

        setValue(
            "taskContact",
            selectedId
        );

    }

}


/* =========================================================
   OPPORTUNITY SELECT
   ========================================================= */

function populateOpportunitySelect(
    selectedId = null
) {

    const select =
        document.getElementById(
            "taskOpportunity"
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


    const customerId =
        getValue(
            "taskCustomer"
        );


    let list =
        [...opportunities];


    if (
        customerId
    ) {

        list =
            list.filter(
                opportunity =>
                    String(
                        opportunity.customer_id
                    )
                    ===
                    String(
                        customerId
                    )
            );

    }


    list
        .sort(
            (a,b) =>
                String(
                    a.name ||
                    ""
                )
                    .localeCompare(
                        String(
                            b.name ||
                            ""
                        )
                    )
        )
        .forEach(
            opportunity => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    opportunity.id;


                option.textContent =
                    opportunity.name;


                select.appendChild(
                    option
                );

            }
        );


    if (
        selectedId
    ) {

        setValue(
            "taskOpportunity",
            selectedId
        );

    }

}


/* =========================================================
   CONTRACT SELECT
   ========================================================= */

function populateContractSelect(
    selectedId = null
) {

    const select =
        document.getElementById(
            "taskContract"
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


    [...contracts]
        .sort(
            (a,b) =>
                String(
                    a.title ||
                    ""
                )
                    .localeCompare(
                        String(
                            b.title ||
                            ""
                        )
                    )
        )
        .forEach(
            contract => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    contract.id;


                option.textContent =
                    contract.title;


                select.appendChild(
                    option
                );

            }
        );


    if (
        selectedId
    ) {

        setValue(
            "taskContract",
            selectedId
        );

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
                tasks
                    .map(
                        task =>
                            String(
                                task.owner ||
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
            "taskSearch"
        )
            .toLowerCase();


    const status =
        getValue(
            "statusFilter"
        );


    const priority =
        getValue(
            "priorityFilter"
        );


    const owner =
        getValue(
            "ownerFilter"
        );


    const due =
        getValue(
            "dueFilter"
        );


    const sort =
        getValue(
            "taskSort"
        )
        ||
        "due";


    filteredTasks =
        tasks.filter(
            task => {

                const searchable =
                    [
                        task.title,
                        task.owner,
                        task.description,
                        task.notes,
                        task.type,
                        getLinkedRecordLabel(task)
                    ]
                        .join(" ")
                        .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchable.includes(
                        search
                    );


                let matchesStatus =
                    true;


                if (
                    status ===
                    "open"
                ) {

                    matchesStatus =
                        !task.completed;

                }


                if (
                    status ===
                    "completed"
                ) {

                    matchesStatus =
                        task.completed;

                }


                const matchesPriority =
                    !priority ||
                    task.priority ===
                    priority;


                const matchesOwner =
                    !owner ||
                    task.owner ===
                    owner;


                const matchesDue =
                    matchesDueFilter(
                        task,
                        due
                    );


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesPriority &&
                    matchesOwner &&
                    matchesDue
                );

            }
        );


    sortTasks(
        filteredTasks,
        sort
    );


    renderTaskBoard();

    renderCompleted();

    updateMetrics();

}


/* =========================================================
   DUE FILTER
   ========================================================= */

function matchesDueFilter(
    task,
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
            !task.due_date
        );

    }


    if (
        !task.due_date
    ) {

        return false;

    }


    const days =
        daysUntil(
            task.due_date
        );


    if (
        filter ===
        "overdue"
    ) {

        return (
            days < 0
        );

    }


    if (
        filter ===
        "today"
    ) {

        return (
            days === 0
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

function sortTasks(
    list,
    sort
) {

    list.sort(
        (a,b) => {

            if (
                sort ===
                "priority"
            ) {

                return (
                    getPriorityRank(a.priority)
                    -
                    getPriorityRank(b.priority)
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
                "owner"
            ) {

                return String(
                    a.owner ||
                    "ZZZ"
                )
                    .localeCompare(
                        String(
                            b.owner ||
                            "ZZZ"
                        )
                    );

            }


            return compareDates(
                a.due_date,
                b.due_date
            );

        }
    );

}


/* =========================================================
   BOARD
   ========================================================= */

function renderTaskBoard() {

    const open =
        filteredTasks.filter(
            task =>
                !task.completed
        );


    const groups = {

        overdue: [],

        today: [],

        upcoming: [],

        unscheduled: []

    };


    open.forEach(
        task => {

            const category =
                getTaskDateCategory(
                    task
                );


            groups[
                category
            ]
                .push(
                    task
                );

        }
    );


    renderTaskColumn(
        "overdue",
        groups.overdue
    );


    renderTaskColumn(
        "today",
        groups.today
    );


    renderTaskColumn(
        "upcoming",
        groups.upcoming
    );


    renderTaskColumn(
        "unscheduled",
        groups.unscheduled
    );


    setText(
        "visibleTaskCount",
        filteredTasks.length
    );

}


/* =========================================================
   COLUMN
   ========================================================= */

function renderTaskColumn(
    category,
    items
) {

    const container =
        document.getElementById(
            `${category}List`
        );


    if (
        !container
    ) {

        return;

    }


    container.innerHTML =
        "";


    setText(
        `${category}Count`,
        items.length
    );


    if (
        !items.length
    ) {

        container.innerHTML = `

            <div class="column-empty">
                No tasks here.
            </div>

        `;


        return;

    }


    items.forEach(
        task => {

            container.appendChild(
                createTaskCard(
                    task
                )
            );

        }
    );

}


/* =========================================================
   TASK CARD
   ========================================================= */

function createTaskCard(
    task
) {

    const card =
        document.createElement(
            "article"
        );


    const dueClass =
        getTaskDateCategory(
            task
        );


    const linkedLabel =
        getLinkedRecordLabel(
            task
        );


    card.className =
        `task-card priority-${escapeHTML(task.priority)}`;


    card.innerHTML = `

        <div class="task-card-top">


            <div class="task-topline">

                <span class="task-type">
                    ${escapeHTML(formatTaskType(task.type))}
                </span>

                <span
                    class="priority-tag ${escapeHTML(task.priority)}"
                >
                    ${escapeHTML(task.priority)}
                </span>

            </div>


            <h3>
                ${escapeHTML(task.title)}
            </h3>


        </div>


        ${
            task.description

            ?

            `
                <div class="task-description">
                    ${escapeHTML(task.description)}
                </div>
            `

            :

            ""
        }


        ${
            linkedLabel

            ?

            `
                <div class="task-link">

                    <span>
                        LINKED TO
                    </span>

                    <strong>
                        ${escapeHTML(linkedLabel)}
                    </strong>

                </div>
            `

            :

            ""
        }


        <div class="task-meta">


            <div>

                <span>
                    OWNER
                </span>

                <strong>
                    ${escapeHTML(task.owner || "Unassigned")}
                </strong>

            </div>


            <div>

                <span>
                    DUE
                </span>

                <strong
                    class="task-due ${escapeHTML(dueClass)}"
                >
                    ${
                        escapeHTML(
                            formatDueDateTime(
                                task
                            )
                        )
                    }
                </strong>

            </div>


        </div>


        <div class="task-actions">


            <button
                type="button"
                data-action="edit"
            >
                EDIT
            </button>


            <button
                type="button"
                data-action="complete"
            >
                COMPLETE ✓
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
                    task.id
                );

            }
        );


    card
        .querySelector(
            '[data-action="complete"]'
        )
        ?.addEventListener(
            "click",
            () => {

                completeTask(
                    task.id
                );

            }
        );


    return card;

}


/* =========================================================
   COMPLETED
   ========================================================= */

function renderCompleted() {

    const container =
        document.getElementById(
            "completedTaskList"
        );


    if (
        !container
    ) {

        return;

    }


    const completed =
        filteredTasks
            .filter(
                task =>
                    task.completed
            )
            .sort(
                (a,b) =>
                    getCompletedTimestamp(b)
                    -
                    getCompletedTimestamp(a)
            )
            .slice(
                0,
                12
            );


    container.innerHTML =
        "";


    if (
        !completed.length
    ) {

        container.innerHTML = `

            <div class="completed-empty">

                No completed tasks are visible with the current filters.

            </div>

        `;


        return;

    }


    completed.forEach(
        task => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "completed-row";


            row.innerHTML = `

                <div>

                    <strong>
                        ${escapeHTML(task.title)}
                    </strong>

                    <span>
                        ${escapeHTML(formatTaskType(task.type))}
                    </span>

                </div>


                <div>

                    <strong>
                        ${escapeHTML(getLinkedRecordLabel(task) || "—")}
                    </strong>

                    <span>
                        LINKED RECORD
                    </span>

                </div>


                <div>

                    <strong>
                        ${escapeHTML(task.owner || "Unassigned")}
                    </strong>

                    <span>
                        OWNER
                    </span>

                </div>


                <div>

                    <span class="completed-status">
                        COMPLETED
                    </span>

                </div>


                <div>

                    <button
                        class="completed-edit"
                        type="button"
                    >
                        EDIT
                    </button>

                </div>

            `;


            row
                .querySelector(
                    ".completed-edit"
                )
                ?.addEventListener(
                    "click",
                    () => {

                        openDrawer(
                            task.id
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
   COMPLETE TASK
   ========================================================= */

function completeTask(
    id
) {

    const task =
        getTaskById(
            id
        );


    if (
        !task
    ) {

        return;

    }


    task.status =
        "completed";


    task.completed =
        true;


    task.completed_at =
        new Date()
            .toISOString();


    task.updated_at =
        new Date()
            .toISOString();


    saveTasks();

    applyFilters();

}


/* =========================================================
   DRAWER
   ========================================================= */

function openDrawer(
    taskId = null,
    prefill = {}
) {

    resetForm();


    if (
        taskId
    ) {

        loadTaskIntoForm(
            taskId
        );

    }

    else {

        applyPrefill(
            prefill
        );

    }


    const overlay =
        document.getElementById(
            "taskOverlay"
        );


    const drawer =
        document.getElementById(
            "taskDrawer"
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
   PREFILL
   ========================================================= */

function applyPrefill(
    prefill
) {

    if (
        prefill.customerId
    ) {

        setValue(
            "taskCustomer",
            prefill.customerId
        );

    }


    populateContactSelect(
        prefill.contactId
    );


    populateOpportunitySelect(
        prefill.opportunityId
    );


    populateContractSelect(
        prefill.contractId
    );

}


/* =========================================================
   CLOSE
   ========================================================= */

function closeDrawer() {

    const overlay =
        document.getElementById(
            "taskOverlay"
        );


    const drawer =
        document.getElementById(
            "taskDrawer"
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
            "taskForm"
        )
        ?.reset();


    setValue(
        "editingTaskId",
        ""
    );


    setValue(
        "taskPriority",
        "normal"
    );


    setValue(
        "taskType",
        "follow-up"
    );


    setValue(
        "taskStatus",
        "open"
    );


    populateContactSelect();

    populateOpportunitySelect();

    populateContractSelect();


    setText(
        "drawerTitle",
        "Add task"
    );


    setText(
        "saveTaskLabel",
        "SAVE TASK"
    );

}


/* =========================================================
   LOAD TASK
   ========================================================= */

function loadTaskIntoForm(
    id
) {

    const task =
        getTaskById(
            id
        );


    if (
        !task
    ) {

        return;

    }


    setValue(
        "editingTaskId",
        task.id
    );


    setValue(
        "taskTitle",
        task.title
    );


    setValue(
        "taskPriority",
        task.priority
    );


    setValue(
        "taskOwner",
        task.owner
    );


    setValue(
        "taskDueDate",
        task.due_date
    );


    setValue(
        "taskDueTime",
        task.due_time
    );


    setValue(
        "taskType",
        task.type
    );


    setValue(
        "taskStatus",
        task.status
    );


    setValue(
        "taskCustomer",
        task.customer_id
    );


    populateContactSelect(
        task.contact_id
    );


    populateOpportunitySelect(
        task.opportunity_id
    );


    populateContractSelect(
        task.contract_id
    );


    setValue(
        "taskDescription",
        task.description
    );


    setValue(
        "taskNotes",
        task.notes
    );


    setText(
        "drawerTitle",
        "Edit task"
    );


    setText(
        "saveTaskLabel",
        "UPDATE TASK"
    );

}


/* =========================================================
   SAVE
   ========================================================= */

function saveTaskFromForm(
    event
) {

    event.preventDefault();


    const title =
        getValue(
            "taskTitle"
        );


    if (
        !title
    ) {

        return;

    }


    const editingId =
        getValue(
            "editingTaskId"
        );


    const existing =
        editingId
        ?
        getTaskById(
            editingId
        )
        :
        null;


    const status =
        normalizeStatus(
            getValue(
                "taskStatus"
            )
        );


    const isCompleted =
        status ===
        "completed";


    const record = {

        id:
            editingId ||
            generateId(),

        title,

        priority:
            normalizePriority(
                getValue(
                    "taskPriority"
                )
            ),

        owner:
            getValue(
                "taskOwner"
            ),

        due_date:
            getValue(
                "taskDueDate"
            ),

        due_time:
            getValue(
                "taskDueTime"
            ),

        type:
            getValue(
                "taskType"
            )
            ||
            "other",

        status,

        customer_id:
            getValue(
                "taskCustomer"
            ),

        contact_id:
            getValue(
                "taskContact"
            ),

        opportunity_id:
            getValue(
                "taskOpportunity"
            ),

        contract_id:
            getValue(
                "taskContract"
            ),

        description:
            getValue(
                "taskDescription"
            ),

        notes:
            getValue(
                "taskNotes"
            ),

        completed:
            isCompleted,

        completed_at:
            isCompleted
            ?
            (
                existing?.completed_at
                ||
                new Date()
                    .toISOString()
            )
            :
            "",

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
            tasks.findIndex(
                task =>
                    String(
                        task.id
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

            tasks[index] =
                record;

        }

    }

    else {

        tasks.push(
            record
        );

    }


    saveTasks();

    populateOwnerFilter();

    closeDrawer();

    applyFilters();

}


/* =========================================================
   SAVE STORAGE
   ========================================================= */

function saveTasks() {

    localStorage.setItem(
        TASK_STORAGE_KEY,
        JSON.stringify(
            tasks
        )
    );

}


/* =========================================================
   METRICS
   ========================================================= */

function updateMetrics() {

    const open =
        tasks.filter(
            task =>
                !task.completed
        );


    const today =
        open.filter(
            task =>
                task.due_date ===
                todayISO()
        );


    const overdue =
        open.filter(
            task =>
                task.due_date
                &&
                task.due_date <
                todayISO()
        );


    const high =
        open.filter(
            task =>
                task.priority ===
                "high"
                ||
                task.priority ===
                "urgent"
        );


    const completion =
        tasks.length
        ?
        Math.round(
            (
                tasks.filter(
                    task =>
                        task.completed
                ).length
                /
                tasks.length
            )
            *
            100
        )
        :
        0;


    setText(
        "metricOpen",
        open.length
    );


    setText(
        "metricToday",
        today.length
    );


    setText(
        "metricOverdue",
        overdue.length
    );


    setText(
        "metricHigh",
        high.length
    );


    setText(
        "metricCompletion",
        `${completion}%`
    );


    setText(
        "visibleTaskCount",
        filteredTasks.length
    );

}


/* =========================================================
   DATE CATEGORY
   ========================================================= */

function getTaskDateCategory(
    task
) {

    if (
        !task.due_date
    ) {

        return "unscheduled";

    }


    const today =
        todayISO();


    if (
        task.due_date <
        today
    ) {

        return "overdue";

    }


    if (
        task.due_date ===
        today
    ) {

        return "today";

    }


    return "upcoming";

}


/* =========================================================
   LINKED RECORD
   ========================================================= */

function getLinkedRecordLabel(
    task
) {

    if (
        task.opportunity_id
    ) {

        const opportunity =
            getOpportunityById(
                task.opportunity_id
            );


        if (
            opportunity
        ) {

            return `Opportunity · ${opportunity.name}`;

        }

    }


    if (
        task.contract_id
    ) {

        const contract =
            getContractById(
                task.contract_id
            );


        if (
            contract
        ) {

            return `Gov Contract · ${contract.title}`;

        }

    }


    if (
        task.contact_id
    ) {

        const contact =
            getContactById(
                task.contact_id
            );


        if (
            contact
        ) {

            return `Contact · ${getContactName(contact)}`;

        }

    }


    if (
        task.customer_id
    ) {

        const customer =
            getCustomerById(
                task.customer_id
            );


        if (
            customer
        ) {

            return `Customer · ${customer.company_name}`;

        }

    }


    return "";

}


/* =========================================================
   LOOKUPS
   ========================================================= */

function getTaskById(
    id
) {

    return tasks.find(
        task =>
            String(
                task.id
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
   CONTACT NAME
   ========================================================= */

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
   FORMAT TASK TYPE
   ========================================================= */

function formatTaskType(
    type
) {

    const labels = {

        "follow-up":
            "Follow-Up",

        sales:
            "Sales",

        contract:
            "Contract",

        marketing:
            "Marketing",

        meeting:
            "Meeting",

        research:
            "Research",

        admin:
            "Administrative",

        other:
            "Other"

    };


    return (
        labels[type]
        ||
        type
    );

}


/* =========================================================
   PRIORITY
   ========================================================= */

function normalizePriority(
    value
) {

    const priority =
        String(
            value ||
            ""
        )
            .toLowerCase();


    const valid = [
        "urgent",
        "high",
        "normal",
        "low"
    ];


    return valid.includes(
        priority
    )
        ?
        priority
        :
        "normal";

}


function getPriorityRank(
    priority
) {

    const order = {

        urgent: 0,

        high: 1,

        normal: 2,

        low: 3

    };


    return (
        order[priority]
        ??
        99
    );

}


/* =========================================================
   STATUS
   ========================================================= */

function normalizeStatus(
    value,
    completed = false
) {

    if (
        completed ===
        true
    ) {

        return "completed";

    }


    const status =
        String(
            value ||
            ""
        )
            .toLowerCase();


    const valid = [

        "open",

        "in-progress",

        "waiting",

        "completed"

    ];


    return valid.includes(
        status
    )
        ?
        status
        :
        "open";

}


/* =========================================================
   DATE
   ========================================================= */

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


function formatDueDateTime(
    task
) {

    if (
        !task.due_date
    ) {

        return "No date";

    }


    let result =
        formatDate(
            task.due_date
        );


    if (
        task.due_time
    ) {

        const time =
            new Date(
                `2000-01-01T${task.due_time}`
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
   TIMESTAMPS
   ========================================================= */

function getUpdatedTimestamp(
    task
) {

    return new Date(
        task.updated_at ||
        task.created_at ||
        0
    )
        .getTime();

}


function getCompletedTimestamp(
    task
) {

    return new Date(
        task.completed_at ||
        task.updated_at ||
        task.created_at ||
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
