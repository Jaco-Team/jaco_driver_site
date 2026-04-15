import { useEffect, useState } from 'react';

import dayjs from 'dayjs';

import useSession from '@/components/sessionHook';
import { useHeaderStore } from '@/features/header/model/header.store';
import { useSettingsStore } from '@/entities/settings/model/settings.store';
import { getActiveMonthLabel } from '@/entities/graph/model/graph.utils';
import { GraphMonthItem, GraphOrderError, GraphCameraError } from '@/entities/graph/model/types';
import { useGraphStore } from '@/widgets/graph-screen/model/graph.store';
import { GraphScreenView } from '@/widgets/graph-screen/ui/GraphScreenView';
import { roboto } from '@/ui/Font';
import { log } from '@/components/analytics';

function toPointId(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  return `${value}`;
}

export default function GraphScreen() {
  const session = useSession();
  const globalFontSize = useHeaderStore((state) => state.globalFontSize);
  const getMySetting = useSettingsStore((state) => state.getMySetting);
  const {
    isMonthDrawerOpen,
    errorModal,
    alertText,
    isAlertOpen,
    appealText,
    isSubmittingAppeal,
    monthList,
    dates,
    users,
    currentUserId,
    currentUserName,
    errOrders,
    errCam,
    chooseDate,
    setMonthDrawerOpen,
    setSelectedPointId,
    setAppealText,
    closeAlert,
    closeErrorModal,
    openOrderErrorModal,
    openCameraErrorModal,
    loadGraph,
    submitOrderAppeal,
    submitCameraAppeal,
  } = useGraphStore((state) => ({
    isMonthDrawerOpen: state.isMonthDrawerOpen,
    errorModal: state.errorModal,
    alertText: state.alertText,
    isAlertOpen: state.isAlertOpen,
    appealText: state.appealText,
    isSubmittingAppeal: state.isSubmittingAppeal,
    monthList: state.monthList,
    dates: state.dates,
    users: state.users,
    currentUserId: state.currentUserId,
    currentUserName: state.currentUserName,
    errOrders: state.errOrders,
    errCam: state.errCam,
    chooseDate: state.chooseDate,
    setMonthDrawerOpen: state.setMonthDrawerOpen,
    setSelectedPointId: state.setSelectedPointId,
    setAppealText: state.setAppealText,
    closeAlert: state.closeAlert,
    closeErrorModal: state.closeErrorModal,
    openOrderErrorModal: state.openOrderErrorModal,
    openCameraErrorModal: state.openCameraErrorModal,
    loadGraph: state.loadGraph,
    submitOrderAppeal: state.submitOrderAppeal,
    submitCameraAppeal: state.submitCameraAppeal,
  }));

  const [isLoaded, setIsLoaded] = useState(false);
  const month = getActiveMonthLabel(monthList);
  const sessionPointId = toPointId(session?.user?.point_id);

  useEffect(() => {
    const fetchData = async () => {
      if (session?.isAuth === true) {
        let initialPointId = sessionPointId;

        try {
          const settings = await getMySetting(session?.token ?? '');
          initialPointId = toPointId(settings?.point_id) || initialPointId;
        } catch {
          initialPointId = sessionPointId;
        }

        setSelectedPointId(initialPointId);
        await loadGraph(dayjs().format('YYYY-MM'), initialPointId || undefined);
        setIsLoaded(true);
      }
    };

    if (!isLoaded) {
      void fetchData();
    }
  }, [
    getMySetting,
    isLoaded,
    loadGraph,
    session?.isAuth,
    session?.token,
    sessionPointId,
    setSelectedPointId,
  ]);

  const handleOpenMonthDrawer = () => {
    log('graph_month_picker_open', 'Открытие выбора месяца (График работы)');
    setMonthDrawerOpen(true);
  };

  const handleCloseMonthDrawer = () => {
    log('graph_month_picker_close', 'Закрытие выбора месяца (График работы)');
    setMonthDrawerOpen(false);
  };

  const handleSelectMonth = (item: GraphMonthItem) => {
    log('graph_month_selected', 'Выбор месяца (График работы)');
    setMonthDrawerOpen(false);
    void loadGraph(item.day);
  };

  const handleOpenOrderError = (item: GraphOrderError) => {
    log('graph_errorder_modal_open', 'Открытие модалки ошибки по заказу');
    openOrderErrorModal(item);
  };

  const handleOpenCameraError = (item: GraphCameraError) => {
    log('graph_errcam_modal_open', 'Открытие модалки ошибки по камерам');
    openCameraErrorModal(item);
  };

  const handleCloseErrorModal = () => {
    if (errorModal?.kind === 'order') {
      log('graph_errorder_modal_close', 'Закрытие модалки ошибки по заказу');
    }

    if (errorModal?.kind === 'camera') {
      log('graph_errcam_modal_close', 'Закрытие модалки ошибки по камерам');
    }

    closeErrorModal();
  };

  return (
    <GraphScreenView
      globalFontSize={globalFontSize}
      fontClassName={roboto.variable}
      month={month}
      monthList={monthList}
      dates={dates}
      users={users}
      currentUserId={currentUserId}
      currentUserName={currentUserName}
      chooseDate={chooseDate}
      errOrders={errOrders}
      errCam={errCam}
      isMonthDrawerOpen={isMonthDrawerOpen}
      errorModal={errorModal}
      alertText={alertText}
      isAlertOpen={isAlertOpen}
      appealText={appealText}
      isSubmittingAppeal={isSubmittingAppeal}
      onOpenMonthDrawer={handleOpenMonthDrawer}
      onCloseMonthDrawer={handleCloseMonthDrawer}
      onSelectMonth={handleSelectMonth}
      onOpenOrderError={handleOpenOrderError}
      onOpenCameraError={handleOpenCameraError}
      onCloseErrorModal={handleCloseErrorModal}
      onChangeAppealText={setAppealText}
      onSubmitOrderAppeal={() => {
        void submitOrderAppeal();
      }}
      onSubmitCameraAppeal={() => {
        void submitCameraAppeal();
      }}
      onCloseAlert={closeAlert}
    />
  );
}
