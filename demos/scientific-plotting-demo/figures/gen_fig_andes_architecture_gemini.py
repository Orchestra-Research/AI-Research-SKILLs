#!/usr/bin/env python3
"""Generate Andes System Architecture diagram using Gemini image generation.

Following the academic-plotting skill (updated):
  - Step 0: Context extraction from paper
  - Workflow 1: Style B "Modern Minimal" + "Nord" palette
  - 6-section prompt: Framing, Visual Style, Colors, Layout, Connections, Constraints
  - Model: gemini-3-pro-image-preview
  - 3 non-deterministic attempts

Usage: python demo/figures/gen_fig_andes_architecture_gemini.py
Output: demo/figures/fig_andes_architecture_attempt{1,2,3}.png
"""
import os
import sys
import time

# Load .env
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".env")
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ.setdefault(key.strip(), val.strip())

from google import genai

API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    print("ERROR: Set GEMINI_API_KEY environment variable or add it to .env")
    print("  Get a key at: https://aistudio.google.com/apikey")
    sys.exit(1)

MODEL = "gemini-3-pro-image-preview"
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
client = genai.Client(api_key=API_KEY)

# ==========================================================================
# PROMPT: 6-Section Structure per updated academic-plotting skill
#
# Step 0 Context Extraction (from the Andes paper):
#   Entities: User, Application Client, Token Pacer, Token Buffer,
#             Smooth Delivery, Request Tracker, Token-Level Scheduler
#             (Priority Scheduler + Overhead Refiner), Executor, KV Cache, GPU
#   Layout: Two zones (Client / Server), left-to-right flow
#   Relationships: 6-step numbered request lifecycle + preempt path
#   Style: Modern Minimal (systems paper, authoritative tone)
#   Palette: Nord (clean, professional)
# ==========================================================================

PROMPT = """
SECTION 1 — FRAMING:

Create an ultra-clean, modern technical architecture diagram for an OSDI/NeurIPS
systems paper. The diagram should feel like a premium design system — confident,
spacious, and authoritative. Think: Apple's developer documentation meets a
Nature paper. Every element earns its space. No visual noise.

The diagram shows "Andes", a QoE-aware LLM serving system that co-designs the
inference server and the text streaming client. It has a 6-step numbered request
lifecycle flowing between client and server components.

SECTION 2 — VISUAL STYLE (Modern Minimal):

- Ultra-clean geometric shapes with crisp edges
- Bold color blocks as backgrounds for sections — NOT just accent bars, but full
  section fills using desaturated tones
- Component boxes have ROUNDED CORNERS (12px radius), NO visible border — they
  float on the section background using subtle shadow (1px offset, 4px blur,
  rgba(0,0,0,0.06))
- ONE accent color per section used sparingly on key elements
- Arrows are thin (1.5px), dark gray (#6B7280), with small filled circle at source
  and clean arrowhead at target — NOT thick colored arrows
- Exception: the novel "Andes components" use Amber #EBCB8B accent to highlight them
- Typography: system sans-serif, title 600 weight, body 400 weight
- Labels INSIDE boxes, not beside them
- Generous whitespace — at least 24px between elements
- NO decorative elements, NO icons unless specified — let the structure speak
- Step numbers are small filled circles with white number text inside

SECTION 3 — COLOR PALETTE (Nord):

COLOR PALETTE (use EXACTLY these colors, no substitutions):
- Deep text: Polar Night #2E3440
- Subtle text / subtitles: #4C566A
- Client section fill: Snow Storm blue tint #EEF1F6
- Server section fill: Snow Storm green tint #EDF3ED
- Andes novel components (accent): Aurora Yellow #EBCB8B (fill: #FBF6EA)
- Executor / data plane: Frost Blue #5E81AC (fill: #EEF1F6)
- GPU / hardware: Snow Storm #E5E9F0
- Error / preempt path: Aurora Red #BF616A
- Token delivery flow arrows: Aurora Green #A3BE8C
- Control flow arrows: dark gray #6B7280
- Step number circles: Aurora Yellow #EBCB8B fill, white #FFFFFF text
- Component box fill: White #FFFFFF
- Component box shadow: rgba(0,0,0,0.06)
- Divider between Client and Server: dashed line #D8DEE9

SECTION 4 — LAYOUT:

The diagram is divided into TWO horizontal zones separated by a thin dashed
horizontal line (#D8DEE9). The zones have full-width rounded rectangle
backgrounds (8px corners).

=== TOP ZONE: CLIENT (blue tint background #EEF1F6) ===

Small section header top-left: "CLIENT" in #5E81AC, small caps, letter-spaced.

Contains these white floating component boxes arranged LEFT to RIGHT:

1. USER BOX (far left):
   - White floating box with subtle shadow
   - Title: "User" (600 weight, #2E3440)
   - Subtitle below title: "Reading / Listening" (#4C566A, smaller)

2. APPLICATION CLIENT BOX (center-left):
   - Slightly larger white floating box
   - Title: "Application Client" (600 weight, #2E3440)
   - INSIDE this box, nested at the bottom: a smaller box with
     Aurora Yellow accent fill #FBF6EA and thin #EBCB8B left strip (4px)
   - The nested box text: "Token Pacer" (600 weight, #2E3440)
   - This is an Andes component, hence the yellow accent

3. TOKEN BUFFER (center):
   - A horizontal row of 6 small squares (like a queue visualization)
   - First 3 squares: filled with Aurora Yellow #EBCB8B (buffered tokens)
   - Last 3 squares: empty, very faint fill #F0F0F0 (empty slots)
   - Small label above: "Token Buffer" (#4C566A, small text)

4. SMOOTH DELIVERY BOX (far right):
   - White floating box with a Aurora Green left strip (4px, #A3BE8C)
   - Title: "Smooth Delivery" (600 weight, #2E3440)
   - Subtitle: "Ideal Consumption Timeline" (#4C566A)

=== BOTTOM ZONE: SERVER (green tint background #EDF3ED) ===

Small section header top-left: "SERVER" in #A3BE8C, small caps, letter-spaced.

Contains these white floating boxes arranged LEFT to RIGHT:

1. REQUEST TRACKER BOX (far left):
   - White box with Aurora Yellow left strip (4px, #EBCB8B) — Andes component
   - Title: "Request Tracker" (600 weight, #2E3440)
   - Three lines of subtitle (#4C566A, small):
     "QoE params"
     "TTFT targets"
     "Token timestamps"

2. TOKEN-LEVEL SCHEDULER BOX (center-left):
   - White box with Aurora Yellow left strip (4px, #EBCB8B) — Andes component
   - Title at top: "Token-Level Scheduler" (600 weight, #2E3440)
   - INSIDE this box, two smaller white sub-boxes arranged side by side,
     each with subtle shadow:
     Left sub-box: "Priority Scheduler" (#2E3440, 400 weight)
     Right sub-box: "Overhead Refiner" (#2E3440, 400 weight)

3. EXECUTOR BOX (center-right):
   - White box with Frost Blue left strip (4px, #5E81AC) — execution engine
   - Title: "Executor" (600 weight, #2E3440)
   - INSIDE, a smaller nested box:
     "KV Cache" (#5E81AC text)

4. GPU BOX (far right):
   - Snow Storm fill #E5E9F0, no left strip
   - Title: "GPU" (600 weight, #2E3440)
   - Subtitle: "Memory + Compute" (#4C566A)

=== BOTTOM AREA (below both zones, on white background) ===

Centered, with generous spacing above:

1. A rounded box with Aurora Yellow fill #FBF6EA and thin #EBCB8B border:
   "QoE = 1 - S_delay / S_whole"
   (600 weight, #2E3440, slightly larger text)

2. Below that, smaller text in #4C566A:
   "Priority = QoE_gain / context_length  |  Objective: maximize average QoE"

3. A minimal legend at the bottom with three items in a horizontal row:
   - Small Aurora Yellow square + "Andes components"
   - Small Frost Blue square + "Execution engine"
   - Small Aurora Green square + "Token delivery"

SECTION 5 — CONNECTIONS:

All arrows are thin (1.5px) with small filled circle at source and clean
arrowhead at target, unless otherwise specified.

ARROW 1: User → Application Client
- Style: solid, Color: #6B7280 (gray), horizontal going RIGHT
- Step number: circled "1" (Aurora Yellow #EBCB8B circle, white "1")
- Label above arrow: "Submit request" (#4C566A, italic, small)

ARROW 2: Application Client → Token-Level Scheduler (crosses Client/Server boundary DOWN)
- Style: solid, Color: #6B7280, vertical going DOWN
- Step number: circled "2"
- Label beside arrow: "Enqueue + QoE params" (#4C566A, italic)

ARROW 3: Request Tracker → Token-Level Scheduler
- Style: solid, Color: #EBCB8B (amber), horizontal going RIGHT
- Step number: circled "3"

ARROW 4a: Token-Level Scheduler → Executor
- Style: solid, Color: #6B7280, horizontal going RIGHT
- Label above: "Admit / Resume" (#4C566A, italic)
- Step number: circled "4"

ARROW 4b: Executor → Token-Level Scheduler (preempt, going LEFT, below arrow 4a)
- Style: dashed, Color: Aurora Red #BF616A, horizontal going LEFT
- Label below: "Preempt" (#BF616A, italic)

ARROW 5: Executor → Application Client area (crosses Server/Client boundary UP)
- Style: solid, Color: Aurora Green #A3BE8C, vertical going UP
- Step number: circled "5"
- Label: "Stream tokens" (#A3BE8C, italic)

ARROW 6: Token Buffer → Smooth Delivery
- Style: solid, Color: Aurora Green #A3BE8C, horizontal going RIGHT
- Step number: circled "6"

ARROW 7: Smooth Delivery → User (return path, curved)
- Style: solid, Color: Aurora Green #A3BE8C
- Curves below the client section, going LEFT back to User
- Label: "Pace at reading speed" (#A3BE8C, italic, small)

ARROW 8: Executor → GPU
- Style: solid, Color: #6B7280, thin, horizontal going RIGHT
- No step number, no label

SECTION 6 — CONSTRAINTS:

- ZERO decoration — no icons, no illustrations, no ornaments
- NO visible borders on component boxes — they float using subtle shadow only
  (Exception: Andes components have a thin colored LEFT STRIP, not a full border)
- NO thick colored lines — all connections are thin gray except the specific
  colored ones noted above
- NO gradients, NO patterns, NO textures
- Whitespace is a design element — generous spacing between all elements
- NO figure numbers (no "Figure 1:", no "Fig.")
- NO captions below the diagram
- NO watermarks, NO logos
- Background outside sections: pure white #FFFFFF
- CRITICAL TEXT ACCURACY: Every text label must be spelled EXACTLY as specified.
  Do NOT abbreviate, change capitalization, or rearrange boxes.
  Especially: "Token-Level Scheduler", "Request Tracker", "Token Pacer",
  "Overhead Refiner", "KV Cache", "Priority Scheduler"
- The diagram should look like it belongs in Apple's developer documentation
  or a Nature paper — minimal, spacious, professional
"""


def generate_image(prompt_text, attempt_num):
    """Generate one diagram attempt."""
    print(f"\n{'='*60}\nAttempt {attempt_num}\n{'='*60}")
    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt_text,
            config=genai.types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )
        output_path = os.path.join(
            OUTPUT_DIR, f"fig_andes_architecture_attempt{attempt_num}.png"
        )
        for part in response.candidates[0].content.parts:
            if part.inline_data:
                with open(output_path, "wb") as f:
                    f.write(part.inline_data.data)
                size = os.path.getsize(output_path)
                print(f"Saved: {output_path} ({size:,} bytes)")
                return output_path
            elif part.text:
                print(f"Text response: {part.text[:500]}")
        print("WARNING: No image in response")
        return None
    except Exception as e:
        print(f"ERROR: {e}")
        return None


def main():
    print("Generating Andes architecture diagram with Gemini...")
    print(f"Model: {MODEL}")
    print(f"Style: Modern Minimal (Style B)")
    print(f"Palette: Nord")
    print(f"Output dir: {OUTPUT_DIR}")

    results = []
    for i in range(1, 4):
        if i > 1:
            time.sleep(2)  # Rate limit between attempts
        path = generate_image(PROMPT, i)
        if path:
            results.append(path)

    if not results:
        print("\nAll attempts failed!")
        sys.exit(1)

    print(f"\nGenerated {len(results)} attempts:")
    for p in results:
        print(f"  - {p}")
    print("\nReview all attempts and pick the best one.")
    print("Rename the best to: fig_andes_architecture.png")


if __name__ == "__main__":
    main()
