import EditorLayout from '@/plugins/editor/components/EditorLayout';

function EditorPlugin() {
  return <EditorLayout />;
}

export default EditorPlugin;

// Export store references for backward compatibility
export { editorState, editorActions } from '@/store.js'