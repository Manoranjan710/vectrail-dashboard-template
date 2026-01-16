"use client";

import { useRef, useState } from "react";

export default function DataUpload() {
  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setMessage(null);
    }
  };

  const handleCreateTable = async () => {
    if (!uploadedFile) {
      setMessageType("error");
      setMessage("Please select a CSV file first");
      return;
    }

    if (!uploadedFile.name.endsWith(".csv")) {
      setMessageType("error");
      setMessage("Please select a valid CSV file");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("csvFile", uploadedFile);
    formData.append("tableName", uploadedFile.name.replace(".csv", ""));

    try {
      const response = await fetch("/api/csv/create-table", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType("success");
        setMessage(`Table created successfully: ${data.tableName || "Success"}`);
        setUploadedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setMessageType("error");
        setMessage(data.error || "Failed to create table");
      }
    } catch (error) {
      setMessageType("error");
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadData = async () => {
    if (!uploadedFile) {
      setMessageType("error");
      setMessage("Please select a CSV file first");
      return;
    }

    if (!uploadedFile.name.endsWith(".csv")) {
      setMessageType("error");
      setMessage("Please select a valid CSV file");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("csvFile", uploadedFile);
    formData.append("tableName", uploadedFile.name.replace(".csv", ""));

    try {
      const response = await fetch("/api/csv/create-table", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType("success");
        setMessage(`Data uploaded successfully: ${data.rowsInserted || "Success"} rows added`);
        setUploadedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setMessageType("error");
        setMessage(data.error || "Failed to upload data");
      }
    } catch (error) {
      setMessageType("error");
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Management</h2>

        {/* File Upload Section */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select CSV File
          </label>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                cursor-pointer border border-gray-300 rounded-md p-2"
            />
          </div>
          {uploadedFile && (
            <p className="text-sm text-green-600 mt-2">
              ✓ File selected: {uploadedFile.name}
            </p>
          )}
        </div>

        {/* Buttons Section */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={handleCreateTable}
            disabled={loading || !uploadedFile}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md
              hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
              transition-colors"
          >
            {loading ? "Processing..." : "Create Table"}
          </button>
          <button
            onClick={handleUploadData}
            disabled={loading || !uploadedFile}
            className="px-6 py-2 bg-green-600 text-white font-medium rounded-md
              hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed
              transition-colors"
          >
            {loading ? "Processing..." : "Upload Data to Table"}
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`p-4 rounded-md text-sm ${
              messageType === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Instructions:</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Select a CSV file from your computer</li>
            <li>• Click "Create Table" to create a new table from the CSV file</li>
            <li>• Click "Upload Data to Table" to add data to an existing table</li>
            <li>• Ensure your CSV file is properly formatted</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
