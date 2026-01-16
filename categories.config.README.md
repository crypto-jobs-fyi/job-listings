# Categories Configuration

This file defines all job categories displayed on the Job Finder platform.

## Quick Start

To add a new category (e.g., "DeFi"):

1. Edit this file and add your category to the `CATEGORIES` array
2. Run: `node scripts/generate-entry-points.js`
3. Update `src/stores/jobs.ts` with fetch methods for the new category
4. Restart dev server

See [ADDING_CATEGORIES.md](ADDING_CATEGORIES.md) for complete documentation.

## Configuration Structure

```javascript
{
  id: 'unique-id',           // Lowercase, no spaces, used in URLs
  name: 'Display Name',       // Shown to users
  color: '#hex-color',        // Button background
  hoverColor: '#hex-color',   // Button hover state
  endpoints: {
    jobs: 'https://...',      // All jobs JSON
    companies: 'https://...',  // Companies JSON
    current: 'https://...',    // Stats JSON
    newJobs: 'https://...',    // New jobs JSON
  }
}
```

## Current Categories

- **Crypto**: Cryptocurrency and blockchain jobs
- **AI**: Artificial intelligence and machine learning jobs

## Adding Categories

See [ADDING_CATEGORIES.md](ADDING_CATEGORIES.md) for step-by-step instructions.

## Validation

The configuration automatically validates on import:
- Checks for required fields
- Ensures endpoint URLs are valid
- Prevents duplicate category IDs

If validation fails, you'll see an error when running the generation script.
