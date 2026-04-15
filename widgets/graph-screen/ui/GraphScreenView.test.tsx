import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { GraphScreenView } from '@/widgets/graph-screen/ui/GraphScreenView';

const noop = vi.fn();

describe('GraphScreenView', () => {
  it('renders empty graph states without crashing', () => {
    render(
      <GraphScreenView
        globalFontSize={16}
        fontClassName=""
        point=""
        pointList={[]}
        isPointDrawerOpen={false}
        month=""
        monthList={[]}
        dates={[]}
        users={[]}
        currentUserId=""
        currentUserName=""
        chooseDate="2026-04"
        errOrders={[]}
        errCam={[]}
        isMonthDrawerOpen={false}
        errorModal={null}
        alertText=""
        isAlertOpen={false}
        appealText=""
        isSubmittingAppeal={false}
        onOpenPointDrawer={noop}
        onClosePointDrawer={noop}
        onSelectPoint={noop}
        onOpenMonthDrawer={noop}
        onCloseMonthDrawer={noop}
        onSelectMonth={noop}
        onOpenOrderError={noop}
        onOpenCameraError={noop}
        onCloseErrorModal={noop}
        onChangeAppealText={noop}
        onSubmitOrderAppeal={noop}
        onSubmitCameraAppeal={noop}
        onCloseAlert={noop}
      />
    );

    expect(screen.getByText('За выбранный месяц пока нет данных по графику.')).toBeInTheDocument();
    expect(screen.getByText('Ошибок по заказам за выбранный период нет.')).toBeInTheDocument();
    expect(screen.getByText('Ошибок по камерам за выбранный период нет.')).toBeInTheDocument();
  });

  it('marks the current user row in the schedule table', () => {
    const { container } = render(
      <GraphScreenView
        globalFontSize={16}
        fontClassName=""
        point=""
        pointList={[]}
        isPointDrawerOpen={false}
        month="Апрель 2026"
        monthList={[]}
        dates={[{ day: '10', dow: 'чт' }]}
        users={[
          [
            { user_id: '15', user_name: 'Иван Иванов' },
            { min: '480', hours: '08:00' },
          ],
        ]}
        currentUserId="15"
        currentUserName=""
        chooseDate="2026-04"
        errOrders={[]}
        errCam={[]}
        isMonthDrawerOpen={false}
        errorModal={null}
        alertText=""
        isAlertOpen={false}
        appealText=""
        isSubmittingAppeal={false}
        onOpenPointDrawer={noop}
        onClosePointDrawer={noop}
        onSelectPoint={noop}
        onOpenMonthDrawer={noop}
        onCloseMonthDrawer={noop}
        onSelectMonth={noop}
        onOpenOrderError={noop}
        onOpenCameraError={noop}
        onCloseErrorModal={noop}
        onChangeAppealText={noop}
        onSubmitOrderAppeal={noop}
        onSubmitCameraAppeal={noop}
        onCloseAlert={noop}
      />
    );

    expect(container.querySelector('.graph__scheduleRow--current')).toBeTruthy();
    expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
    expect(screen.getByText('08:00')).toBeInTheDocument();
  });
});
