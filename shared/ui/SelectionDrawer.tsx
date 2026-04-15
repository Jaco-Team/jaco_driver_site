import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';

interface SelectionDrawerProps<TItem> {
  open: boolean;
  items: TItem[];
  globalFontSize: number;
  fontClassName: string;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (item: TItem) => void;
  getKey: (item: TItem, index: number) => string | number;
  getLabel: (item: TItem) => string;
  getItemClassName?: (item: TItem) => string;
}

export function SelectionDrawer<TItem>({
  open,
  items,
  globalFontSize,
  fontClassName,
  onOpen,
  onClose,
  onSelect,
  getKey,
  getLabel,
  getItemClassName,
}: SelectionDrawerProps<TItem>) {
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      sx={{
        '& .MuiDrawer-paper': {
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          background: 'linear-gradient(180deg, #f8fbff 0%, #ffffff 24%)',
          boxShadow: '0 -20px 44px rgba(15, 23, 42, 0.18)',
          overflow: 'hidden',
        },
      }}
    >
      <div className={`monthDrawer ${fontClassName}`}>
        <div className="monthDrawer__handle" />

        <List className="monthList">
          {items.map((item, index) => (
            <ListItem
              disablePadding
              key={getKey(item, index)}
              className={getItemClassName?.(item) ?? ''}
              onClick={() => onSelect(item)}
            >
              <ListItemButton>
                <ListItemText
                  primary={getLabel(item)}
                  sx={{
                    '& .MuiTypography-root': {
                      fontSize: globalFontSize,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </div>
    </SwipeableDrawer>
  );
}
