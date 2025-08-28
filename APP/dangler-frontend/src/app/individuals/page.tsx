"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FiPlus, FiSearch, FiCalendar, FiClock, FiUser, FiFilter, FiChevronDown } from "react-icons/fi";

interface Individual {
  id: number;
  name: string;
  category: string;
  description: string;
  birth_date: string;
  death_date?: string | null;
  profile_image?: string | null;   // ✅ added profile image
}

export default function IndividualsPage() {
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = ["all", "real", "fictional", "historical"];

  useEffect(() => {
    setIsLoading(true);
    fetch("http://localhost:5000/individuals")
      .then(res => res.json())
      .then(data => {
        setIndividuals(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const filteredIndividuals = individuals.filter(ind => {
    const matchesSearch =
      ind.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ind.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      ind.category.toLowerCase() === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      real: "from-blue-500 to-cyan-400",
      fictional: "from-purple-500 to-pink-400",
      historical: "from-amber-500 to-yellow-400",
      default: "from-gray-500 to-gray-400",
    };
    return colors[category.toLowerCase()] || colors.default;
  };

  const getCategoryTextColor = (category: string) => {
    const colors: Record<string, string> = {
      real: "text-blue-700",
      fictional: "text-purple-700",
      historical: "text-amber-700",
      default: "text-gray-700",
    };
    return colors[category.toLowerCase()] || colors.default;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mb-4"></div>
          <p className="text-gray-600">Loading individuals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-4xl font-bold tracking-tight">Individuals</h1>
              <p className="mt-2 text-blue-100 max-w-2xl">
                Browse and manage all individuals in the system. Track their
                timelines, events, and important details.
              </p>
            </div>
            <Link
              href="/individuals/new"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
            >
              <FiPlus className="mr-2 -ml-1 h-5 w-5" />
              Add New Individual
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center justify-between w-full md:w-40 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="flex items-center">
                  <FiFilter className="mr-2 h-4 w-4" />
                  {selectedCategory === "all"
                    ? "All Categories"
                    : selectedCategory.charAt(0).toUpperCase() +
                      selectedCategory.slice(1)}
                </span>
                <FiChevronDown
                  className={`ml-2 h-4 w-4 transition-transform ${
                    isFilterOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 z-10 mt-1 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          selectedCategory === category
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {category.charAt(0).toUpperCase() +
                          category.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Individuals Grid */}
        {filteredIndividuals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <FiUser className="w-full h-full" />
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No individuals found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by adding a new individual."}
            </p>
            <div className="mt-6">
              <Link
                href="/individuals/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus className="-ml-1 mr-2 h-4 w-4" />
                New Individual
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredIndividuals.map((ind) => (
              <Link
                key={ind.id}
                href={`/individuals/${ind.id}`}
                className="group bg-white overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 border border-gray-100"
              >
                <div
                  className={`h-2 bg-gradient-to-r ${getCategoryColor(
                    ind.category
                  )}`}
                ></div>
                <div className="p-6">
                  {/* ✅ Show profile image if available */}
                  {ind.profile_image && (
                    <img
                      src={`http://localhost:5000${ind.profile_image}`}
                      alt={ind.name}
                      className="w-16 h-16 rounded-full object-cover mb-4"
                    />
                  )}

                  <div className="flex items-start justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {ind.name}
                    </h2>
                    <span
                      className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${getCategoryTextColor(
                        ind.category
                      )}`}
                    >
                      {ind.category.charAt(0).toUpperCase() +
                        ind.category.slice(1)}
                    </span>
                  </div>

                  {ind.description && (
                    <p className="mt-3 text-gray-600 line-clamp-2">
                      {ind.description}
                    </p>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiCalendar className="flex-shrink-0 mr-2 h-4 w-4" />
                      <span className="truncate">
                        {formatDate(ind.birth_date)} -{" "}
                        {ind.death_date
                          ? formatDate(ind.death_date)
                          : "Present"}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center text-xs text-gray-400">
                      <FiClock className="mr-1.5 h-3.5 w-3.5" />
                      <span>Updated {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
