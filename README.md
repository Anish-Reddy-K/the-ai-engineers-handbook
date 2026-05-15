# Bits by Anish Reddy

The open-source blueprint for Computer Science, Software Engineering, Scalable Systems, and Internet-Scale Architectures. A free, illustrated manual taking you from raw bits to distributed systems.

**Live at:** [bits.arkr.ca](https://bits.arkr.ca)

## What is this?

A library of articles and a free education project where I deconstruct computer science and software systems concepts from scratch. No fluff. Just clear analogies, hand-crafted diagrams, and the raw code that runs the world.

## Curriculum

| Part | Chapter |
|------|---------|
| 1  | Digital Fundamentals |
| 2  | Hardware Architecture |
| 3  | Programming Fundamentals |
| 4  | Algorithms & Data Structures |
| 5  | Operating Systems |
| 6  | Networking |
| 7  | Databases |
| 8  | Scalable System Design |
| 9  | Software Engineering & Security |
| 10 | Artificial Intelligence |
| 11 | Applied Engineering — Utilities & Services |
| 12 | Applied Engineering — Consumer Applications |
| 13 | Infrastructure & Middleware Design |
| 14 | Internet-Scale Architectures |

## Why does this exist?

Two reasons:

1. **The internet is overwhelming.** If you want to learn CS today, you have to choose between expensive, dry textbooks or fragmented 10-minute tutorials. There was no single, unified path from "Zero" to "System Architect." So I built one.

2. **Back to basics.** In the age of AI, it's easy to generate code we don't understand. I built this to prove that understanding the fundamentals — the actual code and logic — matters more now than ever. Especially in the age of AI.

I am doing this completely for free, on my own time, simply because I just like doing it.

## Built with

- **[Obsidian](https://obsidian.md/):** where I organize my thoughts and write the articles.
- **[Excalidraw](https://github.com/excalidraw/excalidraw):** for creating the visual diagrams.
- **[HUGO](https://gohugo.io/):** to power my pipeline of obsidian (markdown) to web (HTML).
- **[GitHub](https://github.com/Anish-Reddy-K/bits.arkr.ca):** where I store all my articles and webhook the obsidian-to-web pipeline on push.
- **[Hostinger](https://www.hostinger.com/):** hosting, listening for pushes to the `hostinger-deploy` branch.

## How the pipeline works

```
Obsidian vault (the-arkr-manual)
        │  rsync
        ▼
content/ (this repo)
        │  images.py (rewrites ![[img]] → ![alt](/images/img))
        ▼
hugo build (HUGO_ENV=prod)
        │
        ▼
public/  ──►  git subtree split ──►  hostinger-deploy branch ──►  Hostinger webhook ──►  bits.arkr.ca
```

## Development

```bash
# preview drafts as full articles
HUGO_ENV=dev hugo server

# preview production view (drafts show "coming soon")
HUGO_ENV=prod hugo server
```

## Scripts

- **`sync.sh`** — local-only: rsync Obsidian → `content/` and process images. Use while writing.
- **`upload.sh`** — full deploy: sync, build, commit, push `main`, and force-push `public/` to `hostinger-deploy`. Hostinger picks it up.

## License

This work is licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-nc-sa/4.0/).
