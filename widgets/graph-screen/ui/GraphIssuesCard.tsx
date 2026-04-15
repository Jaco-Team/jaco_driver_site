import type { ReactNode } from 'react';

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { GraphCameraError, GraphOrderError } from '@/entities/graph/model/types';
import { EmptyTableRow, GraphSectionHeader } from '@/widgets/graph-screen/ui/GraphSectionHeader';

interface GraphIssuesCardProps<TItem extends GraphOrderError | GraphCameraError> {
  title: string;
  icon: ReactNode;
  emptyText: string;
  dateColumnTitle: string;
  items: TItem[];
  globalFontSize: number;
  getDate: (item: TItem) => string | number | undefined;
  getError: (item: TItem) => string | number | undefined;
  onOpen: (item: TItem) => void;
}

export function GraphIssuesCard<TItem extends GraphOrderError | GraphCameraError>({
  title,
  icon,
  emptyText,
  dateColumnTitle,
  items,
  globalFontSize,
  getDate,
  getError,
  onOpen,
}: GraphIssuesCardProps<TItem>) {
  return (
    <div className="graph__content">
      <Paper className="graph__card">
        <GraphSectionHeader icon={icon} title={title} />

        <div className="graph__tableShell">
          <TableContainer className="graph__tableContainer">
            <Table className="graph__issuesTable">
              <TableHead>
                <TableRow>
                  <TableCell
                    className="graph__tableHeadCell graph__issuesCell--date"
                    style={{ fontSize: globalFontSize }}
                  >
                    {dateColumnTitle}
                  </TableCell>
                  <TableCell
                    className="graph__tableHeadCell graph__issuesCell--error"
                    style={{ fontSize: globalFontSize }}
                  >
                    Ошибка
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {items.length === 0 ? (
                  <EmptyTableRow colSpan={2} text={emptyText} />
                ) : (
                  items.map((item, index) => (
                    <TableRow
                      hover
                      key={index}
                      className="graph__interactiveRow"
                      onClick={() => onOpen(item)}
                    >
                      <TableCell
                        className="graph__issuesCell--date"
                        style={{ fontSize: globalFontSize }}
                      >
                        {getDate(item)}
                      </TableCell>
                      <TableCell
                        className="graph__issuesCell--error"
                        style={{ fontSize: globalFontSize }}
                      >
                        {getError(item)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </Paper>
    </div>
  );
}
