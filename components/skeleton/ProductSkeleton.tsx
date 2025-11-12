
export default function ProductSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
            <div className="bg-gray-200 rounded-lg w-full h-48 mb-4"></div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3 mt-3"></div>
            </div>
        </div>
    )
}