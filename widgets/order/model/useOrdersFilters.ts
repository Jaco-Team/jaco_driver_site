import { useOrdersStore } from '@/entities/order/model/order.store';

interface UseOrdersFiltersReturn {
  type: { id: number; text: string };
  limit: string;
  limitCount: string;
  setOpenMenu: () => void;
  showModalTypeDop: (isShow: boolean) => void;
}

const useOrdersFilters = (): UseOrdersFiltersReturn => {
  const { type, limit, limit_count, setOpenMenu, showModalTypeDop } = useOrdersStore((state) => ({
    type: state.type,
    limit: state.limit,
    limit_count: state.limit_count,
    setOpenMenu: state.setOpenMenu,
    showModalTypeDop: state.showModalTypeDop,
  }));

  return {
    type,
    limit,
    limitCount: limit_count,
    setOpenMenu,
    showModalTypeDop,
  };
};
