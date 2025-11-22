import type { CollectionDataSource, ID } from "@/lib/db/adapters";
import type { Order } from "@/types";

export function createOrderRepository(dataSource: CollectionDataSource){
    const collection = "orders";

    return {
        async getAll(): Promise<Order[]> {
            return dataSource.read<Order>(collection);
        },

        async getById(id: ID): Promise<Order | null> {
            return dataSource.get<Order>(collection, id);
        },

        async create(order: Omit<Order, "id">): Promise<Order>{
            return dataSource.upsert<Order>(collection, order as Order);
        },

        async update(order: Order): Promise<Order> {
            if(!order.id) throw new Error("Order id is required for update");
            return dataSource.upsert<Order>(collection, order);
        },

        async delete(id: ID): Promise<boolean> {
            return dataSource.delete(collection, id);
        }
    }
}