# Development Notes

This file tracks ongoing work, decisions, and technical details for the personal site project.

## Current Status (2025-08-21)

### Recent Completed Features
- Interactive felt-tip marker drawing system on landing page
- Graph paper background with engineering aesthetic
- Kraft paper navigation with architectural typography
- Circular cursor shadow for drawing interaction feedback
- Initial doodles (stars, rockets, stick figures, smiley faces)
- Refresh icon in bottom left corner to clear drawings
- Disabled text selection during drawing interactions
- Comprehensive Makefile for build automation and GitHub Pages publishing

### Technical Implementation Details

#### Interactive Drawing System (`src/assets/js/coffee-painter.js`)
- Uses HTML5 Canvas API for smooth felt-tip marker effect
- Navy color scheme (`#1a365d`) matching site typography
- Throttled drawing at ~60fps for performance
- Gentle fade effect using `destination-out` composite operation
- Mobile touch support with event prevention
- Memory management: clears old strokes after 60 seconds

#### Skeuomorphic Design Elements
- **Graph Paper Background** (`src/_sass/components/graph-paper.sass`):
  - CSS gradient-based grid pattern (100px major, 20px minor)
  - Different opacity levels for home vs other pages
  - Mobile-optimized simplified grid for performance
  
- **Kraft Paper Navigation** (`src/_sass/components/nav.sass`):
  - Linear gradient background (#d4b896 → #c9a876 → #c19f6b)
  - Subtle paper texture using radial gradients
  - Dark navy architectural typography with text-shadow effects

#### Typography & Color Scheme
- **Primary Text Color**: `#1a365d` (dark navy)
- **Hover/Accent Color**: `#2c5282` (lighter navy)
- **Background**: Nord5 (`$nord5`) for softer appearance
- **Font Scaling**: Increased base size from 62.5% to 68.75%
- **Architectural Headers**: Uppercase, letter-spaced, with felt-pen text-shadow
- **Hand-drawn Effect**: Subtle rotation transforms (-0.3deg to 0.1deg)

### Build System (`Makefile`)
- **Development**: `make dev` (clean → install → build → serve)
- **Production**: `make publish` or `make publish-force`
- **GitHub Pages**: Automated sync to eric-tramel.github.io repository
- **Docker Support**: Available with `-docker` suffix commands

### Design Philosophy
- Engineering/architectural workspace aesthetic
- Skeuomorphic elements (graph paper, kraft paper, felt pen)
- Interactive but subtle - drawings enhance without distracting
- Maintains excellent readability while adding character
- Mobile-responsive with performance optimizations

## Known Issues & Considerations
- Complex math equations didn't render well with stroke-based drawing
- Refresh icon provides satisfying interaction feedback with rotation animation
- Drawing canvas layered properly above graph paper but below UI elements
- Text selection disabled only on home page to maintain normal functionality elsewhere

## Future Considerations
- Could add drawing persistence using localStorage
- Potential for different drawing tools (pencil, brush, etc.)
- Animation timing could be tuned based on user feedback
- Mobile drawing experience could be enhanced further

---

*Last updated: 2025-08-21*
*Branch: 2025-refresh*
*Live site: https://eric-tramel.github.io*