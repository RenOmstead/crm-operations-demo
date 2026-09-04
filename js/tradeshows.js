/* =========================================================
   HELIX CRM
   TRADESHOW MANAGEMENT
   ========================================================= */


/* =========================================================
   STORAGE
   ========================================================= */

const EVENT_STORAGE_KEY =
    "helix_crm_tradeshows";


/* =========================================================
   STATE
   ========================================================= */

let events =
    [];

let filteredEvents =
    [];


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeTradeshows
);


function initializeTradeshows() {

    loadEvents();

    bindControls();

    populateOwnerFilter();

    readURLParameters();

    applyFilters();

}


/* =========================================================
   LOAD
   ========================================================= */

function loadEvents() {

    try {

        const stored =
            localStorage.getItem(
                EVENT_STORAGE_KEY
            );


        if (
            stored
        ) {

            events =
                JSON.parse(
                    stored
                );

        }

        else {

            events =
                Array.isArray(
                    window.HELIX_DATA
                        ?.tradeshows
                )
                ?
                [...window.HELIX_DATA.tradeshows]
                :
                [];

        }

    }

    catch (error) {

        console.error(
            "Unable to load tradeshows:",
            error
        );


        events =
            [];

    }


    events =
        events.map(
            normalizeEvent
        );

}


/* =========================================================
   NORMALIZE
   ========================================================= */

function normalizeEvent(
    event
) {

    return {

        id:
            event.id ||
            generateId(),

        name:
            event.name ||
            "",

        status:
            normalizeStatus(
                event.status
            ),

        owner:
            event.owner ||
            "",

        start_date:
            event.start_date ||
            "",

        end_date:
            event.end_date ||
            "",

        city:
            event.city ||
            "",

        state:
            event.state ||
            "",

        venue:
            event.venue ||
            "",

        booth:
            event.booth ||
            "",

        budget:
            normalizeCount(
                event.budget
            ),

        registration_status:
            event.registration_status ||
            "not-started",

        travel_status:
            event.travel_status ||
            "not-started",

        target_companies:
            normalizeCount(
                event.target_companies
            ),

        meetings:
            normalizeCount(
                event.meetings
            ),

        website:
            event.website ||
            "",

        goal:
            event.goal ||
            "",

        target_notes:
            event.target_notes ||
            "",

        checklist:
            event.checklist ||
            "",

        follow_up_status:
            event.follow_up_status ||
            "not-started",

        leads_generated:
            normalizeCount(
                event.leads_generated
            ),

        notes:
            event.notes ||
            "",

        created_at:
            event.created_at ||
            new Date()
                .toISOString(),

        updated_at:
            event.updated_at ||
            ""

    };

}


/* =========================================================
   CONTROLS
   ========================================================= */

function bindControls() {

    document
        .getElementById(
            "addEventButton"
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
            "cancelEventButton"
        )
        ?.addEventListener(
            "click",
            closeDrawer
        );


    document
        .getElementById(
            "eventOverlay"
        )
        ?.addEventListener(
            "click",
            closeDrawer
        );


    document
        .getElementById(
            "eventForm"
        )
        ?.addEventListener(
            "submit",
            saveEventFromForm
        );


    document
        .getElementById(
            "eventSearch"
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
                        "eventSearch"
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
        "timeFilter",
        "ownerFilter",
        "eventSort"
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
            "eventSearch",
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

        const event =
            getEventById(
                id
            );


        if (
            event
        ) {

            setTimeout(
                () => openDrawer(
                    event.id
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
                events
                    .map(
                        event =>
                            event.owner
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
   FILTERS
   ========================================================= */

function applyFilters() {

    const search =
        getValue(
            "eventSearch"
        )
            .toLowerCase();


    const status =
        getValue(
            "statusFilter"
        );


    const time =
        getValue(
            "timeFilter"
        );


    const owner =
        getValue(
            "ownerFilter"
        );


    const sort =
        getValue(
            "eventSort"
        )
        ||
        "date";


    filteredEvents =
        events.filter(
            event => {

                const searchable =
                    [
                        event.name,
                        event.owner,
                        event.city,
                        event.state,
                        event.venue,
                        event.booth,
                        event.goal,
                        event.target_notes,
                        event.notes
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
                        event.status ===
                        status
                    )

                    &&

                    (
                        !owner ||
                        event.owner ===
                        owner
                    )

                    &&

                    matchesTimeFilter(
                        event,
                        time
                    )

                );

            }
        );


    sortEvents(
        filteredEvents,
        sort
    );


    renderEvents();

    renderMetrics();

    renderNextEvent();

}


/* =========================================================
   TIME FILTER
   ========================================================= */

function matchesTimeFilter(
    event,
    filter
) {

    if (
        !filter
    ) {

        return true;

    }


    if (
        !event.start_date
    ) {

        return false;

    }


    const days =
        daysUntil(
            event.start_date
        );


    if (
        filter ===
        "upcoming"
    ) {

        return (
            days >=
            0
        );

    }


    if (
        filter ===
        "past"
    ) {

        return (
            days <
            0
        );

    }


    const max =
        Number(
            filter
        );


    return (
        days >=
        0
        &&
        days <=
        max
    );

}


/* =========================================================
   SORT
   ========================================================= */

function sortEvents(
    list,
    sort
) {

    list.sort(
        (a,b) => {

            if (
                sort ===
                "budget"
            ) {

                return (
                    b.budget -
                    a.budget
                );

            }


            if (
                sort ===
                "targets"
            ) {

                return (
                    b.target_companies -
                    a.target_companies
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
                "name"
            ) {

                return (
                    a.name
                        .localeCompare(
                            b.name
                        )
                );

            }


            return compareDates(
                a.start_date,
                b.start_date
            );

        }
    );

}


/* =========================================================
   RENDER EVENTS
   ========================================================= */

function renderEvents() {

    const container =
        document.getElementById(
            "eventList"
        );


    if (
        !container
    ) {

        return;

    }


    container.innerHTML =
        "";


    setText(
        "visibleEventCount",
        filteredEvents.length
    );


    if (
        !filteredEvents.length
    ) {

        renderEmptyState(
            container
        );

        return;

    }


    filteredEvents.forEach(
        event => {

            container.appendChild(
                createEventCard(
                    event
                )
            );

        }
    );

}


/* =========================================================
   EVENT CARD
   ========================================================= */

function createEventCard(
    event
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "event-card";


    card.innerHTML = `

        <div class="event-card-header">


            <div class="event-date-block">

                <span>
                    ${escapeHTML(formatMonth(event.start_date))}
                </span>

                <strong>
                    ${escapeHTML(formatDay(event.start_date))}
                </strong>

                <span>
                    ${escapeHTML(formatYear(event.start_date))}
                </span>

            </div>



            <div class="event-header-copy">


                <div class="event-topline">

                    <span
                        class="event-status ${escapeHTML(event.status)}"
                    >
                        ${escapeHTML(formatStatus(event.status))}
                    </span>


                    <span class="event-location">

                        ${
                            escapeHTML(
                                formatLocation(
                                    event
                                )
                            )
                        }

                    </span>

                </div>


                <h3>
                    ${escapeHTML(event.name)}
                </h3>


                <div class="event-location">

                    ${
                        escapeHTML(
                            event.venue ||
                            "Venue not recorded"
                        )
                    }

                </div>


            </div>


        </div>



        <div class="event-stats">


            <div class="event-stat">

                <span>
                    BOOTH
                </span>

                <strong>
                    ${escapeHTML(event.booth || "—")}
                </strong>

            </div>


            <div class="event-stat">

                <span>
                    TARGETS
                </span>

                <strong>
                    ${event.target_companies}
                </strong>

            </div>


            <div class="event-stat">

                <span>
                    MEETINGS
                </span>

                <strong>
                    ${event.meetings}
                </strong>

            </div>


            <div class="event-stat">

                <span>
                    BUDGET
                </span>

                <strong>
                    ${formatCurrency(event.budget)}
                </strong>

            </div>


        </div>



        <div class="event-progress">


            <div class="progress-item">

                <span>
                    REGISTRATION
                </span>

                <strong class="${getProgressClass(event.registration_status)}">
                    ${escapeHTML(formatProgress(event.registration_status))}
                </strong>

            </div>


            <div class="progress-item">

                <span>
                    TRAVEL
                </span>

                <strong class="${getProgressClass(event.travel_status)}">
                    ${escapeHTML(formatProgress(event.travel_status))}
                </strong>

            </div>


            <div class="progress-item">

                <span>
                    FOLLOW-UP
                </span>

                <strong class="${getProgressClass(event.follow_up_status)}">
                    ${escapeHTML(formatProgress(event.follow_up_status))}
                </strong>

            </div>


        </div>



        <div class="event-goal">

            <span>
                EVENT GOAL
            </span>

            <p>

                ${
                    escapeHTML(
                        event.goal ||
                        "No event goal has been documented yet."
                    )
                }

            </p>

        </div>



        <div class="event-actions">


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
                ${escapeHTML(getAdvanceLabel(event))}
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
                event.id
            )
        );


    card
        .querySelector(
            '[data-action="duplicate"]'
        )
        ?.addEventListener(
            "click",
            () => duplicateEvent(
                event.id
            )
        );


    card
        .querySelector(
            '[data-action="advance"]'
        )
        ?.addEventListener(
            "click",
            () => advanceEvent(
                event.id
            )
        );


    return card;

}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function renderEmptyState(
    container
) {

    const hasEvents =
        events.length >
        0;


    container.innerHTML = `

        <div class="event-empty">

            <span>

                ${
                    hasEvents
                    ?
                    "NO MATCHING EVENTS"
                    :
                    "EVENT CALENDAR IS EMPTY"
                }

            </span>


            <h3>

                ${
                    hasEvents
                    ?
                    "Nothing matches those filters."
                    :
                    "Start building the event calendar."
                }

            </h3>


            <p>

                ${
                    hasEvents
                    ?
                    "Try adjusting the status, date range, owner, or search."
                    :
                    "Conferences, expos, budgets, travel, booth details, meetings, targets, and follow-up will live here."
                }

            </p>


            ${
                !hasEvents
                ?
                `
                    <button
                        id="emptyAddEvent"
                        type="button"
                    >
                        + ADD FIRST EVENT
                    </button>
                `
                :
                ""
            }

        </div>

    `;


    document
        .getElementById(
            "emptyAddEvent"
        )
        ?.addEventListener(
            "click",
            () => openDrawer()
        );

}


/* =========================================================
   NEXT EVENT
   ========================================================= */

function renderNextEvent() {

    const container =
        document.getElementById(
            "nextEventSpotlight"
        );


    if (
        !container
    ) {

        return;

    }


    const upcoming =
        events
            .filter(
                event =>
                    event.start_date
                    &&
                    daysUntil(
                        event.start_date
                    )
                    >=
                    0
                    &&
                    event.status !==
                    "cancelled"
            )
            .sort(
                (a,b) =>
                    compareDates(
                        a.start_date,
                        b.start_date
                    )
            );


    if (
        !upcoming.length
    ) {

        container.innerHTML = `

            <div class="next-event-empty">
                No upcoming events are currently scheduled.
            </div>

        `;


        return;

    }


    const event =
        upcoming[0];


    const days =
        daysUntil(
            event.start_date
        );


    container.innerHTML = `

        <div class="next-event-card">


            <div class="next-event-date">

                <span>
                    STARTS IN
                </span>

                <strong>
                    ${days}
                </strong>

                <span>
                    DAYS
                </span>

            </div>



            <div class="next-event-main">

                <span>
                    ${escapeHTML(formatDateRange(event))}
                </span>

                <h3>
                    ${escapeHTML(event.name)}
                </h3>

                <p>

                    ${
                        escapeHTML(
                            event.goal ||
                            "Event goal has not been documented yet."
                        )
                    }

                </p>

            </div>



            <div class="next-event-info">

                <span>
                    LOCATION
                </span>

                <strong>
                    ${escapeHTML(formatLocation(event))}
                </strong>

            </div>



            <div class="next-event-info">

                <span>
                    TARGETS / MEETINGS
                </span>

                <strong>
                    ${event.target_companies} / ${event.meetings}
                </strong>

            </div>


        </div>

    `;

}


/* =========================================================
   METRICS
   ========================================================= */

function renderMetrics() {

    const upcoming =
        events.filter(
            event =>
                event.start_date
                &&
                daysUntil(
                    event.start_date
                )
                >=
                0
                &&
                event.status !==
                "cancelled"
        );


    setText(
        "metricUpcoming",
        upcoming.length
    );


    const next =
        [...upcoming]
            .sort(
                (a,b) =>
                    compareDates(
                        a.start_date,
                        b.start_date
                    )
            )[0];


    setText(
        "metricNextDays",
        next
        ?
        daysUntil(
            next.start_date
        )
        :
        "—"
    );


    setText(
        "metricTargets",

        upcoming.reduce(
            (sum,event) =>
                sum +
                event.target_companies,
            0
        )

    );


    setText(
        "metricMeetings",

        events.reduce(
            (sum,event) =>
                sum +
                event.meetings,
            0
        )

    );


    const budget =
        upcoming.reduce(
            (sum,event) =>
                sum +
                event.budget,
            0
        );


    setText(
        "metricBudget",
        formatCurrency(
            budget
        )
    );

}


/* =========================================================
   ADVANCE STATUS
   ========================================================= */

function advanceEvent(
    id
) {

    const event =
        getEventById(
            id
        );


    if (
        !event
    ) {

        return;

    }


    const next = {

        researching:
            "planning",

        planning:
            "confirmed",

        confirmed:
            "attending",

        attending:
            "completed",

        completed:
            "completed",

        cancelled:
            "cancelled"

    };


    event.status =
        next[
            event.status
        ]
        ||
        event.status;


    event.updated_at =
        new Date()
            .toISOString();


    saveEvents();

    applyFilters();

}


/* =========================================================
   ADVANCE LABEL
   ========================================================= */

function getAdvanceLabel(
    event
) {

    const labels = {

        researching:
            "START PLANNING",

        planning:
            "CONFIRM",

        confirmed:
            "ATTENDING",

        attending:
            "COMPLETE",

        completed:
            "COMPLETED",

        cancelled:
            "CANCELLED"

    };


    return (
        labels[
            event.status
        ]
        ||
        "UPDATE"
    );

}


/* =========================================================
   DUPLICATE
   ========================================================= */

function duplicateEvent(
    id
) {

    const event =
        getEventById(
            id
        );


    if (
        !event
    ) {

        return;

    }


    events.push(
        {

            ...event,

            id:
                generateId(),

            name:
                `${event.name} Copy`,

            status:
                "researching",

            start_date:
                "",

            end_date:
                "",

            meetings:
                0,

            leads_generated:
                0,

            follow_up_status:
                "not-started",

            created_at:
                new Date()
                    .toISOString(),

            updated_at:
                new Date()
                    .toISOString()

        }
    );


    saveEvents();

    populateOwnerFilter();

    applyFilters();

}


/* =========================================================
   DRAWER
   ========================================================= */

function openDrawer(
    id = null
) {

    resetForm();


    if (
        id
    ) {

        loadEventIntoForm(
            id
        );

    }


    const overlay =
        document.getElementById(
            "eventOverlay"
        );


    const drawer =
        document.getElementById(
            "eventDrawer"
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
            "eventOverlay"
        );


    const drawer =
        document.getElementById(
            "eventDrawer"
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
            "eventForm"
        )
        ?.reset();


    setValue(
        "editingEventId",
        ""
    );


    setValue(
        "eventStatus",
        "researching"
    );


    setValue(
        "registrationStatus",
        "not-started"
    );


    setValue(
        "travelStatus",
        "not-started"
    );


    setValue(
        "followUpStatus",
        "not-started"
    );


    setValue(
        "eventBudget",
        "0"
    );


    setValue(
        "eventTargets",
        "0"
    );


    setValue(
        "eventMeetings",
        "0"
    );


    setValue(
        "leadsGenerated",
        "0"
    );


    setText(
        "drawerTitle",
        "Add event"
    );


    setText(
        "saveEventLabel",
        "SAVE EVENT"
    );

}


/* =========================================================
   LOAD FORM
   ========================================================= */

function loadEventIntoForm(
    id
) {

    const event =
        getEventById(
            id
        );


    if (
        !event
    ) {

        return;

    }


    setValue(
        "editingEventId",
        event.id
    );


    setValue(
        "eventName",
        event.name
    );


    setValue(
        "eventStatus",
        event.status
    );


    setValue(
        "eventOwner",
        event.owner
    );


    setValue(
        "eventStartDate",
        event.start_date
    );


    setValue(
        "eventEndDate",
        event.end_date
    );


    setValue(
        "eventCity",
        event.city
    );


    setValue(
        "eventState",
        event.state
    );


    setValue(
        "eventVenue",
        event.venue
    );


    setValue(
        "eventBooth",
        event.booth
    );


    setValue(
        "eventBudget",
        event.budget
    );


    setValue(
        "registrationStatus",
        event.registration_status
    );


    setValue(
        "travelStatus",
        event.travel_status
    );


    setValue(
        "eventTargets",
        event.target_companies
    );


    setValue(
        "eventMeetings",
        event.meetings
    );


    setValue(
        "eventWebsite",
        event.website
    );


    setValue(
        "eventGoal",
        event.goal
    );


    setValue(
        "eventTargetsNote",
        event.target_notes
    );


    setValue(
        "eventChecklist",
        event.checklist
    );


    setValue(
        "followUpStatus",
        event.follow_up_status
    );


    setValue(
        "leadsGenerated",
        event.leads_generated
    );


    setValue(
        "eventNotes",
        event.notes
    );


    setText(
        "drawerTitle",
        "Edit event"
    );


    setText(
        "saveEventLabel",
        "UPDATE EVENT"
    );

}


/* =========================================================
   SAVE FORM
   ========================================================= */

function saveEventFromForm(
    event
) {

    event.preventDefault();


    const name =
        getValue(
            "eventName"
        );


    if (
        !name
    ) {

        return;

    }


    const editingId =
        getValue(
            "editingEventId"
        );


    const existing =
        editingId
        ?
        getEventById(
            editingId
        )
        :
        null;


    const record = {

        id:
            editingId ||
            generateId(),

        name,

        status:
            normalizeStatus(
                getValue(
                    "eventStatus"
                )
            ),

        owner:
            getValue(
                "eventOwner"
            ),

        start_date:
            getValue(
                "eventStartDate"
            ),

        end_date:
            getValue(
                "eventEndDate"
            ),

        city:
            getValue(
                "eventCity"
            ),

        state:
            getValue(
                "eventState"
            ),

        venue:
            getValue(
                "eventVenue"
            ),

        booth:
            getValue(
                "eventBooth"
            ),

        budget:
            normalizeCount(
                getValue(
                    "eventBudget"
                )
            ),

        registration_status:
            getValue(
                "registrationStatus"
            ),

        travel_status:
            getValue(
                "travelStatus"
            ),

        target_companies:
            normalizeCount(
                getValue(
                    "eventTargets"
                )
            ),

        meetings:
            normalizeCount(
                getValue(
                    "eventMeetings"
                )
            ),

        website:
            getValue(
                "eventWebsite"
            ),

        goal:
            getValue(
                "eventGoal"
            ),

        target_notes:
            getValue(
                "eventTargetsNote"
            ),

        checklist:
            getValue(
                "eventChecklist"
            ),

        follow_up_status:
            getValue(
                "followUpStatus"
            ),

        leads_generated:
            normalizeCount(
                getValue(
                    "leadsGenerated"
                )
            ),

        notes:
            getValue(
                "eventNotes"
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
            events.findIndex(
                item =>
                    String(
                        item.id
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

            events[index] =
                record;

        }

    }

    else {

        events.push(
            record
        );

    }


    saveEvents();

    populateOwnerFilter();

    closeDrawer();

    applyFilters();

}


/* =========================================================
   STORAGE
   ========================================================= */

function saveEvents() {

    localStorage.setItem(
        EVENT_STORAGE_KEY,
        JSON.stringify(
            events
        )
    );

}


/* =========================================================
   LOOKUP
   ========================================================= */

function getEventById(
    id
) {

    return events.find(
        event =>
            String(
                event.id
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
   STATUS
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

        "researching",
        "planning",
        "confirmed",
        "attending",
        "completed",
        "cancelled"

    ];


    return valid.includes(
        status
    )
        ?
        status
        :
        "researching";

}


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


/* =========================================================
   PROGRESS
   ========================================================= */

function formatProgress(
    value
) {

    const labels = {

        "not-started":
            "Not Started",

        "in-progress":
            "In Progress",

        complete:
            "Complete",

        booked:
            "Booked",

        "not-needed":
            "Not Needed",

        "not-applicable":
            "Not Applicable"

    };


    return (
        labels[
            value
        ]
        ||
        value
        ||
        "—"
    );

}


function getProgressClass(
    value
) {

    if (
        value ===
        "complete"
        ||
        value ===
        "booked"
        ||
        value ===
        "not-needed"
        ||
        value ===
        "not-applicable"
    ) {

        return "good";

    }


    return "warning";

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


function formatMonth(
    value
) {

    if (
        !value
    ) {

        return "TBD";

    }


    return new Date(
        `${value}T12:00:00`
    )
        .toLocaleDateString(
            "en-US",
            {
                month:
                    "short"
            }
        )
        .toUpperCase();

}


function formatDay(
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
        .getDate();

}


function formatYear(
    value
) {

    if (
        !value
    ) {

        return "";

    }


    return new Date(
        `${value}T12:00:00`
    )
        .getFullYear();

}


function formatDateRange(
    event
) {

    if (
        !event.start_date
    ) {

        return "DATE TBD";

    }


    const start =
        new Date(
            `${event.start_date}T12:00:00`
        );


    const startLabel =
        start.toLocaleDateString(
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


    if (
        !event.end_date
        ||
        event.end_date ===
        event.start_date
    ) {

        return startLabel;

    }


    const end =
        new Date(
            `${event.end_date}T12:00:00`
        );


    return (
        `${startLabel} — `
        +
        end.toLocaleDateString(
            "en-US",
            {
                month:
                    "short",

                day:
                    "numeric",

                year:
                    "numeric"
            }
        )
    );

}


/* =========================================================
   LOCATION
   ========================================================= */

function formatLocation(
    event
) {

    return [

        event.city,

        event.state

    ]
        .filter(Boolean)
        .join(", ")
        ||
        "Location TBD";

}


/* =========================================================
   CURRENCY
   ========================================================= */

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


/* =========================================================
   NORMALIZE COUNT
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


/* =========================================================
   UPDATED
   ========================================================= */

function getUpdatedTimestamp(
    event
) {

    return new Date(
        event.updated_at ||
        event.created_at ||
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
