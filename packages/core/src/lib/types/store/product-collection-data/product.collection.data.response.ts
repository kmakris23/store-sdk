import { ProductCollectionDataAttributeCountsResponse } from './product.collection.data.attribute.counts.response.js';
import { ProductCollectionDataPriceRangeResponse } from './product.collection.data.price.range.response.js';
import { ProductCollectionDataRatingCountsResponse } from './product.collection.data.rating.counts.response.js';
import { ProductCollectionDataTaxonomyCountsResponse } from './product.collection.data.taxonomy.counts.response.js';

export interface ProductCollectionDataResponse {
  price_range: ProductCollectionDataPriceRangeResponse;
  attribute_counts: ProductCollectionDataAttributeCountsResponse[];
  rating_counts: ProductCollectionDataRatingCountsResponse[];
  taxonomy_counts: ProductCollectionDataTaxonomyCountsResponse[];
}
