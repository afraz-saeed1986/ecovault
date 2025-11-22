import type { CollectionDataSource, ID } from "@/lib/db/adapters";
import {Product, ProductWithRelations} from '@/types';

export function createProductRepository(dataSourse: CollectionDataSource) {
    const collection = 'products';

    return {
        async getAll(): Promise<Product[]> {
            return dataSourse.read<Product>(collection);
        },

async getById(id: ID): Promise<ProductWithRelations | null> {
      try {
        return  dataSourse.get<ProductWithRelations>(collection, id);
      } catch (err) {
        console.error('ProductRepository.getById error', err);
        return null;
      }
    },

        async create(product: Omit<Product, 'id'>): Promise<Product> {
            return dataSourse.upsert<Product>(collection, product as Product);
        },

        async update(product: Product): Promise<Product> {
            if(!product.id) throw new Error('Product id is required for update');
            return dataSourse.upsert<Product>(collection, product);
        },

        async delete(id: ID):Promise<boolean>{
            return dataSourse.delete(collection,id);
        }
    }
}