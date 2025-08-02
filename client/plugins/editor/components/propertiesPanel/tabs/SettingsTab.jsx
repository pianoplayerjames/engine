import { Section, Field, Toggle, ColorPicker } from '@/plugins/ui';
import { globalStore, actions } from "@/store.js";
import { useSnapshot } from 'valtio';

const SettingsTab = () => {
  const settings = useSnapshot(globalStore.editor.settings);
  const { viewport: viewportSettings } = settings;
  const { updateViewportSettings } = actions.editor;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div>
        <Section title="Viewport" defaultOpen={true} index={1}>
          <div className="space-y-4">
            {/* Background Color */}
            <Field label="Background Color">
              <ColorPicker 
                value={viewportSettings.backgroundColor} 
                onChange={(color) => updateViewportSettings({ backgroundColor: color })}
                showValue={true}
              />
            </Field>

            {/* Quick Background Presets */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Quick Presets</label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => updateViewportSettings({ backgroundColor: '#1a202c' })}
                  className="h-8 rounded-lg border border-slate-600 transition-all hover:scale-105 hover:border-blue-500"
                  style={{ backgroundColor: '#1a202c' }}
                  title="Dark Blue"
                />
                <button
                  onClick={() => updateViewportSettings({ backgroundColor: '#000000' })}
                  className="h-8 rounded-lg border border-slate-600 transition-all hover:scale-105 hover:border-blue-500"
                  style={{ backgroundColor: '#000000' }}
                  title="Black"
                />
                <button
                  onClick={() => updateViewportSettings({ backgroundColor: '#374151' })}
                  className="h-8 rounded-lg border border-slate-600 transition-all hover:scale-105 hover:border-blue-500"
                  style={{ backgroundColor: '#374151' }}
                  title="Gray"
                />
                <button
                  onClick={() => updateViewportSettings({ backgroundColor: '#ffffff' })}
                  className="h-8 rounded-lg border border-slate-600 transition-all hover:scale-105 hover:border-blue-500"
                  style={{ backgroundColor: '#ffffff' }}
                  title="White"
                />
              </div>
            </div>
          </div>
        </Section>

        <Section title="Performance" defaultOpen={false} index={3}>
          <div className="space-y-4">
            {/* Stats.js Toggle */}
            <Toggle
              label="Performance Stats"
              description="Show FPS, memory usage, and render statistics"
              checked={settings.editor.showStats}
              onChange={(newValue) => {
                console.log('ScenePanel: Stats toggle clicked, newValue:', newValue);
                actions.editor.updateEditorSettings({ showStats: newValue });
                actions.editor.addConsoleMessage(`Performance stats ${newValue ? 'enabled' : 'disabled'}`, 'success');
              }}
              className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50"
            />
          </div>
        </Section>
      </div>
    </div>
  );
};

export default SettingsTab;