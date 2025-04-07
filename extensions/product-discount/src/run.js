// @ts-check
import { DiscountApplicationStrategy } from "../generated/api";

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  const discounts = [];
  const lines = input?.cart?.lines || [];

  lines.forEach((line) => {
    let sellingPrice = parseFloat(line?.cost?.amountPerQuantity?.amount) || 0;
    let compareAtPrice = parseFloat(line?.cost?.compareAtAmountPerQuantity?.amount) || 0;
    let discountPercentage = 0;
    discountPercentage = Number(line?.bundleDiscount?.value) * 100 ; 
    // Ensure valid values before applying discount
    if (compareAtPrice > 0 && sellingPrice > 0 && discountPercentage > 0) {
      // MRP Discount calculation
      let discountedSellingPriceForMRP = compareAtPrice - ((compareAtPrice * discountPercentage) / 100);
      let actualDiscount = 0;
      if (sellingPrice > discountedSellingPriceForMRP) {
        actualDiscount = ((sellingPrice - discountedSellingPriceForMRP) / sellingPrice) * 100;
      }

      if (actualDiscount > 0) {
        discounts.push({
          message: "MRP Discount Applied",
          targets: [
            {
              cartLine: {
                id: line.id,
              },
            },
          ],
          value: {
            percentage: {
              value: actualDiscount,
            },
          },
        });
      }
    }
  });

  return discounts.length > 0
    ? {
        discountApplicationStrategy: DiscountApplicationStrategy.All,
        discounts,
      }
    : EMPTY_DISCOUNT;
}
