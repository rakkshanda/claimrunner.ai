# PDF Templates

Place `notice-of-small-claim-september-2025.pdf` in this folder (or set `PDF_TEMPLATE_PATH` in `.env` to its location).

The template is not committed to the repo. The server reads it at request time; `POST /fill` and `POST /api/cases/:id/fill` will return a 500 with a clear message if it's missing.
