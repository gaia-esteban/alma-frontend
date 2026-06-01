---
name: project-grid-conventions
description: Standard pagination and sorting defaults for all data grids in the app
metadata:
  type: project
---

Default page size for all grids is **50 rows**.

- Invoices (incoming orders): set via `limit: 50` in `store/api/incomingOrdersApi.ts` default params
- Suppliers: set via `PAGE_SIZE = 50` constant in `app/(dashboard)/suppliers/page.tsx`
- All future grids must use 50 as the default page size.

**Why:** User preference — consistent across all modules.
**How to apply:** When creating a new grid/table, always initialize with limit/PAGE_SIZE = 50.
