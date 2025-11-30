import { EnhancedProduct } from "./";

export interface ReviewsSectionProps {
  product: EnhancedProduct;
  onReviewSubmitted: () => void;
}