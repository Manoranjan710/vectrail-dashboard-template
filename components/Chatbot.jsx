'use client';

import { useState } from 'react';

export default function Chatbot() {
  const [query, setQuery] = useState('');
  const [context, setContext] = useState('all');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/insights/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          context: context
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch results');
      }

      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">AI Insights Chatbot</h2>

      {/* Query Input */}
      <form onSubmit={handleSubmit} className="mb-4 sm:mb-6">
        {/* Context Selector */}
        <div className="mb-3">
          <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
            Select Context
          </label>
          <select
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="w-full sm:w-64 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            disabled={loading}
          >
            <option value="all">All</option>
            <option value="leads">Leads</option>
            <option value="campaign">Campaign</option>
            <option value="admission">Admission</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask me about your data..."
            className="flex-1 px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium text-sm sm:text-base">Error: {error}</p>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="space-y-4 sm:space-y-6">
          {/* Query Interpretation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Query Interpretation</h3>
            <p className="text-blue-700 text-sm sm:text-base">{response.interpretation}</p>
          </div>

          {/* Insights */}
          {response.insights && response.insights.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold text-green-900 mb-2 text-sm sm:text-base">Insights</h3>
              <ul className="space-y-1">
                {response.insights.map((insight, index) => (
                  <li key={index} className="text-green-700 flex items-start text-sm sm:text-base">
                    <span className="mr-2">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-semibold">
              Results ({response.result_count || 0})
            </h3>
          </div>

          {/* Results Display - Table for Desktop, Cards for Mobile */}
          {response.results && response.results.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lead Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Source
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Priority
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {response.results.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {lead.id}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {lead.full_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {lead.email}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {lead.lead_status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(lead.lead_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {lead.source_medium}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {lead.priority}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {response.results.map((lead) => (
                  <div key={lead.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-base">{lead.full_name}</h4>
                        <p className="text-xs text-gray-500">ID: {lead.id}</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {lead.lead_status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email:</span>
                        <span className="text-gray-900 truncate ml-2">{lead.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Lead Date:</span>
                        <span className="text-gray-900">{new Date(lead.lead_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Source:</span>
                        <span className="text-gray-900">{lead.source_medium}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Priority:</span>
                        <span className="text-gray-900">{lead.priority}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sm:p-8 text-center">
              <p className="text-gray-500 text-sm sm:text-base">No results found</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!response && !loading && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 sm:p-12 text-center">
          <svg
            className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            Start a conversation
          </h3>
          <p className="text-gray-500 text-sm sm:text-base px-4">
            Ask me anything about your data and I'll help you find insights
          </p>
        </div>
      )}
    </div>
  );
}
