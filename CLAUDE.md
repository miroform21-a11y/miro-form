# CLAUDE.md — Permanent Project Instructions

## 1. Core principle

The goal is to create a production-ready website that matches the provided design as accurately as possible.

The design is the source of truth.

Do not redesign, simplify, reinterpret, modernize, or improve the visual design unless explicitly requested by the user.

The website should reproduce the provided design and its intended responsive behavior, not merely approximate its appearance.

Priorities:

1. Visual accuracy
2. Responsive behavior
3. Functional correctness
4. Clean, maintainable code
5. Performance and SEO
6. Sensible project structure

Do not make independent design decisions simply because they seem aesthetically better.

If something is ambiguous and could materially affect the result, ask the user before implementing it.


---

## 2. Before development

Before writing code:

1. Study all provided materials.
2. Study the entire relevant Figma design if a Figma file/link is provided.
3. Study all pages, sections, components, typography, spacing, colors, images, icons, buttons, interactions, and animations.
4. Understand the desktop and mobile compositions.
5. Identify how elements are expected to adapt between breakpoints.
6. Study existing project files and code if they are provided.

Use Figma MCP when available.

Do not start coding immediately.

First briefly report:

- what you understood about the design;
- the page/section structure;
- the main components you identified;
- the responsive strategy;
- any genuinely ambiguous points.

Ask only questions that are necessary to avoid making an incorrect implementation decision.

Do not ask questions whose answers are obvious from the design, files, or project context.

If there are several reasonable implementation options that materially affect the result, explain the options briefly and ask which one to use.

After receiving the answers:

1. Briefly summarize the final understanding of the project.
2. Summarize the key implementation decisions.
3. Summarize the planned responsive behavior.

Then STOP and wait for explicit user confirmation.

Do not start development until the user confirms.


---

## 3. Design fidelity

Implement the design as close to 1:1 as reasonably possible.

Preserve:

- composition;
- visual hierarchy;
- grid;
- spacing;
- proportions;
- typography;
- font sizes;
- font weights;
- line heights;
- colors;
- borders;
- border radii;
- shadows;
- image sizes and crops;
- image positioning;
- card structure;
- button placement;
- CTA placement;
- visual rhythm;
- section heights where they are visually important.

Do not replace the design with a generic approximation.

Do not change:

- text;
- images;
- content structure;
- section order;
- visual elements;

unless explicitly requested or necessary because the source material is incomplete.

Do not introduce your own design decisions merely because they seem aesthetically better.

The design is the source of truth.


---

## 4. Figma

When a Figma design is provided:

- Treat Figma as the visual source of truth.
- Use Figma MCP when available.
- Inspect the entire relevant design before implementation.
- Inspect Auto Layout, constraints, spacing, sizing, typography, components, variants, variables, and responsive versions when available.
- Understand the underlying layout logic and reproduce that logic in code.
- Do not blindly convert every Figma measurement into a fixed CSS value.
- Preserve the intended relationship between elements.

If the Figma file contains desktop and mobile versions, use both to understand the intended responsive behavior.

If a mobile design is provided, do not invent a different mobile composition when the intended composition is already shown in Figma.

When performing visual QA, compare the browser-rendered result against the corresponding Figma frame whenever possible.


---

## 5. Responsive implementation

The website must be genuinely responsive.

Do not simply scale down the desktop version.

Do not create responsive behavior by making everything smaller and compressing the desktop layout.

Use appropriate:

- flexbox;
- CSS grid;
- max-width containers;
- min/max constraints;
- percentage-based sizing;
- fluid widths;
- clamp();
- responsive typography;
- responsive gaps and padding;
- appropriate image behavior.

Use breakpoints only where the composition actually needs to change.

Prefer flexible responsive logic over a large number of arbitrary breakpoints.

The website should remain visually correct not only at the exact design widths but also at intermediate widths.

The website must be checked at minimum at:

- 1440px;
- 1280px;
- 1024px;
- 768px;
- 430px;
- 390px;
- 360px.

Also test important intermediate widths by gradually resizing the viewport.

### Cards

Do not allow cards to become unusably narrow simply because the viewport became smaller.

If cards stop fitting comfortably:

- reduce the number of columns;
- change the layout;
- stack them;
- use horizontal scroll where it is logically appropriate;
- or follow the mobile composition shown in Figma.

Preserve readable text and comfortable internal padding.

Do not reduce text to an uncomfortably small size just to preserve the desktop composition.

### Typography

Do not scale every text element equally.

Adapt independently:

- H1;
- H2;
- body text;
- labels;
- buttons;
- captions.

Preserve the visual hierarchy.

On smaller screens, use appropriate changes to:

- font size;
- line-height;
- max-width;
- spacing.

Avoid ugly or accidental line wrapping.

### Images

Pay attention not only to image size but also to crop.

Check:

- aspect ratio;
- object-fit;
- object-position;
- focal point;
- responsive image sizing.

Do not allow `object-fit: cover` or another technique to accidentally cut off an important part of an image.

If desktop and mobile use different crops, reproduce the intended crops.


---

## 6. Animations

Animations should be noticeable but tasteful and must follow the provided design or explicit project requirements.

When required by the design/project, use:

- smooth section transitions;
- subtle entrance animations;
- light hero parallax;
- animated counters;
- hover states;
- appropriate micro-interactions.

Do not add excessive animation that changes the character of the design.

Do not invent animations simply because they seem visually impressive.

Respect reduced-motion preferences where appropriate.


---

## 7. Technical stack

Default stack for these projects:

- Next.js;
- React;
- TypeScript;
- CSS / Tailwind / project-appropriate styling system;
- Supabase when backend/database functionality is required;
- Vercel for deployment.

Use the existing project structure when one already exists.

Do not unnecessarily rewrite or restructure the project.

If a future admin panel is planned, structure content and components so that editable data can later be connected to Supabase/admin functionality.

Typical editable content may include:

- schedule;
- prices;
- articles;
- gallery;
- other project-specific content.

Do not build a future admin panel unless the user explicitly asks for it at the current stage.

SEO should be considered from the beginning.

Project-specific technical instructions provided by the user take priority over these defaults.


---

## 8. Project architecture

Prefer:

- reusable components;
- clear component boundaries;
- reusable sections;
- centralized data where appropriate;
- data-driven rendering where appropriate;
- semantic HTML;
- accessible interactive elements.

Avoid:

- unnecessary duplication;
- giant monolithic components;
- hardcoded repetition when data-driven rendering is more appropriate;
- unnecessary abstractions;
- unnecessary dependencies;
- over-engineering.

Do not over-engineer a simple landing page.

For a one-page landing, use anchor sections unless the design or user explicitly requires separate routes.

If an existing project is provided, preserve its working structure and functionality unless changes are necessary.


---

## 9. Forms and interactions

Before implementing forms or important interactions, identify:

- what happens on submit;
- where the data should go;
- whether validation is required;
- whether success/error states are required;
- whether an external service is involved;
- whether the interaction must later be editable through an admin panel.

For important links, identify whether they should:

- scroll to a section;
- navigate to another page;
- open an external resource;
- open a phone link;
- open an email;
- trigger another action.

Do not invent backend behavior, destinations, or functionality when they have not been specified.

If the correct behavior cannot be determined from the design or project context, ask the user.


---

## 10. Visual QA

A website is not considered finished merely because it builds and works technically.

After the first working version:

1. Run the website locally.
2. Use Playwright MCP when available.
3. Open the actual browser-rendered page.
4. Take screenshots at the required viewport sizes.
5. Compare the rendered result with the original design/reference.
6. When Figma is available, compare browser screenshots against the corresponding Figma frames at matching viewport sizes.
7. Identify visual differences.
8. Fix the differences.
9. Run the browser check again.
10. Take screenshots again.
11. Compare again.
12. Repeat until important visual discrepancies are resolved.

If a visual-diff tool is available, use it.

Do not stop after the first successful render.

Pay special attention to:

- spacing;
- typography;
- line breaks;
- section heights;
- container widths;
- alignment;
- card widths;
- button sizes;
- image crops;
- empty space;
- mobile composition;
- overflow;
- horizontal scrolling;
- sticky/fixed elements;
- animation behavior.

A successful build is not visual QA.

A screenshot is not visual QA unless it has actually been compared against the design/reference.

Do not claim that visual QA was performed if it was not actually performed.


---

## 11. Development order

Use this general sequence:

1. Understand the design and all provided materials.
2. Confirm necessary requirements.
3. Ask the user only the necessary questions.
4. Wait for the user's answers.
5. Summarize the final understanding and implementation decisions.
6. Wait for explicit user confirmation.
7. Set up or inspect the project.
8. Build the accurate desktop composition.
9. Implement responsive behavior based on the provided design.
10. Add required interactions and animations.
11. Run the application.
12. Perform browser-based visual QA using Playwright when available.
13. Compare the result with the design.
14. Fix visual differences.
15. Repeat visual QA.
16. Perform final responsive QA.
17. Check console/build errors.
18. Check basic SEO/accessibility/performance issues.
19. Summarize what was implemented.

Do not skip the confirmation step before development.

Do not consider the project complete before visual QA and final responsive QA.


---

## 12. When cloning an existing website

If a URL is provided as a visual reference:

1. Inspect the website.
2. Use browser screenshots when possible.
3. Analyze layout, spacing, typography, images, sections, components, interactions, and responsive behavior.
4. Recreate the visual structure in code.
5. Do not assume that the original site's internal implementation is known.
6. Reconstruct the underlying responsive logic rather than blindly copying pixel positions.
7. Validate the result in the browser.
8. Compare screenshots with the reference.
9. Fix visual differences.
10. Recheck.

A screenshot or reference website shows the visual result, not necessarily the original site's internal layout rules.

If the user asks for a highly accurate clone, prioritize visual comparison and iterative correction.


---

## 13. Content and structure

Do not change:

- text;
- section order;
- number of blocks;
- images;
- links;
- content hierarchy;

unless explicitly requested or necessary because the source material is incomplete.

If content is missing, ask rather than inventing important content.

Do not rewrite marketing copy or change the meaning of content without explicit instruction.

Preserve the intended structure of the provided design.


---

## 14. Code quality

Write production-quality code.

Prefer readable and maintainable code over clever code.

Do not create unnecessary abstractions.

Keep components understandable.

Use semantic HTML and accessible controls.

Avoid:

- console errors;
- obvious warnings;
- unnecessary dependencies;
- duplicated logic;
- unnecessary complexity.

Optimize where appropriate, but do not sacrifice accurate visual implementation for premature optimization.

Check that the final project builds and runs correctly.


---

## 15. Final response

When the implementation is complete, briefly report:

- what was implemented;
- responsive breakpoints/behavior;
- which blocks change composition on mobile;
- where horizontal scrolling is used, if anywhere;
- why horizontal scrolling is used there;
- important technical decisions;
- whether Playwright/browser QA was performed;
- whether visual comparison against the design was performed;
- any known remaining limitations or differences.

Do not claim that visual QA was performed if it was not actually performed.

Do not claim pixel-perfect accuracy unless the result was actually checked against the provided design/reference.


---

## 16. Important rule

Never consider the task complete simply because the code works.

The final result must be checked visually in the browser.

The required process is:

DESIGN
→ UNDERSTAND
→ ASK
→ WAIT
→ CONFIRM
→ IMPLEMENT
→ BROWSER
→ COMPARE
→ FIX
→ RECHECK
→ RESPONSIVE QA
→ TECHNICAL QA
→ COMPLETE

The visual result is the final authority.

The design is the source of truth.

The browser-rendered website is what must ultimately be validated.

The goal is not simply working code.

The goal is:

ACCURATE DESIGN
+
CORRECT RESPONSIVE BEHAVIOR
+
WORKING FUNCTIONALITY
+
BROWSER VISUAL QA
+
ITERATIVE CORRECTION