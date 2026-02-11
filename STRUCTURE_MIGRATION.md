# File Structure Reorganization - Migration Summary

## What Was Fixed ✓

### Moved from M-Customs-Manager to M-Practice-Manager
Files that were **incorrectly placed** in M-Customs-Manager have been moved to their proper locations:

1. **Letter Templates** (`mdj_full_template_library/`)
   - **From**: `external/M-Customs-Manager/mdj_full_template_library/`
   - **To**: `external/M-Practice-Manager/assets/templates/`
   - **Contents**: Practice Manager letter templates for HMRC, C285, duty calculations, etc.

2. **Practice Manager UI Components** (`mdj_pm/`)
   - **From**: `external/M-Customs-Manager/mdj_pm/`  
   - **To**: `external/M-Practice-Manager/apps/web/src/components-pm-ui/`
   - **Contents**: Auth context, layout components, login/register pages, MDJ dashboard components

### New Structure

```
M-Suite/
├── apps/
│   └── portal/               (Next.js 16, port 4000)
├── external/
│   ├── M-Practice-Manager/
│   │   ├── apps/
│   │   │   ├── api/         (NestJS, port 3001)
│   │   │   └── web/         (Next.js, port 3000)
│   │   │       └── src/
│   │   │           └── components-pm-ui/  ← PM UI components
│   │   ├── assets/
│   │   │   └── templates/   ← Letter templates
│   │   └── [other PM files]
│   └── M-Customs-Manager/
│       ├── src/            (Vite, port 5173)
│       ├── backend/        (Express, port 3100)
│       └── [config files]
```

## What Needs Attention ⚠️

### Code References to Moved Files
The following files in M-Customs-Manager still reference the moved templates and need updates:

| File | Issue | Action |
|------|-------|--------|
| `src/lib/templateGenerator.ts` | Line 77: References `mdj_full_template_library` | Update path or remove if not needed in Customs |
| `src/components/knowledge/Templates.tsx` | Line 260: References `mdj_full_template_library` | Update path or remove |
| `src/components/DocumentTemplates.tsx` | Line 612: Documentation comment references old location | Update documentation |
| `tsconfig.json` | Line 33: References `mdj_pm` in exclude | Remove from excludes |
| `scripts/copy-templates.sh` | Lines 6-7: References old template paths | Update script or remove if unused |
| `scripts/audit-templates.sh` | Line 11: References old template path | Update script or remove if unused |

### Decision Points

**Option 1: Customs does NOT need templates**
- Remove or disable template-related code from M-Customs-Manager
- Delete `DocumentTemplateGenerator` component and associated code
- This assumes Customs Manager focuses on duty calculations, not document generation

**Option 2: Customs needs its OWN templates**
- Create `external/M-Customs-Manager/assets/templates/` with Customs-specific templates
- Update code references to point to the new location
- This keeps Customs Manager self-contained

**Option 3: Customs references Practice Manager API**
- Have Customs call Practice Manager API to load/generate templates
- Requires HTTP communication between services
- Keeps templates centralized in Practice Manager

### Next Steps
1. Decide which option above makes sense for your architecture
2. Update import paths or remove dead code accordingly
3. Test that both M-Practice-Manager and M-Customs-Manager start without errors
4. Verify template generation works in Practice Manager
5. Update any documentation or deployment scripts that referenced old paths

---
**Completed**: February 10, 2026
**Status**: Directories reorganized; code references need review
