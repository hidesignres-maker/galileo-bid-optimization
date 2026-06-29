# Galileo Component Rules
Version: 0.1
Status: Living document

## Purpose

This document defines the implementation rules for Galileo UI components.

Galileo uses DaisyUI as the component foundation, but DaisyUI is NOT the design system.
DaisyUI provides implementation primitives. Galileo defines the visual language.
When both differ, Galileo always wins.

---

## General Principles

**1. Never invent component styling.**
If a component is documented here, always follow these rules instead of DaisyUI defaults.

---

**2. Prefer semantic classes over custom CSS.**

Correct:
```
btn-primary
badge-success
alert-warning
```

Incorrect:
```
style={{background:"#0066FF"}}
```

---

**3. Tokens define colors. Components define behavior.**
Do not confuse them.
Changing color tokens should never change spacing, radius, typography, or sizing.

---

**4. DaisyUI defaults are NOT automatically accepted.**
Every DaisyUI component must be validated against Galileo before use.

---

**5. Never increase density.**
Enterprise tables prioritize information density.
Avoid unnecessary padding or oversized controls.
