# Plan: Nested Layouts & Custom Components

This document outlines the implementation strategy for supporting nested layouts (containers) and custom extensible components within the Nexus LMS Stage Builder.

## 1. Nested Layouts (Container Block)

To avoid recursive database relations while maintaining high performance, nested layouts will be implemented using **Recursive JSON Storage**.

### Data Structure
- **Block Type**: `container`
- **Content Field**: Child blocks are stored within the `content` JSON column.
  - `content.layout`: The layout type for the container (e.g., `split_50_50`, `triple_column`).
  - `content.slots`: An object mapping slot keys to arrays of blocks (e.g., `content.slots.left = [...]`).

### UI & UX
- **Recursive SlotZone**: The `SlotZone` component will be refactored to be self-referential. A `SlotZone` can contain `BlockCanvasItem`s, which can in turn be a `ContainerBlock` hosting its own `SlotZone`s.
- **Visual Nesting**: Nested containers will have subtle indentations and distinct border styles to ensure clarity while editing.

---

## 2. Custom Components

Custom components provide a bridge for specialized content (e.g., interactive labs, external tools) that don't fit the standard block types.

### Extensibility Pattern
- **Block Type**: `custom`
- **Renderer Key**: Stored in `content.renderer_key`. The frontend uses a dynamic registry to look up and mount the correct React component.
- **Flexible Config**: The `content.config` object will store all properties specific to that custom renderer.

### Inspector Interface
- The sidebar inspector will switch to a "Flexible Config" mode when a custom block is selected, allowing users to edit key-value pairs or use a custom-defined editor UI.

---

## 3. Implementation Phases

### Phase 1: Registry & Backend Updates
- **Backend**: Update `App\Models\ContentBlock` to include `container` and `custom` in `VALID_BLOCK_TYPES`.
- **Frontend**: Update `registry.js` to define the palette presets and default JSON structures for these types.

### Phase 2: Recursive Rendering Architecture
- **Component Refactor**: Move `SlotZone` out of `LayoutRenderer.jsx` into a shared component.
- **Renderer Implementation**: Create the `ContainerBlock` renderer in `blockRenderers.jsx` that instantiates nested `SlotZone`s based on its internal layout.

### Phase 3: Nested DnD Orchestration
- **ID Convention**: Update the `dnd-kit` ID system to support deep paths (e.g., `slot:pageId:parentBlockId:slotKey`).
- **Collision Detection**: Optimize `closestCorners` to handle nested droppable targets correctly.
- **Operations**: Update `operations.js` to handle moving blocks into and out of nested containers.

### Phase 4: Custom Component Logic
- **Dynamic Registry**: Implement a lookup map for custom renderers.
- **Custom Editor**: Add a generic "Property Editor" in `blockEditors.jsx` for custom block configuration.

---

## 4. Verification & Testing
- **Unit Tests**: Add tests for recursive serialization and deserialization in `registry.js`.
- **Feature Tests**: Update `TopicSectionCrudTest.php` to verify the persistence of deeply nested JSON structures.
- **Visual Audit**: Verify drag-and-drop stability for multiple nesting levels.
