# JobFit Local

A privacy-first AI resume matcher built for **future Nikhil** during the Hacktoberfest 2026 “Build for a Friend” weekend challenge.

Paste a resume and job description to get:

- a semantic fit score;
- explicit matched and missing skills;
- an honest, focused application plan.

## Why open AI

Job hunting materials are personal. JobFit Local uses the Apache-2.0-licensed [`sentence-transformers/all-MiniLM-L6-v2`](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) model through open-source [Transformers.js](https://github.com/huggingface/transformers.js). Inference runs in the browser. The app has no backend and does not upload resume or job-description text.

The model is downloaded on first use and can then be reused from the browser cache. Open weights make the model inspectable and replaceable, avoid an API key, and let the app run without sending career data to a proprietary service.

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Tests

```bash
npm test
```

## Responsible use

The match score is directional, not a hiring decision. The app tells users never to add a skill they cannot defend. It does not rank people, infer protected characteristics, or make employment decisions.

## Challenge timeline

This repository and project were started during the October 2–5, 2026 challenge window. Any commits after the deadline will be identified here.

## Built with

- Transformers.js — Apache-2.0
- all-MiniLM-L6-v2 — Apache-2.0
- Vanilla HTML, CSS, and JavaScript

## License

MIT
