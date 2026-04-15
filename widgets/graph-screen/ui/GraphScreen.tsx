import { useEffect, useState } from 'react';

import dayjs from 'dayjs';

import useSession from '@/components/sessionHook';
import { useHeaderStore } from '@/components/store';
import { getActiveMonthLabel } from '@/entities/graph/model/graph.utils';
import {
  GraphMonthItem,
  GraphOrderError,
  GraphCameraError,
  GraphPointItem,
} from '@/entities/graph/model/types';
import { useGraphStore } from '@/features/graph/model/graph.store';
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
  const [globalFontSize] = useHeaderStore((state) => [state.globalFontSize]);
  const [
    isPointDrawerOpen,
    isMonthDrawerOpen,
    errorModal,
    alertText,
    isAlertOpen,
    appealText,
    isSubmittingAppeal,
    pointList,
    selectedPointId,
    monthList,
    dates,
    users,
    currentUserId,
    currentUserName,
    errOrders,
    errCam,
    chooseDate,
    setPointDrawerOpen,
    setMonthDrawerOpen,
    loadPoints,
    setSelectedPointId,
    setAppealText,
    closeAlert,
    closeErrorModal,
    openOrderErrorModal,
    openCameraErrorModal,
    loadGraph,
    submitOrderAppeal,
    submitCameraAppeal,
  ] = useGraphStore((state) => [
    state.isPointDrawerOpen,
    state.isMonthDrawerOpen,
    state.errorModal,
    state.alertText,
    state.isAlertOpen,
    state.appealText,
    state.isSubmittingAppeal,
    state.pointList,
    state.selectedPointId,
    state.monthList,
    state.dates,
    state.users,
    state.currentUserId,
    state.currentUserName,
    state.errOrders,
    state.errCam,
    state.chooseDate,
    state.setPointDrawerOpen,
    state.setMonthDrawerOpen,
    state.loadPoints,
    state.setSelectedPointId,
    state.setAppealText,
    state.closeAlert,
    state.closeErrorModal,
    state.openOrderErrorModal,
    state.openCameraErrorModal,
    state.loadGraph,
    state.submitOrderAppeal,
    state.submitCameraAppeal,
  ]);

  const [isLoaded, setIsLoaded] = useState(false);
  const month = getActiveMonthLabel(monthList);
  const sessionPointId = toPointId(session?.user?.point_id);
  const isAllPointsUser = sessionPointId === '-1';
  const effectivePointList = isAllPointsUser
    ? [{ id: '-1', name: 'Все кафе' }, ...pointList]
    : pointList;
  const selectedPointName =
    effectivePointList.find((item) => `${item.id}` === selectedPointId)?.name ??
    (isAllPointsUser ? 'Все кафе' : (effectivePointList[0]?.name ?? ''));

  useEffect(() => {
    const fetchData = async () => {
      if (session?.isAuth === true) {
        const points = await loadPoints();
        const fallbackPointId = sessionPointId || `${points[0]?.id ?? ''}`;
        const initialPointId = fallbackPointId || '-1';

        setSelectedPointId(initialPointId);
        await loadGraph(dayjs().format('YYYY-MM'), initialPointId);
        setIsLoaded(true);
      }
    };

    if (!isLoaded) {
      void fetchData();
    }
  }, [isLoaded, loadGraph, loadPoints, session?.isAuth, sessionPointId, setSelectedPointId]);

  const handleOpenPointDrawer = () => {
    log('graph_point_picker_open', 'Открытие выбора кафе (График работы)');
    setPointDrawerOpen(true);
  };

  const handleClosePointDrawer = () => {
    log('graph_point_picker_close', 'Закрытие выбора кафе (График работы)');
    setPointDrawerOpen(false);
  };

  const handleSelectPoint = (item: GraphPointItem) => {
    const nextPointId = `${item.id}`;
    log('graph_point_selected', 'Выбор кафе (График работы)');
    setPointDrawerOpen(false);
    setSelectedPointId(nextPointId);
    void loadGraph(chooseDate || dayjs().format('YYYY-MM'), nextPointId);
  };

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
      point={selectedPointName}
      pointList={effectivePointList}
      isPointDrawerOpen={isPointDrawerOpen}
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
      onOpenPointDrawer={handleOpenPointDrawer}
      onClosePointDrawer={handleClosePointDrawer}
      onSelectPoint={handleSelectPoint}
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
