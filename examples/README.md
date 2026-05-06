# GHML Showcases

This directory holds standalone `.ghml` files that demonstrate what the medium can do. Each one is single-file, forkable, and runs in the renderer at `../renderer/` once you supply an Anthropic API key.

> The exhaustive feature walkthrough lives at `../spec/examples/sample.ghml`. These showcases are different — they exist to *pitch* the medium, not teach the syntax.

## The five

| File | Concept | What it demonstrates |
|---|---|---|
| [`plain-language-anything.ghml`](plain-language-anything.ghml) | Utility killer-app | Paste any dense text; every term becomes a clickable plain-language gloss in place. |
| [`counterfactuals.ghml`](counterfactuals.ghml) | Epistemic engine | One historical event seeds an infinite tree of alternate histories, kept self-consistent by `context=chain`. |
| [`decision-helper.ghml`](decision-helper.ghml) | Canonical GHML app | Inputs + embed widgets + actions in one file. The app archetype — fork it for your own decisions. |
| [`awake.ghml`](awake.ghml) | Literary entity (wildcard) | A document that knows it is being read, addresses you directly, and remembers your path. Borges meets Hofstadter meets Calvino in 40 lines. |
| [`living-spec.ghml`](living-spec.ghml) | Meta showcase | The GHML spec written *in* GHML. Reading it means using it. Every example is live. |

## How to run

```
cd ../renderer
npm install
npm run dev
```

Open `http://localhost:5173`, paste your Anthropic API key into Settings, then click **Load .ghml** and pick any file in this directory.

## Connection to the philosophy

Each showcase pins one or more axioms from [`../docs/philosophy.md`](../docs/philosophy.md):

- `plain-language-anything.ghml` → axioms 2 (click as measurement) and 4 (author shapes the field)
- `counterfactuals.ghml` → axioms 5 (unfolding garden) and 2.4 (path is the reading)
- `decision-helper.ghml` → axiom 3 (constituted in the meeting)
- `awake.ghml` → axioms 1, 2, 5, and 6.2 (*"read as GHML, the file is awake"*)
- `living-spec.ghml` → axiom 6 (dormant/awake duality made visible)
