import type { CollectionDataSource, ID } from "../db/adapters";
import {Product} from '@/types';

export function createProductRepository(dataSourse: CollectionDataSource) {
    const collection = 'products';

    return {
        async getAll(): Promise<Product[]> {
            return dataSourse.read<Product>(collection);
        },

        async getById(id: ID): Promise<Product | null> {
            return dataSourse.get<Product>(collection, id);
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