from __future__ import annotations


LESSON_CATALOG = {
    "night-it-lands": {
        "predict-leftover": {
            "screen_kind": "predict",
            "prompt": "Rent is $800 and you spend about $40 a day. If you change nothing and just live off the account, how much is left on day 30?",
            "criteria": [],
        },
        "puzzle-route": {
            "screen_kind": "puzzle",
            "prompt": "Route your paycheck so the month survives — and $500 actually gets saved.",
            "criteria": [
                {"id": "saved-target", "label": "At least $500 routed to savings"},
                {"id": "never-borrowed", "label": "Spending money never hits zero"},
            ],
        },
        "quiz-pyf": {"screen_kind": "quiz", "prompt": "Why route savings on payday instead of saving whatever is left at month end?", "criteria": []},
    },
    "missing-740": {
        "quiz-where": {"screen_kind": "quiz", "prompt": "Contract: $3,700. Bank: $2,960. Where did the $740 go?", "criteria": []},
        "predict-employer": {"screen_kind": "predict", "prompt": "Compare what reaches your account with what an employer contributes.", "criteria": []},
        "quiz-lost": {"screen_kind": "quiz", "prompt": "So — is the $740 lost money?", "criteria": []},
    },
    "fixed-vs-flexible": {
        "puzzle-zones": {
            "screen_kind": "puzzle",
            "prompt": "Classify each cost, then absorb the $400 dental bill without touching your savings target.",
            "criteria": [
                {"id": "shock-covered", "label": "The dental bill is fully covered"},
                {"id": "savings-survive", "label": "At least $500 still saved this month"},
                {"id": "no-fixed-mislabel", "label": "Nothing fixed is asked to shrink"},
            ],
        },
        "quiz-fvf": {"screen_kind": "quiz", "prompt": "Why does labeling rent flexible break a budget?", "criteria": []},
    },
    "shock-month": {
        "predict-flex": {
            "screen_kind": "predict",
            "prompt": "Before the shock: if you cut everything cuttable to zero this month, how much could your budget free up?",
            "criteria": [],
        },
        "puzzle-shock": {
            "screen_kind": "puzzle",
            "prompt": "Absorb the $600 laptop without borrowing — and keep at least $400 saved.",
            "criteria": [
                {"id": "shock-covered", "label": "The $600 laptop is fully covered"},
                {"id": "savings-survive", "label": "At least $400 still saved this month"},
                {"id": "no-fixed-mislabel", "label": "Nothing fixed is asked to shrink"},
            ],
        },
        "quiz-shock": {"screen_kind": "quiz", "prompt": "What turns a $600 surprise from a debt event into an inconvenience?", "criteria": []},
    },
    "minimum-payment-trap": {
        "predict-months": {
            "screen_kind": "predict",
            "prompt": "Paying a steady $90 a month on $3,000 at 26% APR — how many months until the balance hits zero?",
            "criteria": [],
        },
        "puzzle-payoff": {
            "screen_kind": "puzzle",
            "prompt": "Find a monthly payment that clears the card within 12 months and keeps total interest under $450.",
            "criteria": [
                {"id": "cleared-by-deadline", "label": "Balance hits zero within 12 months"},
                {"id": "interest-under-cap", "label": "Total interest stays under $450"},
            ],
        },
        "quiz-apr": {"screen_kind": "quiz", "prompt": "Two ways to borrow $3,000: only $90/month or $285/month for 12 months. How do you compare them?", "criteria": []},
    },
}
