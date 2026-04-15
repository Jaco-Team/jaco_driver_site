import { GraphMonthItem } from '@/entities/graph/model/types';
import { SelectionDrawer } from '@/shared/ui/SelectionDrawer';

interface GraphMonthPickerDrawerProps {
  open: boolean;
  monthList: GraphMonthItem[];
  globalFontSize: number;
  fontClassName: string;
  onOpen: () => void;
  onClose: () => void;
  onSelectMonth: (item: GraphMonthItem) => void;
}

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
      getLabel={(item) => item.mounth}
      getItemClassName={(item) => (parseInt(String(item.is_active), 10) === 1 ? 'active' : '')}
    />
  );
}
