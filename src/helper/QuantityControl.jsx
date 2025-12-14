import { useEffect, useState } from "react";

const QuantityControl = ({
  initialQuantity = 1,
  minQuantity = 1,
  maxQuantity,
  disabled = false,
  onChange,
  onLimit,
}) => {
  const numericMin = Number.isFinite(Number(minQuantity))
    ? Math.max(1, Number(minQuantity))
    : 1;
  const numericMaxRaw = Number(maxQuantity);
  const hasMax = Number.isFinite(numericMaxRaw) && numericMaxRaw > 0;
  const numericMax = hasMax ? Math.floor(numericMaxRaw) : null;

  const clamp = (value) => {
    let nextValue = Math.max(numericMin, value);
    if (hasMax) {
      nextValue = Math.min(nextValue, numericMax);
    }
    return nextValue;
  };

  const [quantity, setQuantity] = useState(clamp(initialQuantity));

  useEffect(() => {
    const nextValue = clamp(initialQuantity);
    setQuantity(nextValue);
    if (nextValue !== initialQuantity && onChange) {
      onChange(nextValue);
    }
  }, [initialQuantity, numericMin, numericMax, hasMax]);

  const incrementQuantity = () => {
    if (disabled) return;
    const nextQuantity = quantity + 1;
    if (hasMax && nextQuantity > numericMax) {
      if (onLimit) onLimit(numericMax);
      return;
    }
    setQuantity(nextQuantity);
    if (onChange) onChange(nextQuantity);
  };

  const decrementQuantity = () => {
    if (disabled) return;
    if (quantity <= numericMin) return;
    const nextQuantity = quantity - 1;
    setQuantity(nextQuantity);
    if (onChange) onChange(nextQuantity);
  };

  const minusDisabled = disabled || quantity <= numericMin;
  const plusDisabled =
    disabled || (hasMax ? quantity >= numericMax : false);

  return (
    <div className="d-flex rounded-4 overflow-hidden">
      <button
        type="button"
        onClick={decrementQuantity}
        className="quantity__minus border border-end border-gray-100 flex-shrink-0 h-48 w-48 text-neutral-600 flex-center hover-bg-main-600 hover-text-white"
        disabled={minusDisabled}
      >
        <i className="ph ph-minus" />
      </button>
      <input
        type="number"
        className="quantity__input flex-grow-1 border border-gray-100 border-start-0 border-end-0 text-center w-32 px-4"
        value={quantity}
        min={numericMin}
        max={hasMax ? numericMax : undefined}
        readOnly
        disabled={disabled}
      />
      <button
        type="button"
        onClick={incrementQuantity}
        className="quantity__plus border border-end border-gray-100 flex-shrink-0 h-48 w-48 text-neutral-600 flex-center hover-bg-main-600 hover-text-white"
        disabled={plusDisabled}
      >
        <i className="ph ph-plus" />
      </button>
    </div>
  );
};

export default QuantityControl;
