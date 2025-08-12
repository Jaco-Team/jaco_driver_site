import { useRef, useMemo, useCallback, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {useHeaderStore, useOrdersStore} from "@/components/store";

export function useModalFilterOrdersLogic() {
  // zustand
  const FormatPrice = (price) => new Intl.NumberFormat('ru-RU').format(price);
  const [ globalFontSize ] = useHeaderStore(state => [ state.globalFontSize ]);
  const [types_dop, type_dop, is_showModalTypeDop, showModalTypeDop, setTypeDop] =
    useOrdersStore(
      useShallow((state) => [
        state.types_dop,
        state.type_dop,
        state.is_showModalTypeDop,
        state.showModalTypeDop,
        state.setTypeDop
      ])
    )

  const handleSheetChanges = useCallback(
    (index) => {
      if (index < 0) {
        // Если шторка закрылась
        showModalTypeDop(false)
      }
    },
    [showModalTypeDop]
  )

  const handleClose = useCallback(
    () => {
      showModalTypeDop(false)
    },
    [showModalTypeDop]
  )

  const bottomSheetRef = useRef(null)

  // Snap-пойнты
  const snapPoints = useMemo(() => ['25%', '50%'], [])

  const sheetIndex = is_showModalTypeDop ? 1 : -1



  return {
    globalFontSize,
    sheetIndex,
    bottomSheetRef,
    snapPoints,
    handleClose,
    types_dop,
    type_dop,
    is_showModalTypeDop,
    showModalTypeDop,
    setTypeDop,
    handleSheetChanges
  }
}
