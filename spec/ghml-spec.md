# GHML — Generative HyperText Markup Language
## Specification v0.1.0

**Author:** Andrey Kasianov  
**Status:** Pre-specification / Concept  
**Started:** May 2026  
**Extension:** `.ghml` | **MIME type:** `text/ghml`

---

## 1. Overview

GHML is a document and interface paradigm where hyperlinks carry **prompts** instead of URLs. When a user activates a link, the embedded prompt is dispatched to an LLM, which generates the destination in real time — a page, a widget, a form, an action, or a new GHML document.

> *The document is a scaffold. The LLM is the runtime.*

GHML extends standard Markdown with the `ghml:` URI scheme. A `.ghml` file is valid Markdown — non-GHML renderers display it with non-functional link text, providing graceful degradation.

---

## 2. File Format

- **Extension:** `.ghml`
- **Base format:** Valid CommonMark Markdown
- **Encoding:** UTF-8
- **MIME type:** `text/ghml`
- **Graceful degradation:** Plain Markdown renderers show `[link text]` without `ghml:` functionality

---

## 3. Syntax

### 3.1 EBNF Grammar

```ebnf
(* GHML Document — a Markdown document containing ghml: links *)
ghml-document   ::= markdown-content

(* GHML Link — extends Markdown link syntax *)
ghml-link        ::= "[" link-text "](" ghml-uri ")"
link-text        ::= text-content

(* GHML URI *)
ghml-uri         ::= "ghml:" link-type SP quoted-prompt attribute-list
link-type        ::= "render" | "nav" | "action" | "embed"
quoted-prompt    ::= DQUOTE prompt-body DQUOTE
prompt-body      ::= *( prompt-char | interpolation )
prompt-char      ::= any-char-except-DQUOTE-and-backslash
                   | "\" any-char                  (* escaped character *)
interpolation    ::= "{{" var-path "}}"
var-path         ::= identifier *( "." identifier )

(* Attributes *)
attribute-list   ::= *( SP attribute )
attribute        ::= key-value-attr | flag-attr
key-value-attr   ::= name "=" attr-value
flag-attr        ::= "inline" | "cache"
attr-value       ::= quoted-string | bare-value
bare-value       ::= 1*( VCHAR except SP DQUOTE ")" )
quoted-string    ::= DQUOTE *( any-char-except-DQUOTE ) DQUOTE

(* Terminals *)
name             ::= ALPHA *( ALPHA / DIGIT / "-" / "_" )
identifier       ::= ALPHA *( ALPHA / DIGIT / "_" )
SP               ::= %x20
DQUOTE           ::= %x22
ALPHA            ::= %x41-5A / %x61-7A
DIGIT            ::= %x30-39
VCHAR            ::= %x21-7E
```

### 3.2 Base Form

```
[link text](ghml:<type> "<prompt>" [key=value ...] [flags])
```

### 3.3 Examples

```markdown
[See an example](ghml:render "Generate a Python quicksort example with explanation")

[Explain this](ghml:action "Explain the currently selected text in simple terms" context=selection inline)

[My dashboard](ghml:render "Generate a dashboard for {{user.name}} on the {{user.plan}} plan" context=data model=claude-opus-4-7)

[Explore further](ghml:nav "Dive deeper into the topic of {{topic}}" context=chain)

[Live chart](ghml:embed "Create a bar chart widget for the sales figures" width=full context=data)
```

---

## 4. Link Types

| Type | Behavior |
|---|---|
| `render` | LLM generates a full new document; replaces the current viewport |
| `nav` | Like `render` but pushes to browser history (back/forward works) |
| `action` | LLM performs a task and streams the result inline at link position; no navigation |
| `embed` | LLM renders a self-contained widget inline (chart, form, mini-app) |

---

## 5. Attributes

See `ghml-schema.json` for the normative JSON Schema definition.

| Attribute | Type | Description |
|---|---|---|
| `model` | string | LLM model identifier (`claude-opus-4-7`, `gpt-4o`, `local`, …) |
| `context` | enum | Context to inject alongside the prompt (see §6) |
| `inline` | flag | For `action` type: stream output at link position |
| `width` | enum | Layout hint for `embed` type: `full`, `half`, `sidebar` |
| `cache` | flag | Reuse a previously generated response for identical prompt+context |
| `fallback` | URI | Static URL to navigate to if the LLM is unavailable |
| `policy` | string | Named policy to apply for this link (see §8) |

---

## 6. Context System

The `context` attribute controls what is injected alongside the prompt as additional context.

| Value | What Gets Injected |
|---|---|
| `page` | Full content of the current GHML document |
| `user` | Session-level user data (role, preferences, custom variables) |
| `selection` | Text the user currently has selected |
| `data` | Live data resolved from `{{variable}}` bindings |
| `chain` | Full navigation history as accumulated conversation context |
| `dom` | Serialized visible DOM state |

Multiple context values may be space-separated: `context="page user"`.

---

## 7. Data Binding

Prompt strings support `{{variable}}` interpolation, resolved at render time against bound data sources.

```markdown
[View account](ghml:render "Generate a summary for {{user.name}} on the {{user.plan}} plan" context=user)
```

Variable paths use dot notation (`user.name`, `data.sales.q4`). Unresolved variables are left as-is in the prompt.

---

## 8. Architecture

```
GHML Document
    ↓
GHML Parser           — extracts type, prompt, model, context, policy from ghml: links
    ↓
Context Builder       — assembles context package (page, user, selection, chain, data)
Data Resolver         — interpolates {{variables}} against bound sources
Policy Check          — enforces model allowlist, cost caps, prompt constraints
    ↓
Prompt Router         — selects LLM backend, applies fallback logic
    ↓
LLM API (streaming)
    ↓
Stream Renderer       — pipes token output into viewport; handles GHML/HTML/Markdown output
    ↓
History Engine        — maintains navigation stack; assigns deterministic hash for sharing
```

---

## 9. Recursive Property

Generated pages can themselves contain `ghml:` links. This means:

- A single seed document can spawn an infinitely deep, contextually coherent experience
- Each navigation hop narrows and personalizes context
- `context=chain` lets the full navigation history accumulate as conversation context

---

## 10. Output Contract

An LLM responding to a `ghml:render` or `ghml:nav` prompt SHOULD produce:

1. Valid CommonMark Markdown
2. Optionally, `ghml:` links (using the syntax defined in this spec) for further navigation
3. Optionally, inline HTML (rendered in a sandboxed context)

An LLM responding to a `ghml:action` prompt SHOULD produce inline Markdown content suitable for rendering at the link position.

An LLM responding to a `ghml:embed` prompt SHOULD produce a self-contained HTML widget or Markdown block.

---

## 11. Security Considerations

| Concern | Mitigation |
|---|---|
| Prompt injection via `context=page` | Context is passed as data, not instruction; system prompt separates context from author prompt |
| Generated script execution | Generated HTML rendered in sandboxed iframe; no `<script>` eval |
| API key exposure | Keys are user-provided, client-side only; never embedded in `.ghml` files |
| Cost runaway | Policy schema (§12) enforces per-request and per-session token caps |

---

## 12. Policy

A GHML renderer MAY enforce a policy that restricts model selection and cost. See `policy-schema.yaml` for the schema definition and `examples/default.policy.yaml` for an example.

Policy is applied before dispatching any LLM request. If a link's requested `model` is not in the allowlist, the renderer MUST refuse the request and display a fallback or error state.

---

## 13. Open Design Questions

| Question | Status |
|---|---|
| Reproducibility / bookmarking | Proposed: deterministic hash of `(prompt + context snapshot + timestamp)` |
| Author vs. user prompt visibility | Open: power-user pre-flight dialog; opaque by default |
| Accessibility (streaming + screen readers) | Open: ARIA live regions; LLM instructed to produce accessible markup |
| Cost model | Open: author pays (embedded key), user pays (BYOK), platform model |
| Offline / degraded state | Proposed: `fallback="<url>"` required; cached responses |

---

## 14. Related Concepts

- **Hypermedia / REST** (Roy Fielding) — GHML extends the hypermedia constraint to generative processes
- **HTMX** — server-rendered HTML-over-the-wire; GHML is the LLM analogue  
- **Transclusion** (Ted Nelson / Project Xanadu) — GHML *generates* rather than retrieves
- **Prompt chaining** — exposes multi-step LLM pipelines as navigable hyperlinks
- **Semantic Web** — machine-*executable* documents, not just machine-readable ones
- **Google Generative UI** (arXiv 2604.09577, 2025) — validates LLM-generated HTML as a preferred output format
- **Google A2UI** (Dec 2025) — declarative agent-to-UI protocol; relevant to GHML's output sandboxing model
