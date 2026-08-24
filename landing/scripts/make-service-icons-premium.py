#!/usr/bin/env python3
"""
Premium service icon generator for Widamine.
Creates thin-stroke SVG masks (black on transparent) for CSS mask-image.
Each icon is a soft pill + centered line icon per service, tinted at runtime
via motif.color.

Usage: python make-service-icons-premium.py
Outputs to: landing/public/images/services/*.svg (premium)
Backup of previous is in _backup/
"""
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), "../public/images/services")
SERVICES = {
    "suivi": {
        "label": "Suivi — clipboard check",
        "svg": '''<path d="M7.5 4.5h9v2.2a1.6 1.6 0 0 1-1.6 1.6H9.1A1.6 1.6 0 0 1 7.5 6.7V4.5Z" fill="none" stroke="black" stroke-width="1.3" stroke-linejoin="round"/>
<rect x="6.2" y="7.5" width="11.6" height="13.2" rx="2.2" fill="none" stroke="black" stroke-width="1.25"/>
<path d="M8.8 13.2l1.9 1.9 4.2-4.2" fill="none" stroke="black" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>''',
    },
    "bilan": {
        "label": "Bilan — chart + pulse",
        "svg": '''<path d="M5 16.5h14" stroke="black" stroke-width="1.2" stroke-linecap="round"/>
<rect x="6" y="11.5" width="3" height="5" rx="1" fill="black"/>
<rect x="10.5" y="8.5" width="3" height="8" rx="1" fill="black"/>
<rect x="15" y="5.5" width="3" height="11" rx="1" fill="black"/>
<path d="M3.5 4.2h17" stroke="black" stroke-width="1.1" stroke-linecap="round" opacity="0.9"/>''',
    },
    "peeling": {
        "label": "Peeling — face + sparkle",
        "svg": '''<path d="M12 4.2c-3.9 0-6.8 3-6.8 6.9 0 2.7 1.5 5.1 3.9 6.3.2.1.5.1.7 0A6.2 6.2 0 0 0 12 18.6c.8 0 1.5-.2 2.2-.5.2-.1.5-.1.7 0 2.4-1.2 3.9-3.6 3.9-6.3C18.8 7.2 15.9 4.2 12 4.2Z" fill="none" stroke="black" stroke-width="1.25" stroke-linejoin="round"/>
<path d="M8.8 8.6A5.2 5.2 0 0 1 12 7.5" stroke="black" stroke-width="1.1" stroke-linecap="round" fill="none"/>
<circle cx="15.6" cy="8.2" r="0.9" fill="black"/><circle cx="8" cy="12.4" r="0.85" fill="black"/><circle cx="16" cy="13" r="0.8" fill="black"/>''',
    },
    "sculpSure": {
        "label": "SculpSure — body wave",
        "svg": '''<path d="M4.5 14.5c2-3 4.2-5.2 7-5.2 2.4 0 4.2 1.6 6 3.8 1.1 1.3 2.2 2.4 3 3" fill="none" stroke="black" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M5 17.5c1.6-2 3.6-4.8 6.5-4.8 2 0 3.5 1.2 5.2 3" fill="none" stroke="black" stroke-width="1.15" stroke-linecap="round" opacity="0.7"/>
<circle cx="12" cy="7.2" r="1.1" fill="black" opacity="0.95"/>''',
    },
    "epilation-laser": {
        "label": "Épilation laser — drop + beam",
        "svg": '''<path d="M12 3.5C12 3.5 6.2 8.2 6.2 12.2a5.8 5.8 0 0 0 11.6 0C17.8 8.2 12 3.5 12 3.5Z" fill="none" stroke="black" stroke-width="1.25" stroke-linejoin="round"/>
<path d="M12 11.2v4.5" stroke="black" stroke-width="1.25" stroke-linecap="round"/>
<circle cx="12" cy="17.2" r="1.1" fill="black"/>
<path d="M8.5 8.5l1.2 1.2M15.5 8.5l-1.2 1.2" stroke="black" stroke-width="1" stroke-linecap="round" opacity="0.7"/>''',
    },
    "consultation": {
        "label": "Consultation — chat",
        "svg": '''<path d="M4.2 6a2.3 2.3 0 0 1 2.3-2.3h11A2.3 2.3 0 0 1 19.8 6v7.6A2.3 2.3 0 0 1 17.5 16H9.4L5.2 20v-5.8A2.3 2.3 0 0 1 4.2 11.8V6Z" fill="none" stroke="black" stroke-width="1.25" stroke-linejoin="round"/>
<path d="M8 10.2h8M8 13h5.2" stroke="black" stroke-width="1.25" stroke-linecap="round"/>''',
    },
}

TEMPLATE = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="400" height="400">
  <!-- {label} — premium thin stroke, black on transparent for CSS mask -->
  {inner}
</svg>
'''

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for slug, data in SERVICES.items():
        # sculpSure has capital S — also write sculpsure alias
        names = [slug]
        if slug == "sculpSure":
            names.append("sculpsure")
        if slug == "consultation":
            names.append("consultation-icon")
        for name in names:
            path = os.path.join(OUT_DIR, f"{name}.svg")
            content = TEMPLATE.format(label=data["label"], inner=data["svg"])
            with open(path, "w") as f:
                f.write(content)
            print(f"✓ {name}.svg")

if __name__ == "__main__":
    main()
