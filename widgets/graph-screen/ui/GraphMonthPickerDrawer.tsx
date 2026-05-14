import { SelectionDrawer } from '@/shared/ui/SelectionDrawer';
import type { GraphMonthPickerDrawerProps } from '../model/GraphScreen.type';

export function GraphMonthPickerDrawer({
  open,
  monthList,
  globalFontSize,
  fontClassName,
  onOpen,
  onClose,
  onSelectMonth,
}: GraphMonthPickerDrawerProps) {
  return (
    <SelectionDrawer
      open={open}
      items={monthList}
      globalFontSize={globalFontSize}
      fontClassName={fontClassName}
      onOpen={onOpen}
      onClose={onClose}
      onSelect={onSelectMonth}
      getKey={(item, index) => item.day || index}
      getLabel={(item) => item.month}
      getItemClassName={(item) => (parseInt(String(item.is_active), 10) === 1 ? 'active' : '')}
    />
  );
}
