import { useState } from "react";

type UseAddAndSelectPresetOptions<T> = {
  initialPresets: T[];
  selectionKeys: string[];
  getDiscriminator: (key: string) => string;
};

function useAddAndSelectPresetGeneric<T extends { id: string }>(
  options: UseAddAndSelectPresetOptions<T>,
) {
  const { initialPresets, selectionKeys } = options;
  const [presets, setPresets] = useState<T[]>(initialPresets);
  const [selectedPresets, setSelectedPresets] = useState<
    Record<string, string>
  >(Object.fromEntries(selectionKeys.map((k) => [k, "none"])));
  const [showDialog, setShowDialog] = useState<null | string>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const handleAddPreset = (key: string) => {
    setShowDialog(key);
    setPendingKey(key);
  };

  const handlePresetCreated = (newPreset: T | undefined) => {
    if (newPreset && pendingKey) {
      setPresets((prev) => [...prev, newPreset]);
      setSelectedPresets((prev) => ({
        ...prev,
        [pendingKey]: newPreset.id,
      }));
    }
    setShowDialog(null);
  };

  const handlePresetChange = (key: string, presetId: string) => {
    setSelectedPresets((prev) => ({
      ...prev,
      [key]: presetId,
    }));
  };

  return {
    presets,
    selectedPresets,
    setSelectedPresets,
    showDialog,
    setShowDialog,
    pendingKey,
    setPendingKey,
    handleAddPreset,
    handlePresetCreated,
    handlePresetChange,
  };
}

export { useAddAndSelectPresetGeneric };
export type { UseAddAndSelectPresetOptions };
