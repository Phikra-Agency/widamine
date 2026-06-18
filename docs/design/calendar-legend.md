# Calendar Key Redesign Spec

## Goal
Redesign the calendar legend so it keeps the client’s requested **motif-to-color association** while reducing visual noise, improving scanability, and preserving a human, ergonomic feel.

The current problem is not color itself. The problem is **too many equal-weight labels competing at once**. The solution is to shift from a flat legend to a **hierarchical color language** with progressive disclosure.

---

## Core design principle
**Color should identify families, not compete with labels.**

The calendar must answer three questions quickly:
1. **What kind of action is this?**
2. **How urgent or important is it?**
3. **What motif is it associated with?**

The design should support these questions in that order.

---

## Redesign strategy

### 1) Group motifs into color families
Do not assign a unique visual weight to every motif chip in the default view.
Instead, create **higher-level families** such as:
- Consultation
- Follow-up
- Treatment / Procedure
- Post-op / Control
- Urgent / Exception
- Aesthetic / Specialty

Each family has one primary color identity.
Individual motifs then live inside the family as secondary labels or selectable details.

This preserves the client’s “color association between motifs” without forcing the UI to display 12–20 equally loud keys.

### 2) Use a two-layer legend
The legend should have two states:

**Default state**
- Show only the major families.
- Show the most important motifs as examples, not all of them.
- Keep it compact and calm.

**Expanded state**
- Reveal all motifs inside a collapsible panel, dropdown, or drawer.
- Use this when the user needs precision.

### 3) Let the calendar cells carry the detail
The legend should explain the system, but the cells should do the heavy lifting.
Inside each event card, keep:
- time
- motif name
- optional sublabel
- one small color marker

This keeps the legend from becoming a wall of tags.

---

## Information architecture

### Top area
Replace the current long chip wall with a compact control bar:
- `Legend` toggle
- `Filter` by family
- `Search` motif / patient / room
- `Today` shortcut
- `Week range`

### Legend area
Use a compact, structured legend:

**Family row**
- Color chip
- Family name
- Count of motifs in that family
- Optional expand chevron

Example:
- Blue — Consultation — 5 motifs
- Teal — Follow-up — 4 motifs
- Orange — Pre-op / Preparation — 3 motifs
- Pink — Laser / Energy — 2 motifs
- Red — Urgent — 1 motif

### Expanded legend panel
Each family expands into a nested list:
- Consultation
  - Consultation initiale
  - Consultation BBL
  - Consultation soin visage
- Follow-up
  - Suivi post-augmentation
  - Suivi post-bbl
  - Suivi de suivi

This structure keeps the user oriented while still honoring the motif-color contract.

---

## Color system rules

### Rule 1 — One family, one core hue
Each family gets a stable base hue.
Variations in shade can represent subtypes, but only within the same family.

### Rule 2 — Limit saturation in the legend
The legend should use **medium saturation** and calm tones.
Reserve stronger saturation for active events, urgent states, and important badges.

### Rule 3 — Do not use color alone
Because the palette becomes crowded quickly, every colored item must also carry one of:
- motif text
- icon
- family label
- status label

### Rule 4 — Use color for recognition, not decoration
If a color does not help a user distinguish or remember a category, remove it.

### Rule 5 — Avoid a rainbow effect
No more than **6–7 visible legend families** at once.
Any extra motifs must be grouped or hidden behind expansion.

---

## Suggested hierarchy

### Level 1: Operational meaning
These are the primary categories the user should see first.
- Consultation
- Follow-up
- Procedure / Treatment
- Post-op / Control
- Urgent
- Administrative / Exception

### Level 2: Motif detail
These are shown only on hover, expansion, or cell detail.
- Consultation initiale
- Consultation augmentation
- Consultation BBL
- Soin visage
- Peeling visage
- Laser
- Pré-opératoire
- Contrôle post-op

### Level 3: Specific instance context
Shown in the event card or drawer.
- patient name
- room
- surgeon / staff
- notes
- completion status

---

## Visual language

### Tone
The interface should feel:
- clinical but warm
- organized but not sterile
- premium but not luxurious for its own sake
- calm under pressure

### Shape
- Use soft rounded chips and cards.
- Keep borders thin and consistent.
- Avoid excessive shadow layering.
- Prefer gentle contrast over loud gradients.

### Density
- High information density is acceptable.
- High visual density is not.

The UI may contain many events, but the surface must remain readable and quiet.

---

## Brand language

### Brand positioning
The calendar should communicate:
- precision
- trust
- competence
- calm control
- medical professionalism with human warmth

### Voice
Use language that is:
- short
- direct
- reassuring
- operational

Avoid:
- overly decorative phrasing
- marketing-style language in critical workflows
- abstract names that hide meaning

### Naming rules
Use names that are:
- understandable to staff immediately
- stable over time
- consistent across filters, cards, and reports

Prefer:
- `Consultation initiale`
- `Suivi post-op`
- `Contrôle post-op`
- `Pré-opératoire`

Avoid vague labels like:
- `Global`
- `Special`
- `Advanced`
- `Session 2`

Unless the clinic already uses them in real operations.

---

## UX rules

### 1) Default to compressed clarity
The default screen should show only what is needed to act now.
No user should need to parse a full motif universe just to understand the week.

### 2) Reveal detail on demand
Use hover, click, expansion, and drawers for detail.
The interface should reward attention, not demand it immediately.

### 3) Reduce equal visual weight
Not every motif deserves the same presence.
Important states should stand out; secondary states should recede.

### 4) Keep the legend actionable
The legend must support actions:
- filter by color family
- hide family
- search motif
- inspect definition

### 5) Respect non-technical users
A user should never have to understand the data model to use the calendar.
The calendar should feel like a desk tool, not a system diagram.

---

## Recommended component structure

### A. Compact legend header
A single line of summary:
- `6 active families · 18 motifs · 96 slots`

### B. Family chips
Clickable chips with:
- color dot or pill
- family name
- count
- optional expand arrow

### C. Expandable details panel
Hidden by default.
Shows all motifs under the selected family.

### D. Event cards
Each event card contains:
- time badge
- motif name
- one-line sublabel
- small color accent

### E. Empty-state behavior
When filters remove all visible events, show a calm message:
- `No events match the selected families`

---

## Practical consolidation model

### Option A — Strongest recommendation
Merge motifs into families and show only families in the main legend.
Motifs remain visible in event cards and expandable details.

This is the best balance of clarity and brand promise.

### Option B — Hybrid matrix
Show only the most common motifs as direct chips.
Fold the rest into families.

Useful if the client insists that several motif names remain directly visible.

### Option C — Progressive disclosure
Show a small set of featured motifs for the current week.
Everything else lives in a filter drawer.

Useful when operations change often and the weekly mix matters more than the full ontology.

---

## What not to do
- Do not display 15–20 equally prominent legend chips by default.
- Do not use too many hues with similar visual weight.
- Do not hide important operational meaning behind aesthetic minimalism.
- Do not make the legend look like decoration.
- Do not let the calendar become a taxonomy viewer.

---

## Final rule set
1. Color maps to **families first**, motifs second.
2. Default view shows **few, meaningful categories**.
3. Detail lives in **expansion, hover, and cards**.
4. The interface must feel **calm, precise, and human**.
5. Every color must serve a **real operational purpose**.

---

## One-line design direction
**Make the legend smaller, smarter, and layered — not broader.**

