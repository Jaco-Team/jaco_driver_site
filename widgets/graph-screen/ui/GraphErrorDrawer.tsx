import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Typography from '@mui/material/Typography';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';

import { GraphErrorModal } from '@/entities/graph/model/types';
import { appPalette } from '@/shared/styles/appPalette';

interface GraphErrorDrawerProps {
  open: boolean;
  errorModal: GraphErrorModal;
  globalFontSize: number;
  fontClassName: string;
  appealText: string;
  isSubmittingAppeal: boolean;
  onChangeAppealText: (value: string) => void;
  onClose: () => void;
  onSubmitOrderAppeal: () => void;
  onSubmitCameraAppeal: () => void;
}

function GraphErrorField({
  label,
  value,
  globalFontSize,
}: {
  label: string;
  value: string | number | undefined;
  globalFontSize: number;
}) {
  return (
    <div
      style={{
        width: 'auto',
        height: 'auto',
        flexWrap: 'wrap',
        flexShrink: 1,
        paddingTop: 20,
      }}
    >
      <Typography
        component="span"
        style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}
      >
        {label}
      </Typography>
      <Typography component="span" style={{ fontSize: globalFontSize, color: '#000' }}>
        {' '}
        {value}
      </Typography>
    </div>
  );
}

function GraphAppealBlock({
  title,
  text,
  canEdit,
  globalFontSize,
  appealText,
  isSubmittingAppeal,
  onChangeAppealText,
  onSubmit,
}: {
  title: string;
  text: string | undefined;
  canEdit: boolean;
  globalFontSize: number;
  appealText: string;
  isSubmittingAppeal: boolean;
  onChangeAppealText: (value: string) => void;
  onSubmit: () => void;
}) {
  if (!text || text.length === 0) {
    if (!canEdit) {
      return null;
    }

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: 'auto',
          height: 'auto',
          flexWrap: 'wrap',
          flexShrink: 1,
          paddingTop: 20,
        }}
      >
        <Typography
          component="span"
          style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}
        >
          {title}
        </Typography>
        <TextareaAutosize
          style={{ width: '100%', minHeight: 50 }}
          value={appealText}
          onChange={(event) => onChangeAppealText(event.target.value)}
        />

        <Button
          disabled={isSubmittingAppeal}
          onClick={onSubmit}
          style={{
            color: '#fff',
            marginTop: 10,
            width: '100%',
            backgroundColor: appPalette.brand,
          }}
        >
          Обжаловать
        </Button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: 'auto',
        height: 'auto',
        flexWrap: 'wrap',
        flexShrink: 1,
        paddingTop: 20,
      }}
    >
      <Typography
        component="span"
        style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}
      >
        {title}
      </Typography>
      <Typography component="span" style={{ fontSize: globalFontSize, color: '#000' }}>
        {text}
      </Typography>
    </div>
  );
}

export function GraphErrorDrawer({
  open,
  errorModal,
  globalFontSize,
  fontClassName,
  appealText,
  isSubmittingAppeal,
  onChangeAppealText,
  onClose,
  onSubmitOrderAppeal,
  onSubmitCameraAppeal,
}: GraphErrorDrawerProps) {
  const orderError = errorModal?.kind === 'order' ? errorModal.item : null;
  const cameraError = errorModal?.kind === 'camera' ? errorModal.item : null;

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      className={`modalErr ${fontClassName}`}
      onOpen={() => {}}
    >
      <DialogContent>
        <div className="lineModal" />

        {!orderError ? null : (
          <>
            <Typography component="span" style={{ color: '#000', fontSize: globalFontSize }}>
              Ошибка по заказу №{orderError.order_id}
            </Typography>

            <GraphErrorField
              label="Дата заказа:"
              value={orderError.date_time_order}
              globalFontSize={globalFontSize}
            />
            <GraphErrorField
              label="Ошибка заказа:"
              value={orderError.order_desc}
              globalFontSize={globalFontSize}
            />
            <GraphErrorField
              label="Позиция:"
              value={orderError.item_name}
              globalFontSize={globalFontSize}
            />
            <GraphErrorField
              label="Ошибка:"
              value={orderError.pr_name}
              globalFontSize={globalFontSize}
            />
            <GraphErrorField
              label="Сумма:"
              value={`${orderError.my_price}₽`}
              globalFontSize={globalFontSize}
            />

            {orderError.imgs.length === 0 ? null : (
              <GraphErrorField label="Фото" value="" globalFontSize={globalFontSize} />
            )}

            {orderError.imgs.map((item, key) => (
              <img key={key} alt="" style={{ width: '100%', height: 'auto' }} src={item} />
            ))}

            <GraphAppealBlock
              title="Причина обжалования:"
              text={orderError.new_text_1}
              canEdit={parseInt(String(orderError.is_edit), 10) !== 0}
              globalFontSize={globalFontSize}
              appealText={appealText}
              isSubmittingAppeal={isSubmittingAppeal}
              onChangeAppealText={onChangeAppealText}
              onSubmit={onSubmitOrderAppeal}
            />

            {!orderError.new_text_2 || orderError.new_text_2.length === 0 ? null : (
              <GraphAppealBlock
                title="Ответ обжалования:"
                text={orderError.new_text_2}
                canEdit={false}
                globalFontSize={globalFontSize}
                appealText={appealText}
                isSubmittingAppeal={isSubmittingAppeal}
                onChangeAppealText={onChangeAppealText}
                onSubmit={onSubmitOrderAppeal}
              />
            )}
          </>
        )}

        {!cameraError ? null : (
          <>
            <Typography style={{ color: '#000', fontSize: globalFontSize }}>
              Ошибка №{cameraError.id}
            </Typography>

            <GraphErrorField
              label="Дата время ошибки:"
              value={cameraError.date_time_fine}
              globalFontSize={globalFontSize}
            />
            <GraphErrorField
              label="Ошибка:"
              value={cameraError.fine_name}
              globalFontSize={globalFontSize}
            />
            <GraphErrorField
              label="Сумма:"
              value={cameraError.price}
              globalFontSize={globalFontSize}
            />

            {cameraError.imgs.length === 0 ? null : (
              <GraphErrorField label="Фото" value="" globalFontSize={globalFontSize} />
            )}

            {cameraError.imgs.map((item, key) => (
              <img
                key={key}
                alt=""
                style={{ width: '100%', height: 'auto' }}
                src={`https://jacochef.ru/src/img/fine_err/uploads/${item}`}
              />
            ))}

            <GraphAppealBlock
              title="Причина обжалования:"
              text={cameraError.text_one}
              canEdit={parseInt(String(cameraError.is_edit), 10) !== 0}
              globalFontSize={globalFontSize}
              appealText={appealText}
              isSubmittingAppeal={isSubmittingAppeal}
              onChangeAppealText={onChangeAppealText}
              onSubmit={onSubmitCameraAppeal}
            />

            {!cameraError.text_two || cameraError.text_two.length === 0 ? null : (
              <GraphAppealBlock
                title="Ответ обжалования:"
                text={cameraError.text_two}
                canEdit={false}
                globalFontSize={globalFontSize}
                appealText={appealText}
                isSubmittingAppeal={isSubmittingAppeal}
                onChangeAppealText={onChangeAppealText}
                onSubmit={onSubmitCameraAppeal}
              />
            )}
          </>
        )}
      </DialogContent>
    </SwipeableDrawer>
  );
}
