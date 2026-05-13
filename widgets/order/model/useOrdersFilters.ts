import { useOrdersStore } from '@/entities/order/model/order.store';
import type { UseOrdersFiltersReturn } from './useOrdersFilters.type';

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
