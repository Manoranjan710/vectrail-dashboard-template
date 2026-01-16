"use client";

import { useState } from "react";
import Analytics from "@/components/Analytics.jsx";
import Campaign from "@/components/Campaign.jsx";
import Chatbot from "@/components/Chatbot.jsx";
import DataUpload from "@/components/DataUpload.jsx";

export default function Home() {
  const [activeTab, setActiveTab] = useState("analytics");

  const tabs = [
    { id: "analytics", label: "Analytics", component: Analytics },
    { id: "campaign", label: "Campaign", component: Campaign },
    { id: "chatbot", label: "Chatbot", component: Chatbot },
    { id: "dataupload", label: "Data Upload", component: DataUpload },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}
