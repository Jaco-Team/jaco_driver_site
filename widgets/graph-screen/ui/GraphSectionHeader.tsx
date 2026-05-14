import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import type { EmptyTableRowProps, GraphSectionHeaderProps } from '../model/GraphScreen.type';

export function GraphSectionHeader({ icon, title }: GraphSectionHeaderProps) {
  return (
    <div className="graph__cardHeader">
      <div className="graph__cardHeaderMain">
        <span className="graph__cardIcon">{icon}</span>

        <div className="graph__cardHeading">
          <h2 className="graph__cardTitle">{title}</h2>
        </div>
      </div>
    </div>
  );
}

export function EmptyTableRow({ colSpan, text }: EmptyTableRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="graph__emptyCell">
        {text}
      </TableCell>
    </TableRow>
  );
}
