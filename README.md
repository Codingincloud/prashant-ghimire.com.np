# prashant-ghimire.com.np

The personal site. One page, one stylesheet, one small script, one social card.
No framework, no build step, no dependencies, and nothing loaded from a
third-party domain: the two font files live in `assets/fonts/`. There is no
skill list and no project list on the page, on purpose.

```
index.html                  the whole site
404.html                    served by GitHub Pages for anything missing
CNAME                       prashant-ghimire.com.np
assets/css/site.css         the stylesheet
assets/js/site.js           theme, motion switch, copy-email, pointer and scroll detail
assets/fonts/               Inter (UI) and Newsreader (display, prose), woff2
assets/img/og.png           the card that shows when the link is shared
assets/Prashant-Ghimire-CV.pdf
robots.txt · sitemap.xml · favicon.svg · .nojekyll
```

The folder is about 284 KB in total, most of it the two font files (176 KB) and
the social card (35 KB). A visitor loads about 193 KB: the fonts, plus the HTML,
stylesheet and script compressed, which is how they are served.

## Publishing it

The domain already resolves to GitHub Pages. It answers 404 today because no
repository claims it, so the missing piece is the repository, not the DNS.

1. Create a new **public** repository, for example `prashant-ghimire.com.np`,
   and push this folder to it as the repository root:

   ```bash
   cd portfolio
   git init -b main
   git add .
   git commit -m "The site, first version"
   git remote add origin https://github.com/Codingincloud/prashant-ghimire.com.np.git
   git push -u origin main
   ```

2. In the repository, **Settings → Pages**: set *Source* to `Deploy from a
   branch`, branch `main`, folder `/ (root)`. The `CNAME` file in this folder
   sets the custom domain; if the field stays empty, type
   `prashant-ghimire.com.np` into *Custom domain* and save.

3. DNS, in Cloudflare. If the record is proxied (orange cloud), GitHub cannot
   finish issuing its certificate for the domain. Turn the proxy off, save the
   custom domain in Pages, wait for *Enforce HTTPS* to become available, then
   turn the proxy back on if you want it.

   | Type | Name | Value |
   | :--- | :--- | :--- |
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | CNAME | `www` | `codingincloud.github.io` |

## What the proxy adds

The zone is proxied by Cloudflare, and Cloudflare edits the HTML on the way
through. Two of its features change this page, and neither is in this
repository:

- **Scrape Shield → Email Address Obfuscation** rewrites the `mailto:` links into
  `/cdn-cgi/l/email-protection` links that only resolve once its decoder script
  has run. With JavaScript off, the contact address is dead text instead of a
  link. (Wrapping the `@` in an HTML entity does not avoid this; it was tried.)
- **Web Analytics**, if it is on for the zone, adds the `cloudflareinsights.com`
  beacon, which is a request to a third-party host. That is why the footer talks
  about the code rather than about the page's network traffic: the code makes no
  such request, and the proxy may anyway.

Switching both off is what makes the served page identical to this repository.
Setting the DNS record to *DNS only* (grey cloud) also removes both, in
exchange for Cloudflare's caching and CDN.

## Changing the text

Everything a reader sees is in `index.html`, in reading order: the name and
introduction, About, education, Contact. The date in the footer and in
`sitemap.xml` is written by hand, so update both when the content changes.

When `assets/css/site.css` or `assets/js/site.js` changes, bump the `?v=` token
on its `<link>` or `<script>` tag in `index.html`. Cloudflare caches static files
at the edge for four hours, and the browser caches them too, so without a new
token the old stylesheet keeps being served and the change looks like it did not
deploy. The token is any string; a date reads best.

Read the page out loud once before publishing. Every claim on it should be
something you would say in an interview without flinching.

## The one rule the motion follows

Sections fade in as they are reached, and the reveals are CSS only
(`animation-timeline: view()`), which the browser cannot tell "already on screen"
from "not reached yet". Left alone, a block visible at load, or a block with
less page beneath it than its range needs, would sit half-lit with no scroll left
to finish it. `settleReveals()` in `site.js` catches both cases and gives those
blocks the page's ordinary arrival instead: they fade once, 50 ms apart from each
other, and are done. Nothing is ever dim on purpose, and the rule only ever adds
a class, so a page with the script blocked still reads.

If a section is added near the foot of the page, the reveal there is the one to
check first: scroll it into view and leave it, then confirm it is fully opaque.

## The name, and the caret it carries

The name arrives one letter at a time, each letter 22 ms behind the one before
it, so the page writes its own name rather than blinking it into place. The
split happens in a script sitting beside the heading in the markup, not in the
page script at the end: it runs while the parser is still walking the hero, so
the whole name can never flash first and then dissolve into letters. With no
script there is nothing to split, the name stays whole, and it takes the
ordinary blur-to-sharp arrival instead.

At the end of it sits a caret, which blinks twice once the last letter has landed
and then retires, leaving the mark in the header to keep blinking. It is **drawn,
not laid out**: an anchor of no size on the baseline, with the bar hanging off it
and the timeline animating the anchor's opacity. That is not fussiness. A caret
with real width and height in the line was measured changing the `h1`'s height by
2.7 px at every width, and at 360 px it was pushed onto a line of its own, taking
the lede down 44 px with it. `caret-layout.js` in the scratch folder holds that
measurement at nine widths, and samples real pixels to confirm the bar is drawn
exactly during the two blinks and not otherwise.

The other thing that answers the scroll is the hero itself, drifting 18 px
against it as it leaves the fold — the whole of the parallax on this site. It is
a transform on the block holding the most text on the page, so it was measured
the same way: p95 frame time while scrolling is 6.2 ms with the drift and 6.5 ms
without, at both 1280x900 and 2560x1440, with no frame over 33 ms and no long
tasks.

## The light behind the page

From a laptop up, two soft lights sit behind everything — one in the top corner,
one down the left — drawn with radial gradients rather than fetched from
anywhere. They drift on their own over about a minute, lean a few pixels with
the pointer, and slide as the page scrolls. As the reader moves from one section
to the next, one light steps down the right-hand margin and the other rises up
the left, so the room keeps changing without anything on the page having to move;
the stylesheet takes 1.6 s over each step, and the light stays where it was left
if motion is switched off. Below 48rem the layers are never built at all, and on
a device reporting less than 4GB of memory the pointer lean is left out entirely.

They are decoration with a cost, so the two things that could go wrong are
measured rather than assumed. Contrast: sampled from the pixels the browser
drew behind each text element, at three points down the page, the worst text
holds 4.93:1 in light and 6.41:1 in dark with the lights on, against 4.97:1 and
6.41:1 with them off. The light reaches the reading column only as a faint tail,
and costs it 0.04; the section-by-section travel was re-measured for exactly
that reason. Frames: scrolling with the
lights on and off, on a software rasteriser with no GPU, gives the same 6.5ms
95th-percentile frame. If the colours or positions are ever changed, measure
again, and sample the pixels the browser drew behind the text rather than the
background the stylesheet intended.

At 80rem and up the reading rhythm also gets more air — 7rem above the fold and
4.5rem between sections — because a screen that size is read from further away.

## Who decides whether the page moves

The operating system's preference is the starting point and the reader has the
last word, through the switch in the header. Nothing about this is left to a
media query alone: every animation is named through a variable (`--a-rise`,
`--a-focus`, `--a-wipe` and so on), and four short blocks set those variables —
the quiet default, the system's answer, the reader saying on, the reader saying
off. That is why the motion rules themselves are no longer inside
`prefers-reduced-motion`: a rule a media query hides cannot be switched back on
by the reader.

The switch is set in the small script in the head, before the first paint, and
remembered in `pg-motion`. Check four combinations when touching this: system on,
system off, reader overrules their system, and no script at all (where the media
query is the only thing that decides). `pw-check.js` in the scratch folder runs
all four.

The stylesheet can only silence what has not started yet. A transition already
running keeps its own clock to the end, so a reader turning motion off mid-scroll
would still get the whole 1.6 s of light sliding past — measured, not guessed.
The switch therefore cancels what is in flight on the way out (`stopInFlight()`
in `site.js`), which lands each one on the value it was heading for: the light
stays where they left it, and nothing is left running. The layers the theme wipe
animates are pseudo-elements, and those are deliberately left alone.

One detail worth keeping: `404.html` carries its own styles inline instead of
linking the stylesheet. A 404 is served at whatever path was asked for, so a
linked stylesheet would have to be either root-absolute (wrong under a subpath)
or relative (wrong at depth). Inline costs nothing and cannot render unstyled.

Also: do not commit this folder into the `d` repository it currently sits
inside. It belongs in the new repository, and the commands above are the way it
gets there.
