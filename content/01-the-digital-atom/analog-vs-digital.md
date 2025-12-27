---
title: "Analog vs. Digital"
slug: "analog-vs-digital"
weight: 1
draft: true
---

Continuous vs. discrete signals, sampling, quantization error, why digital wins for storage.

# Heading 1: Analog vs. Digital Signals

This is a paragraph with **bold text** and *italic text*. You can also combine them: ***bold and italic***. Here's some `inline code` within a sentence.

## Heading 2: Understanding Continuous Signals

Analog signals are continuous waveforms that can take on any value within a range. They represent real-world phenomena like sound waves, temperature, and light intensity.

### Heading 3: Key Characteristics

Here are some important points:

- **Continuous values**: Analog signals can represent infinite values
- **Noise susceptibility**: Analog signals degrade with each copy
- **Real-world representation**: Directly mirror physical phenomena

#### Heading 4: Digital Signal Basics

Digital signals, on the other hand, are discrete representations:

1. **Binary representation**: Uses only 0s and 1s
2. **Sampling**: Converts continuous signals to discrete samples
3. **Quantization**: Maps samples to finite set of values
4. **Encoding**: Represents values using binary digits

##### Heading 5: Technical Details

The conversion process involves several steps:

###### Heading 6: Deep Dive

At the most granular level, we examine individual bits.

## Text Formatting Examples

Here's a paragraph with various text formatting:

- **Bold text** for emphasis
- *Italic text* for subtle emphasis
- ***Bold and italic*** for strong emphasis
- `code` for technical terms
- ~~Strikethrough~~ for deleted content
- <mark>Highlighted text</mark> (if supported)
- <sub>Subscript</sub> and <sup>Superscript</sup>

## Lists

### Unordered Lists

- First item
- Second item
  - Nested item
  - Another nested item
    - Deeply nested item
- Third item

### Ordered Lists

1. First numbered item
2. Second numbered item
   1. Nested numbered item
   2. Another nested numbered item
3. Third numbered item

### Task Lists

- [x] Completed task
- [x] Another completed task
- [ ] Incomplete task
- [ ] Another incomplete task

### Mixed Lists

1. First item with sub-items
   - Sub-item A
   - Sub-item B
2. Second item with sub-items
   - Sub-item C
     - Deep sub-item

## Links

Here are various link formats:

- [Inline link](https://example.com)
- [Link with title](https://example.com "Example Title")
- [Reference link][ref1]
- [Automatic link](https://example.com)
- Email link: <user@example.com>

[ref1]: https://example.com "Reference Link"

## Images

Here are image examples:

![Alt text for image](https://via.placeholder.com/400x300 "Image title")

![Local image](./image.png)

## Code Blocks

### Inline Code

Use `console.log()` to print output. The `function` keyword defines a function.

### Code Blocks with Syntax Highlighting

```javascript
function analogToDigital(signal, sampleRate) {
  const samples = [];
  for (let i = 0; i < signal.length; i += sampleRate) {
    samples.push(quantize(signal[i]));
  }
  return samples;
}
```

```python
def sample_analog_signal(signal, rate):
    """Sample an analog signal at given rate."""
    samples = []
    for i in range(0, len(signal), rate):
        samples.append(quantize(signal[i]))
    return samples
```

```rust
fn analog_to_digital(signal: &[f64], sample_rate: usize) -> Vec<u8> {
    signal
        .iter()
        .step_by(sample_rate)
        .map(|&x| quantize(x))
        .collect()
}
```

```bash
# Shell command example
ffmpeg -i input.wav -ar 44100 output.wav
```

```sql
SELECT * FROM signals 
WHERE type = 'analog' 
ORDER BY timestamp DESC 
LIMIT 10;
```

```json
{
  "signal": {
    "type": "analog",
    "frequency": 440,
    "amplitude": 1.0,
    "sample_rate": 44100
  }
}
```

## Blockquotes

> This is a blockquote. It can span multiple lines
> and contain various formatting like **bold** and *italic*.

> Nested blockquote:
> > This is a nested blockquote
> > with multiple levels

> Blockquote with code:
> ```javascript
> const example = "code in blockquote";
> ```

## Tables

### Basic Table

| Signal Type | Values | Storage | Noise |
|-------------|--------|---------|-------|
| Analog      | Infinite | Degrades | High |
| Digital     | Discrete | Perfect | Low |

### Table with Alignment

| Left Aligned | Center Aligned | Right Aligned |
|:-------------|:--------------:|--------------:|
| Left         | Center         | Right         |
| Data         | More Data      | Numbers       |

### Complex Table

| Feature | Analog | Digital | Notes |
|---------|--------|---------|-------|
| **Precision** | Continuous | Discrete | Digital limited by bit depth |
| **Storage** | Degrades over time | Perfect copies | Digital advantage |
| **Processing** | Analog circuits | Digital processors | Digital more flexible |
| **Bandwidth** | Limited | Limited by sampling | Nyquist theorem applies |

## Horizontal Rules

---

Above is a horizontal rule created with three dashes.

***

Above is a horizontal rule created with three asterisks.

___

Above is a horizontal rule created with three underscores.

## Mathematical Expressions (if supported)

Inline math: $E = mc^2$

Block math:

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

## Definition Lists (if supported)

Term 1
: Definition 1 with multiple lines
  and continuation

Term 2
: Definition 2

## Footnotes

Here's a sentence with a footnote[^1]. And another reference[^2].

[^1]: This is the first footnote.
[^2]: This is the second footnote with **formatting**.

## Abbreviations (if supported)

The HTML specification is maintained by the W3C.

*[HTML]: HyperText Markup Language
*[W3C]: World Wide Web Consortium

## Escaped Characters

Here are some escaped special characters: \*asterisk\*, \_underscore\_, \`backtick\`, \[bracket\], \(parenthesis\).

## Line Breaks

This line ends with two spaces.  
This creates a line break.

This line ends with a backslash.\
This also creates a line break.

## Emphasis Variations

- *single asterisk*
- _single underscore_
- **double asterisk**
- __double underscore__
- ***triple asterisk***
- ___triple underscore___

## Special Characters

- Copyright: ©
- Trademark: ™
- Registered: ®
- Em dash: —
- En dash: –
- Ellipsis: …

## Mixed Content Example

Here's a paragraph that combines multiple elements: **bold text**, *italic text*, `code`, and a [link](https://example.com).

> This blockquote contains:
> 1. A numbered list
> 2. With **bold** and *italic*
> 3. And `code` examples

```python
# Code block example
def example():
    return "Hello, World!"
```

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |

## Conclusion

This document demonstrates various markdown elements including:

- Headers (H1-H6)
- Text formatting (bold, italic, code)
- Lists (ordered, unordered, task lists)
- Links and images
- Code blocks with syntax highlighting
- Blockquotes
- Tables
- Horizontal rules
- And more!

---

*Last updated: Test document for markdown rendering*
