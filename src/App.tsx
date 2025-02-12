// import React, { useState } from "react";
// import { ShoeCard } from "./components/ShoeCard";
// import { Filters } from "./components/Filters";
// import { VirtualTryOn } from "./components/VirtualTryOn";
// import { shoes } from "./data/shoes";
// import { Shoe, FilterState } from "./types";
// import { ShoppingBag, Camera } from "lucide-react";
// import axios from "axios";

// function App() {
//   const [filters, setFilters] = useState<FilterState>({
//     priceRange: [0, 20000],
//     brands: [],
//     categories: [],
//     styles: [],
//   });

//   const [selectedShoe, setSelectedShoe] = useState<Shoe | null>(null);
//   const [showVirtualTryOn, setShowVirtualTryOn] = useState(false);

//   const filteredShoes = shoes.filter((shoe) => {
//     const matchesPrice = shoe.price <= filters.priceRange[1];
//     const matchesBrand =
//       filters.brands.length === 0 || filters.brands.includes(shoe.brand);
//     const matchesCategory =
//       filters.categories.length === 0 ||
//       filters.categories.includes(shoe.category);
//     return matchesPrice && matchesBrand && matchesCategory;
//   });

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <header className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
//           <div className="flex items-center">
//             <ShoppingBag className="w-6 h-6 text-blue-600" />
//             <h1 className="ml-2 text-xl font-bold text-gray-900">
//               Shoe Recommendation
//             </h1>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 py-8">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           <div className="md:col-span-1">
//             <Filters filters={filters} onFilterChange={setFilters} />
//           </div>

//           <div className="md:col-span-3">
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//               {filteredShoes.map((shoe) => (
//                 <ShoeCard
//                   key={shoe.id}
//                   shoe={shoe}
//                   onSelect={setSelectedShoe}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>
//       </main>

//       {selectedShoe && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-lg max-w-2xl w-full p-6">
//             <div className="flex justify-between items-start mb-4">
//               <h2 className="text-2xl font-bold">{selectedShoe.name}</h2>
//               <button
//                 onClick={() => setSelectedShoe(null)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 ×
//               </button>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <img
//                 src={selectedShoe.image}
//                 alt={selectedShoe.name}
//                 className="w-full h-64 object-cover rounded-lg"
//               />
//               <div>
//                 <p className="text-2xl font-bold mb-4">
//                   NPR {selectedShoe.price.toLocaleString()}
//                 </p>
//                 <div className="space-y-4">
//                   <div>
//                     <h3 className="font-medium">Available Sizes</h3>
//                     <div className="flex flex-wrap gap-2 mt-2">
//                       {selectedShoe.sizes.map((size) => (
//                         <button
//                           key={size}
//                           className="px-3 py-1 border rounded-md hover:bg-gray-100"
//                         >
//                           {size}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                   <div>
//                     <h3 className="font-medium">Colors</h3>
//                     <div className="flex flex-wrap gap-2 mt-2">
//                       {selectedShoe.colors.map((color) => (
//                         <span
//                           key={color}
//                           className="px-3 py-1 bg-gray-100 rounded-full text-sm"
//                         >
//                           {color}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                   <div className="flex gap-2">
//                     <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
//                       Add to Cart
//                     </button>
//                     <button
//                       onClick={() => setShowVirtualTryOn(true)}
//                       className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
//                     >
//                       <Camera className="w-5 h-5" />
//                       Try On
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {showVirtualTryOn && (
//         <VirtualTryOn onClose={() => setShowVirtualTryOn(false)} />
//       )}
//     </div>
//   );
// }

// export default App;
// data come from database

import React, { useState, useEffect } from "react";
import axios from "axios";
import { ShoeCard } from "./components/ShoeCard";
import { Filters } from "./components/Filters";
import { VirtualTryOn } from "./components/VirtualTryOn";
import { ShoppingBag, Camera } from "lucide-react";

interface Shoe {
  _id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  sizes: string[];
  colors: string[];
  category: string;
}

interface FilterState {
  priceRange: [number, number];
  brands: string[];
  categories: string[];
  styles: string[];
}

function App() {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 20000],
    brands: [],
    categories: [],
    styles: [],
  });

  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [selectedShoe, setSelectedShoe] = useState<Shoe | null>(null);
  const [showVirtualTryOn, setShowVirtualTryOn] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/shoes")
      .then((response) => setShoes(response.data))
      .catch((error) => console.error("Error fetching shoes:", error));
  }, []);

  const filteredShoes = shoes.filter((shoe) => {
    const matchesPrice = shoe.price <= filters.priceRange[1];
    const matchesBrand =
      filters.brands.length === 0 || filters.brands.includes(shoe.brand);
    const matchesCategory =
      filters.categories.length === 0 ||
      filters.categories.includes(shoe.category);
    return matchesPrice && matchesBrand && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
            <h1 className="ml-2 text-xl font-bold text-gray-900">
              Shoe Recommendation
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Filters filters={filters} onFilterChange={setFilters} />
          </div>

          <div className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShoes.map((shoe) => (
                <ShoeCard
                  key={shoe._id}
                  shoe={shoe}
                  onSelect={setSelectedShoe}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {selectedShoe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{selectedShoe.name}</h2>
              <button
                onClick={() => setSelectedShoe(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <img
                src={selectedShoe.image}
                alt={selectedShoe.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              <div>
                <p className="text-2xl font-bold mb-4">
                  NPR {selectedShoe.price.toLocaleString()}
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Available Sizes</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedShoe.sizes.map((size) => (
                        <button
                          key={size}
                          className="px-3 py-1 border rounded-md hover:bg-gray-100"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">Colors</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedShoe.colors.map((color) => (
                        <span
                          key={color}
                          className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                      Add to Cart
                    </button>
                    <button
                      onClick={() => setShowVirtualTryOn(true)}
                      className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      <Camera className="w-5 h-5" />
                      Try On
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVirtualTryOn && selectedShoe && (
        <VirtualTryOn
          onClose={() => setShowVirtualTryOn(false)}
          selectedShoe={selectedShoe}
        />
      )}
    </div>
  );
}

export default App;
