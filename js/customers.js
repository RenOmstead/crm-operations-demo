/* =========================================================
   HELIX CRM
   CUSTOMERS
   ========================================================= */


/* =========================================================
   PAGE
   ========================================================= */

.customers-page {
    width:
        min(
            1580px,
            calc(100% - 48px)
        );

    margin:
        0 auto;

    padding:
        28px 0
        90px;
}


/* =========================================================
   HERO
   ========================================================= */

.customers-hero {
    min-height:
        315px;

    display:
        grid;

    grid-template-columns:
        minmax(0,1fr)
        310px;

    align-items:
        end;

    gap:
        60px;

    padding:
        48px 0;
}


.hero-copy {
    max-width:
        930px;
}


.eyebrow {
    display:
        inline-block;

    padding:
        5px 8px;

    border:
        2px solid
        var(--ink);

    background:
        var(--aqua);

    box-shadow:
        3px 3px 0
        var(--ink);

    font-family:
        "Courier New",
        monospace;

    font-size:
        .53rem;

    font-weight:
        900;

    letter-spacing:
        .12em;
}


.customers-hero h1 {
    margin:
        18px 0 0;

    max-width:
        900px;

    font-size:
        clamp(
            3.5rem,
            6.2vw,
            7rem
        );

    font-weight:
        1000;

    line-height:
        .83;

    letter-spacing:
        -.075em;
}


.customers-hero h1 span {
    position:
        relative;

    color:
        var(--pink);
}


.customers-hero h1 span::after {
    content: "";

    position:
        absolute;

    left:
        0;

    right:
        0;

    bottom:
        -5px;

    height:
        9px;

    z-index:
        -1;

    background:
        var(--yellow);
}


.customers-hero p {
    max-width:
        680px;

    margin:
        25px 0 0;

    color:
        var(--muted);

    font-size:
        .82rem;

    font-weight:
        600;

    line-height:
        1.7;
}


/* =========================================================
   HERO ACTION
   ========================================================= */

.hero-action-wrap {
    position:
        relative;

    padding-top:
        25px;
}


.hero-sticker {
    position:
        absolute;

    top:
        0;

    right:
        12px;

    z-index:
        3;

    padding:
        7px 9px;

    border:
        2px solid
        var(--ink);

    background:
        var(--yellow);

    box-shadow:
        3px 3px 0
        var(--ink);

    font-family:
        "Courier New",
        monospace;

    font-size:
        .48rem;

    font-weight:
        900;

    transform:
        rotate(3deg);
}


.add-customer-button {
    width:
        100%;

    min-height:
        105px;

    display:
        flex;

    align-items:
        center;

    justify-content:
        space-between;

    gap:
        25px;

    padding:
        0 24px;

    border:
        3px solid
        var(--ink);

    background:
        var(--pink);

    box-shadow:
        8px 8px 0
        var(--ink);

    color:
        var(--ink);

    cursor:
        pointer;

    transition:
        transform .12s ease,
        box-shadow .12s ease,
        background .12s ease;
}


.add-customer-button:hover {
    transform:
        translate(4px,4px);

    box-shadow:
        4px 4px 0
        var(--ink);

    background:
        var(--acid);
}


.add-customer-button span {
    font-family:
        "Courier New",
        monospace;

    font-size:
        .62rem;

    font-weight:
        900;

    letter-spacing:
        .09em;
}


.add-customer-button strong {
    font-size:
        2.4rem;
}


/* =========================================================
   METRICS
   ========================================================= */

.customer-metrics {
    display:
        grid;

    grid-template-columns:
        repeat(4,1fr);

    gap:
        16px;

    margin-bottom:
        26px;
}


.customer-metric {
    position:
        relative;

    min-height:
        145px;

    padding:
        18px;

    border:
        3px solid
        var(--ink);

    box-shadow:
        5px 5px 0
        var(--ink);

    overflow:
        hidden;
}


.metric-total {
    background:
        var(--aqua);
}


.metric-active {
    background:
        var(--acid);
}


.metric-prospect {
    background:
        var(--lavender);
}


.metric-value {
    background:
        var(--yellow);
}


.customer-metric > span {
    display:
        block;

    font-family:
        "Courier New",
        monospace;

    font-size:
        .48rem;

    font-weight:
        900;

    letter-spacing:
        .09em;
}


.customer-metric strong {
    display:
        block;

    margin-top:
        16px;

    font-size:
        2.4rem;

    font-weight:
        1000;

    line-height:
        1;
}


.customer-metric small {
    display:
        block;

    margin-top:
        7px;

    font-size:
        .55rem;

    font-weight:
        700;
}


/* =========================================================
   TOOLBAR
   ========================================================= */

.customer-toolbar {
    display:
        grid;

    grid-template-columns:
        minmax(330px,1fr)
        repeat(3,auto);

    gap:
        10px;

    margin-bottom:
        32px;
}


.customer-search {
    min-height:
        58px;

    display:
        flex;

    align-items:
        center;

    border:
        3px solid
        var(--ink);

    background:
        white;

    box-shadow:
        4px 4px 0
        var(--ink);
}


.customer-search > span {
    width:
        55px;

    display:
        grid;

    place-items:
        center;

    color:
        var(--pink);

    font-size:
        1.2rem;

    font-weight:
        1000;
}


.customer-search input {
    flex:
        1;

    min-width:
        0;

    min-height:
        54px;

    border:
        none;

    outline:
        none;

    background:
        transparent;

    color:
        var(--ink);

    font-size:
        .72rem;

    font-weight:
        700;
}


.customer-toolbar select {
    min-width:
        155px;

    min-height:
        58px;

    padding:
        0 13px;

    border:
        3px solid
        var(--ink);

    outline:
        none;

    background:
        var(--cream);

    box-shadow:
        4px 4px 0
        var(--ink);

    color:
        var(--ink);

    cursor:
        pointer;

    font-family:
        "Courier New",
        monospace;

    font-size:
        .52rem;

    font-weight:
        900;
}


/* =========================================================
   DIRECTORY HEADING
   ========================================================= */

.directory-heading {
    display:
        flex;

    align-items:
        flex-end;

    justify-content:
        space-between;

    gap:
        30px;

    margin-bottom:
        17px;

    padding-bottom:
        13px;

    border-bottom:
        3px solid
        var(--ink);
}


.directory-heading > div:first-child > span {
    color:
        var(--blue);

    font-family:
        "Courier New",
        monospace;

    font-size:
        .49rem;

    font-weight:
        900;

    letter-spacing:
        .1em;
}


.directory-heading h2 {
    margin:
        6px 0 0;

    font-size:
        1.65rem;

    font-weight:
        1000;
}


.visible-count {
    display:
        flex;

    align-items:
        baseline;

    gap:
        7px;
}


.visible-count strong {
    color:
        var(--pink);

    font-size:
        1.8rem;

    font-weight:
        1000;
}


.visible-count span {
    font-family:
        "Courier New",
        monospace;

    font-size:
        .48rem;

    font-weight:
        900;
}


/* =========================================================
   GRID
   ========================================================= */

.customer-grid {
    display:
        grid;

    grid-template-columns:
        repeat(3,minmax(0,1fr));

    gap:
        22px;
}


/* =========================================================
   CUSTOMER CARD
   ========================================================= */

.customer-card {
    position:
        relative;

    min-height:
        335px;

    display:
        flex;

    flex-direction:
        column;

    border:
        3px solid
        var(--ink);

    background:
        white;

    box-shadow:
        7px 7px 0
        var(--ink);

    overflow:
        hidden;

    transition:
        transform .12s ease,
        box-shadow .12s ease;
}


.customer-card:hover {
    transform:
        translate(3px,3px);

    box-shadow:
        4px 4px 0
        var(--ink);
}


.customer-card:nth-child(4n+1)
.customer-card-head {
    background:
        var(--aqua);
}


.customer-card:nth-child(4n+2)
.customer-card-head {
    background:
        var(--yellow);
}


.customer-card:nth-child(4n+3)
.customer-card-head {
    background:
        var(--lavender);
}


.customer-card:nth-child(4n+4)
.customer-card-head {
    background:
        var(--pink-soft);
}


/* =========================================================
   CARD HEADER
   ========================================================= */

.customer-card-head {
    min-height:
        128px;

    display:
        grid;

    grid-template-columns:
        72px
        minmax(0,1fr);

    align-items:
        stretch;

    border-bottom:
        3px solid
        var(--ink);
}


.customer-monogram {
    display:
        grid;

    place-items:
        center;

    border-right:
        3px solid
        var(--ink);

    background:
        var(--ink);

    color:
        white;

    font-size:
        1.2rem;

    font-weight:
        1000;
}


.customer-title-wrap {
    display:
        flex;

    flex-direction:
        column;

    justify-content:
        center;

    padding:
        18px;
}


.status-pill {
    width:
        fit-content;

    margin-bottom:
        9px;

    padding:
        5px 7px;

    border:
        2px solid
        var(--ink);

    background:
        white;

    box-shadow:
        2px 2px 0
        var(--ink);

    font-family:
        "Courier New",
        monospace;

    font-size:
        .43rem;

    font-weight:
        900;

    text-transform:
        uppercase;
}


.status-pill.active {
    background:
        var(--acid);
}


.status-pill.prospect {
    background:
        var(--yellow);
}


.status-pill.partner {
    background:
        var(--pink);
}


.status-pill.inactive {
    background:
        #d8d8d8;
}


.customer-title-wrap h3 {
    margin:
        0;

    font-size:
        1rem;

    font-weight:
        1000;

    line-height:
        1.2;
}


/* =========================================================
   CARD BODY
   ========================================================= */

.customer-card-body {
    flex:
        1;

    padding:
        17px;
}


.customer-meta-grid {
    display:
        grid;

    grid-template-columns:
        1fr
        1fr;

    border:
        2px solid
        var(--ink);
}


.customer-meta {
    min-height:
        69px;

    padding:
        10px;
}


.customer-meta:nth-child(odd) {
    border-right:
        2px solid
        var(--ink);
}


.customer-meta:nth-child(-n+2) {
    border-bottom:
        2px solid
        var(--ink);
}


.customer-meta span {
    display:
        block;

    color:
        var(--muted);

    font-family:
        "Courier New",
        monospace;

    font-size:
        .42rem;

    font-weight:
        900;

    letter-spacing:
        .06em;
}


.customer-meta strong {
    display:
        block;

    margin-top:
        6px;

    font-size:
        .64rem;

    line-height:
        1.3;
}


.customer-description {
    margin:
        14px 0 0;

    color:
        var(--muted);

    font-size:
        .61rem;

    line-height:
        1.55;
}


/* =========================================================
   CARD ACTIONS
   ========================================================= */

.customer-card-actions {
    display:
        grid;

    grid-template-columns:
        1fr
        1fr
        1fr;

    border-top:
        3px solid
        var(--ink);
}


.customer-card-actions > * {
    min-height:
        48px;

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

    border:
        none;

    border-right:
        2px solid
        var(--ink);

    background:
        white;

    color:
        var(--ink);

    cursor:
        pointer;

    font-family:
        "Courier New",
        monospace;

    font-size:
        .47rem;

    font-weight:
        900;
}


.customer-card-actions > *:last-child {
    border-right:
        none;
}


.customer-card-actions > *:hover {
    background:
        var(--acid);
}


/* =========================================================
   EMPTY STATE
   ========================================================= */

.customer-empty {
    grid-column:
        1 / -1;

    min-height:
        390px;

    display:
        grid;

    grid-template-columns:
        minmax(0,1fr)
        180px;

    align-items:
        center;

    gap:
        30px;

    padding:
        40px;

    border:
        3px solid
        var(--ink);

    background:
        var(--aqua);

    box-shadow:
        8px 8px 0
        var(--ink);
}


.customer-empty h3 {
    margin:
        8px 0 0;

    font-size:
        2rem;

    font-weight:
        1000;
}


.customer-empty p {
    max-width:
        520px;

    margin:
        12px 0 20px;

    font-size:
        .7rem;

    line-height:
        1.6;
}


.empty-label {
    font-family:
        "Courier New",
        monospace;

    font-size:
        .5rem;

    font-weight:
        900;

    letter-spacing:
        .1em;
}


.customer-empty button {
    padding:
        13px 16px;

    border:
        3px solid
        var(--ink);

    background:
        var(--pink);

    box-shadow:
        4px 4px 0
        var(--ink);

    cursor:
        pointer;

    font-family:
        "Courier New",
        monospace;

    font-size:
        .52rem;

    font-weight:
        900;
}


.empty-art {
    width:
        155px;

    height:
        155px;

    display:
        grid;

    place-items:
        center;

    border:
        3px solid
        var(--ink);

    background:
        var(--yellow);

    box-shadow:
        8px 8px 0
        var(--pink);

    font-size:
        4rem;

    font-weight:
        1000;

    transform:
        rotate(5deg);
}


/* =========================================================
   OVERLAY
   ========================================================= */

.customer-overlay {
    position:
        fixed;

    inset:
        0;

    z-index:
        1900;

    background:
        rgba(21,21,21,.68);

    opacity:
        0;

    transition:
        opacity .18s ease;
}


.customer-overlay.open {
    opacity:
        1;
}


/* =========================================================
   DRAWER
   ========================================================= */

.customer-drawer {
    position:
        fixed;

    top:
        0;

    right:
        0;

    bottom:
        0;

    z-index:
        2000;

    width:
        min(
            660px,
            100%
        );

    overflow-y:
        auto;

    background:
        var(--cream);

    border-left:
        3px solid
        var(--ink);

    box-shadow:
        -10px 0 0
        var(--pink);

    transform:
        translateX(110%);

    transition:
        transform .22s ease;
}


.customer-drawer.open {
    transform:
        translateX(0);
}


body.drawer-open {
    overflow:
        hidden;
}


/* =========================================================
   DRAWER TOP
   ========================================================= */

.drawer-top {
    min-height:
        115px;

    display:
        flex;

    align-items:
        center;

    justify-content:
        space-between;

    gap:
        20px;

    padding:
        24px 27px;

    border-bottom:
        3px solid
        var(--ink);

    background:
        var(--yellow);
}


.drawer-kicker {
    font-family:
        "Courier New",
        monospace;

    font-size:
        .49rem;

    font-weight:
        900;

    letter-spacing:
        .11em;
}


.drawer-top h2 {
    margin:
        7px 0 0;

    font-size:
        1.5rem;

    font-weight:
        1000;
}


.drawer-close {
    width:
        46px;

    height:
        46px;

    display:
        grid;

    place-items:
        center;

    border:
        3px solid
        var(--ink);

    background:
        var(--pink);

    box-shadow:
        3px 3px 0
        var(--ink);

    cursor:
        pointer;

    font-size:
        1.5rem;

    font-weight:
        900;
}


/* =========================================================
   FORM
   ========================================================= */

.customer-form {
    display:
        grid;

    grid-template-columns:
        1fr
        1fr;

    gap:
        17px;

    padding:
        28px;
}


.form-group {
    display:
        flex;

    flex-direction:
        column;

    gap:
        7px;
}


.form-group.full,
.drawer-actions.full {
    grid-column:
        1 / -1;
}


.form-group label {
    font-family:
        "Courier New",
        monospace;

    font-size:
        .47rem;

    font-weight:
        900;

    letter-spacing:
        .08em;

    text-transform:
        uppercase;
}


.form-group input,
.form-group select,
.form-group textarea {
    width:
        100%;

    border:
        3px solid
        var(--ink);

    outline:
        none;

    background:
        white;

    color:
        var(--ink);

    box-shadow:
        3px 3px 0
        var(--ink);
}


.form-group input,
.form-group select {
    min-height:
        48px;

    padding:
        0 11px;
}


.form-group textarea {
    padding:
        11px;

    resize:
        vertical;

    line-height:
        1.5;
}


.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    background:
        #fff6c9;

    box-shadow:
        5px 5px 0
        var(--blue);
}


/* =========================================================
   FORM ACTIONS
   ========================================================= */

.drawer-actions {
    display:
        grid;

    grid-template-columns:
        1fr
        1.4fr;

    gap:
        10px;

    margin-top:
        9px;
}


.secondary-button,
.save-button {
    min-height:
        56px;

    border:
        3px solid
        var(--ink);

    box-shadow:
        4px 4px 0
        var(--ink);

    cursor:
        pointer;

    font-family:
        "Courier New",
        monospace;

    font-size:
        .53rem;

    font-weight:
        900;
}


.secondary-button {
    background:
        white;
}


.save-button {
    display:
        flex;

    align-items:
        center;

    justify-content:
        space-between;

    padding:
        0 18px;

    background:
        var(--acid);
}


.secondary-button:hover,
.save-button:hover {
    transform:
        translate(2px,2px);

    box-shadow:
        2px 2px 0
        var(--ink);
}


/* =========================================================
   RESPONSIVE
   ========================================================= */

@media (max-width: 1250px) {

    .customer-grid {
        grid-template-columns:
            repeat(2,minmax(0,1fr));
    }


    .customer-toolbar {
        grid-template-columns:
            1fr
            1fr
            1fr;
    }


    .customer-search {
        grid-column:
            1 / -1;
    }

}


@media (max-width: 900px) {

    .customers-page {
        width:
            calc(100% - 28px);
    }


    .customers-hero {
        grid-template-columns:
            1fr;

        min-height:
            0;
    }


    .customer-metrics {
        grid-template-columns:
            1fr
            1fr;
    }


    .customer-grid {
        grid-template-columns:
            1fr;
    }


    .hero-action-wrap {
        max-width:
            450px;
    }

}


@media (max-width: 620px) {

    .customers-hero h1 {
        font-size:
            3.3rem;
    }


    .customer-metrics {
        grid-template-columns:
            1fr;
    }


    .customer-toolbar {
        grid-template-columns:
            1fr;
    }


    .customer-search {
        grid-column:
            auto;
    }


    .customer-toolbar select {
        width:
            100%;
    }


    .directory-heading {
        align-items:
            flex-start;

        flex-direction:
            column;
    }


    .customer-form {
        grid-template-columns:
            1fr;

        padding:
            22px 18px;
    }


    .form-group.full,
    .drawer-actions.full {
        grid-column:
            auto;
    }


    .drawer-actions {
        grid-template-columns:
            1fr;
    }


    .customer-empty {
        grid-template-columns:
            1fr;
    }

}
