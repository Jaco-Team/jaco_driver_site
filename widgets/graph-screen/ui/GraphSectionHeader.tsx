import type { ReactNode } from 'react';

import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

export function GraphSectionHeader({ icon, title }: { icon: ReactNode; title: string }) {
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

export function EmptyTableRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="graph__emptyCell">
        {text}
      </TableCell>
    </TableRow>
  );
}
