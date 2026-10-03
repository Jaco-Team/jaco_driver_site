// Both Yandex API 2.1 and the offline Tiles API use the same dark-map treatment.
// The first filter darkens the raster; this one changes only warm roads and labels.
export function OrdersMapRasterFilter() {
  return (
    <svg className="orders-map-road-filter" aria-hidden="true" focusable="false">
      <defs>
        <filter id="orders-map-dark-roads" colorInterpolationFilters="sRGB">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  12 0 -12 0 -0.33"
            result="road-mask"
          />
          <feGaussianBlur in="road-mask" stdDeviation="0.45" result="soft-road-mask" />
          <feFlood floodColor="#5b77a3" result="road-color" />
          <feComposite in="road-color" in2="soft-road-mask" operator="in" result="roads" />
          <feComposite in="roads" in2="SourceGraphic" operator="over" result="road-base" />
          <feColorMatrix
            in="road-base"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  12 0 -4 0 -2.5"
            result="label-mask"
          />
          <feFlood floodColor="#edf4ff" result="label-color" />
          <feComposite in="label-color" in2="label-mask" operator="in" result="labels" />
          <feComposite in="labels" in2="road-base" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}
