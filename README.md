# Balarion manga reader

A fast, static manga reader: no framework, package install, or server code required.

## Project layout

```
.
├── audio/
│   └── ultrasonic-sound.mp3
├── comic/                 # chapter page images
├── generate-pages.mjs     # creates pages.json in natural filename order
├── index.html
├── pages.js               # generated page list used by the reader
├── pages.json             # generated list read by the site
├── script.js
└── styles.css
```

## Add or replace pages

1. Put the images in `comic/`. Filename order is the reading order: `2.png` comes before `10.png`.
2. From this folder, run `node generate-pages.mjs`.
3. Upload or publish the updated `comic/` folder, `pages.js`, and `pages.json` with the other files.

The reader uses native lazy loading for all but the first two pages. Keep filenames URL-safe when possible (letters, numbers, hyphens, and underscores); the generator also safely encodes spaces.

## Reading experience

- Audio begins only after a tap, which works reliably on phone browsers.
- A reading-progress line stays at the top without covering the art.
- The reader remembers the last page on the same device and offers **Resume where you left off** on the next visit.
- Pages retain their natural proportions, fade in after loading, and adapt from full-width phone reading to a centered desktop column.

## Preview locally

Double-click `index.html` to open the reader directly in a browser. The generated `pages.js` page list avoids the normal browser restriction on loading local JSON files. You can also preview it through any static web server.

## Publish and get a link

### Netlify

1. Go to [Netlify Drop](https://app.netlify.com/drop).
2. Drag this entire project folder onto the page.
3. Netlify immediately provides a public `netlify.app` link. Use **Site configuration** to change its site name if desired.
4. When updating, drag the folder again or connect the folder to a Git repository for automatic deployments.

### Vercel

1. Create a GitHub repository, add every file and both asset folders, then push it to GitHub.
2. In [Vercel](https://vercel.com/new), import that repository.
3. Leave the framework setting as **Other** and deploy. No build command is needed.
4. Vercel gives the project a shareable `vercel.app` link.

### GitHub Pages

1. Create a new GitHub repository and upload all project files, including `comic/`, `audio/`, and `pages.json`.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and the `/(root)` folder, then save.
4. After GitHub finishes publishing, the shareable address appears on that same page—usually `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.

All asset paths are relative, so the reader works at the root of a domain and under a GitHub Pages repository path.

## Customize the chapter title

Change `Balarion` in `index.html` (the browser title, opening screen, and reader header) and update the one-line description if desired.
