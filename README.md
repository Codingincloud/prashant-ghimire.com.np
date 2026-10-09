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
assets/js/site.js           theme toggle and the copy-email button
assets/fonts/               Inter (UI) and Newsreader (display, prose), woff2
assets/img/og.png           the card that shows when the link is shared
assets/Prashant-Ghimire-CV.pdf
robots.txt · sitemap.xml · favicon.svg · .nojekyll
```

The folder is about 238 KB in total, most of it the two font files. A visitor loads
about 193 KB.

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

One detail worth keeping: `404.html` carries its own styles inline instead of
linking the stylesheet. A 404 is served at whatever path was asked for, so a
linked stylesheet would have to be either root-absolute (wrong under a subpath)
or relative (wrong at depth). Inline costs nothing and cannot render unstyled.

Also: do not commit this folder into the `d` repository it currently sits
inside. It belongs in the new repository, and the commands above are the way it
gets there.
