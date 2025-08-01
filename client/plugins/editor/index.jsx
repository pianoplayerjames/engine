import EditorLayout from '@/plugins/editor/components/EditorLayout';

function EditorPlugin() {
  return <EditorLayout />;
}

export default EditorPlugin;

// Editor functionality is now part of the unified store
// Access via: globalStore.editor and actions.editor