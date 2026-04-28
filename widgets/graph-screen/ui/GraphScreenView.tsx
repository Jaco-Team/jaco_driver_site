import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';

import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';

import {
  GraphCameraError,
  GraphErrorModal,
  GraphMonthItem,
  GraphOrderError,
  GraphScheduleRow,
} from '@/entities/graph/model/types';
import { GraphAlertDialog } from '@/widgets/graph-screen/ui/GraphAlertDialog';
import { GraphErrorDrawer } from '@/widgets/graph-screen/ui/GraphErrorDrawer';
import { GraphIssuesCard } from '@/widgets/graph-screen/ui/GraphIssuesCard';
import { GraphMonthPickerDrawer } from '@/widgets/graph-screen/ui/GraphMonthPickerDrawer';
import { GraphScheduleCard } from '@/widgets/graph-screen/ui/GraphScheduleCard';

export interface GraphScreenViewProps {
  globalFontSize: number;
  fontClassName: string;
  month: string;
  monthList: GraphMonthItem[];
  dates: Array<{ day: number | string; dow: string }>;
  users: GraphScheduleRow[];
  currentUserId: string;
  currentUserName: string;
  chooseDate: string;
  errOrders: GraphOrderError[];
  errCam: GraphCameraError[];
  isMonthDrawerOpen: boolean;
  errorModal: GraphErrorModal;
  alertText: string;
  isAlertOpen: boolean;
  appealText: string;
  isSubmittingAppeal: boolean;
  onOpenMonthDrawer: () => void;
  onCloseMonthDrawer: () => void;
  onSelectMonth: (item: GraphMonthItem) => void;
  onOpenOrderError: (item: GraphOrderError) => void;
  onOpenCameraError: (item: GraphCameraError) => void;
  onCloseErrorModal: () => void;
  onChangeAppealText: (value: string) => void;
  onSubmitOrderAppeal: () => void;
  onSubmitCameraAppeal: () => void;
  onCloseAlert: () => void;
}

export function GraphScreenView({
  globalFontSize,
  fontClassName,
  month,
  monthList,
  dates,
  users,
  currentUserId,
  currentUserName,
  chooseDate,
  errOrders,
  errCam,
  isMonthDrawerOpen,
  errorModal,
  alertText,
  isAlertOpen,
  appealText,
  isSubmittingAppeal,
  onOpenMonthDrawer,
  onCloseMonthDrawer,
  onSelectMonth,
  onOpenOrderError,
  onOpenCameraError,
  onCloseErrorModal,
  onChangeAppealText,
  onSubmitOrderAppeal,
  onSubmitCameraAppeal,
  onCloseAlert,
}: GraphScreenViewProps) {
  return (
    <Grid container spacing={2} className={`graph graphScreen ${fontClassName}`}>
      <Grid size={12}>
        <div className="graph__content">
          <Paper className="graph__hero">
            <div className="graph__heroTop">
              <div className="graph__heroMain">
                <span className="graph__eyebrow">График работы</span>
              </div>

              <Grid
                container
                spacing={1.5}
                justifyContent="flex-end"
                className="graph__monthAction"
              >
                <Grid className="graph__monthActionItem">
                  <Button
                    variant="outlined"
                    className="graph__monthButton"
                    style={{ fontSize: globalFontSize }}
                    endIcon={<KeyboardArrowDownRoundedIcon />}
                    onClick={onOpenMonthDrawer}
                  >
                    {month || 'Выберите месяц'}
                  </Button>
                </Grid>
              </Grid>
            </div>
          </Paper>
        </div>
      </Grid>

      <Grid size={12}>
        <GraphScheduleCard
          globalFontSize={globalFontSize}
          dates={dates}
          users={users}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          chooseDate={chooseDate}
          icon={<QueryStatsRoundedIcon fontSize="inherit" />}
        />
      </Grid>

      <Grid size={12}>
        <GraphIssuesCard
          title="Ошибки по заказам"
          icon={<ReceiptLongRoundedIcon fontSize="inherit" />}
          emptyText="Ошибок по заказам за выбранный период нет."
          dateColumnTitle="Дата заказа"
          items={errOrders}
          globalFontSize={globalFontSize}
          getDate={(item) => item.date_time_order}
          getError={(item) => item.pr_name}
          onOpen={onOpenOrderError}
        />
      </Grid>

      <Grid size={12}>
        <GraphIssuesCard
          title="Ошибки по камерам"
          icon={<VideocamRoundedIcon fontSize="inherit" />}
          emptyText="Ошибок по камерам за выбранный период нет."
          dateColumnTitle="Дата и время"
          items={errCam}
          globalFontSize={globalFontSize}
          getDate={(item) => item.date_time_fine}
          getError={(item) => item.fine_name}
          onOpen={onOpenCameraError}
        />
      </Grid>

      <GraphMonthPickerDrawer
        open={isMonthDrawerOpen}
        monthList={monthList}
        globalFontSize={globalFontSize}
        fontClassName={fontClassName}
        onOpen={onOpenMonthDrawer}
        onClose={onCloseMonthDrawer}
        onSelectMonth={onSelectMonth}
      />

      <GraphErrorDrawer
        open={Boolean(errorModal)}
        errorModal={errorModal}
        globalFontSize={globalFontSize}
        fontClassName={fontClassName}
        appealText={appealText}
        isSubmittingAppeal={isSubmittingAppeal}
        onChangeAppealText={onChangeAppealText}
        onClose={onCloseErrorModal}
        onSubmitOrderAppeal={onSubmitOrderAppeal}
        onSubmitCameraAppeal={onSubmitCameraAppeal}
      />

      <GraphAlertDialog
        open={isAlertOpen}
        text={alertText}
        globalFontSize={globalFontSize}
        onClose={onCloseAlert}
      />
    </Grid>
  );
}
