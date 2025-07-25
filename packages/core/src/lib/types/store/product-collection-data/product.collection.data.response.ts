import { ProductCollectionDataAttributeCountsResponse } from './product.collection.data.attribute.counts.response';
import { ProductCollectionDataPriceRangeResponse } from './product.collection.data.price.range.response';
import { ProductCollectionDataRatingCountsResponse } from './product.collection.data.rating.counts.response';
import { ProductCollectionDataTaxonomyCountsResponse } from './product.collection.data.taxonomy.counts.response';

export interface ProductCollectionDataResponse {
  price_range: ProductCollectionDataPriceRangeResponse;
  attribute_counts: ProductCollectionDataAttributeCountsResponse[];
  rating_counts: ProductCollectionDataRatingCountsResponse[];
  taxonomy_counts: ProductCollectionDataTaxonomyCountsResponse[];
}
