import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { isCurrentUserRow, isTodayColumn, isWeekend } from '@/entities/graph/model/graph.utils';
import { GraphScheduleRow } from '@/entities/graph/model/types';
import { EmptyTableRow, GraphSectionHeader } from '@/widgets/graph-screen/ui/GraphSectionHeader';

interface GraphScheduleCardProps {
  globalFontSize: number;
  dates: Array<{ day: number | string; dow: string }>;
  users: GraphScheduleRow[];
  currentUserId: string;
  currentUserName: string;
  chooseDate: string;
  icon: React.ReactNode;
}

export function GraphScheduleCard({
  globalFontSize,
  dates,
  users,
  currentUserId,
  currentUserName,
  chooseDate,
  icon,
}: GraphScheduleCardProps) {
  const scheduleTableMinWidth = Math.max(760, 220 + dates.length * 64);

  return (
    <div className="graph__content">
      <Paper className="graph__card graph__card--schedule">
        <GraphSectionHeader icon={icon} title="Таблица смен" />

        <div className="graph__tableShell">
          <TableContainer className="graph__tableContainer" id="tableGraph">
            <Table
              stickyHeader
              className="graph__scheduleTable"
              sx={{ minWidth: scheduleTableMinWidth }}
            >
              <TableHead>
                <TableRow>
                  <TableCell className="graph__tableHeadCell" style={{ fontSize: globalFontSize }}>
                    Дата
                  </TableCell>

                  {dates.map((cellData, cellIndex) => (
                    <TableCell
                      key={cellIndex}
                      className={`graph__tableHeadCell${isWeekend(cellData.dow) ? ' graph__tableHeadCell--weekend' : ''}${isTodayColumn(cellData.day, chooseDate) ? ' graph__tableHeadCell--today' : ''}`}
                      style={{ fontSize: globalFontSize }}
                    >
                      {cellData.day}
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell
                    className="graph__tableHeadCell graph__employeeHeaderCell"
                    style={{ fontSize: globalFontSize }}
                  >
                    Сотрудник
                  </TableCell>

                  {dates.map((cellData, cellIndex) => (
                    <TableCell
                      key={cellIndex}
                      className={`graph__tableHeadCell${isWeekend(cellData.dow) ? ' graph__tableHeadCell--weekend' : ''}${isTodayColumn(cellData.day, chooseDate) ? ' graph__tableHeadCell--today' : ''}`}
                      style={{ fontSize: globalFontSize }}
                    >
                      {cellData.dow}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {users.length === 0 ? (
                  <EmptyTableRow
                    colSpan={Math.max(dates.length + 1, 2)}
                    text="За выбранный месяц пока нет данных по графику."
                  />
                ) : (
                  users.map((rowData, index) => {
                    const isCurrentRow = isCurrentUserRow(rowData, currentUserId, currentUserName);

                    return (
                      <TableRow
                        hover
                        key={index}
                        className={
                          isCurrentRow
                            ? 'graph__scheduleRow graph__scheduleRow--current'
                            : 'graph__scheduleRow'
                        }
                      >
                        {rowData.map((cellData, cellIndex) => {
                          if (cellIndex === 0) {
                            return (
                              <TableCell
                                key={cellIndex}
                                className={`graph__employeeCell${isCurrentRow ? ' graph__employeeCell--current' : ''}`}
                                style={{ fontSize: globalFontSize }}
                              >
                                {cellData.user_name}
                              </TableCell>
                            );
                          }

                          const hasHours = parseInt(String(cellData.min), 10) > 0;
                          const isToday = isTodayColumn(dates[cellIndex - 1]?.day, chooseDate);
                          const hoursCellClasses = [
                            'graph__hoursCell',
                            hasHours ? 'graph__hoursCell--filled' : '',
                            isCurrentRow ? 'graph__hoursCell--currentRow' : '',
                            isToday ? 'graph__hoursCell--today' : '',
                            isCurrentRow && isToday ? 'graph__hoursCell--currentToday' : '',
                          ]
                            .filter(Boolean)
                            .join(' ');

                          return (
                            <TableCell
                              key={cellIndex}
                              className={hoursCellClasses}
                              style={{ fontSize: globalFontSize }}
                            >
                              {hasHours ? cellData.hours : ''}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </Paper>
    </div>
  );
}
