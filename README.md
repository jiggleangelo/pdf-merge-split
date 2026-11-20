# PDF Merge & Split

A free, open-source web tool that lets you merge several PDF files into one, or split a PDF into multiple files — entirely in your browser. No upload, no account, no server, no tracking.

## What it does

- **Merge**: Add two or more PDF files, reorder them, and merge into a single PDF.
- **Split**: Choose a PDF, enter page ranges (e.g. `1-3, 5, 8-10`), or split every page into its own file.
- **Made-up examples**: Four clickable examples that fill the file list for demonstration.

## How to run

Open `index.html` directly in your browser, or serve the directory with any static file server:

```bash
# Option 1: just open the file
open index.html

# Option 2: use a static server
npx serve .
# or
python3 -m http.server 8000
```

Then visit `http://localhost:8000` (or the port your server uses).

## Fork

Fork the repository at [https://github.com/jiggleangelo/pdf-merge-split](https://github.com/jiggleangelo/pdf-merge-split) and make your changes.

## Tests

Run the test suite with Node.js (no npm install needed):

```bash
node --test
```

## Honest limits

Client-side PDF processing may not support every PDF feature. Complex layouts, encrypted PDFs, or broken files may fail. The tool is not a substitute for a full desktop PDF editor.

## Credits

Rules and behaviour were written for this clean-room tool. Credits go to upstream open-source PDF editor projects.

## License

MIT. See [LICENSE](LICENSE).

## Links

- [This tool](https://manykiln.com/tools/pdf-merge-split/)
- [Source on GitHub](https://github.com/jiggleangelo/pdf-merge-split)
- [Join Manykiln](https://join.manykiln.com/?from=pdf-merge-split)
- [Privacy](https://manykiln.com/privacy)
