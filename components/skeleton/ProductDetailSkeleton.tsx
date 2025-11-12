export default function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 animate-pulse">
        {/* left side gallary */}
        <div className="space-y-4">
          <div className="bg-gray-200 rounded-xl aspect-square w-full"></div>
          <div className="grid grid-cols-4 gap-2">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg aspect-square"></div>
              ))}
          </div>
        </div>

        {/* right side info */}
        <div className="space-y-6">
          {/* category */}
          <div className="h-5 bg-gray-200 rounded w-1/2"></div>

          {/* product name*/}
          <div className="h-10 bg-gray-200 rounded w-4/5"></div>

          {/* score */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="w-5 h-5 bg-gray-200 rounded-full"></div>
                ))}
            </div>
            <div className="h-5 bg-gray-200 rounded w-24"></div>
          </div>

          {/* price */}
          <div className="h-12 bg-gray-200 rounded w-32"></div>

          {/* description */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>

          {/* green props */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>

          {/* add to cart button */}
          <div className="h-14 bg-gray-200 rounded-lg w-full"></div>

          {/* sustainability Score */}
          <div className="bg-gray-100 p-5 rounded-xl space-y-3">
            <div className="flex justify-between">
              <div className="h-5 bg-gray-200 rounded w-32"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="mt-16 space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-xl shadow-sm border space-y-3">
                <div className="flex justify-between">
                  <div className="h-5 bg-gray-200 rounded w-32"></div>
                  <div className="flex gap-1">
                    {Array(5)
                      .fill(0)
                      .map((_, j) => (
                        <div key={j} className="w-4 h-4 bg-gray-200 rounded-full"></div>
                      ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Related products */}
      <div className="mt-16">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
                <div className="bg-gray-200 rounded-lg w-full h-48 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3 mt-3"></div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}