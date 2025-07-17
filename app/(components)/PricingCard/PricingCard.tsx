import React from "react";
import { AiOutlineCheck } from "react-icons/ai";

const PricingCard = () => {
  return (
    <div className="mt-8">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          {/* Highlight badge */}
          <span className="badge badge-primary badge-outline">
            Pay as you go
          </span>

          {/* Title & price */}
          <div className="flex justify-between items-end mt-2">
            <h2 className="text-h2 font-bold">Pay as you go</h2>
            <span className="text-xs font-extrabold">
              $0.005 <span className="text-sm font-medium">/ 1K tokens</span>
            </span>
          </div>

          {/* Features list */}
          <ul className="mt-6 flex flex-col gap-3 text-p-sm">
            <li className="flex items-center">
              <AiOutlineCheck className="me-2 text-success" size={20} />
              Real-time code analysis
            </li>
            <li className="flex items-center">
              <AiOutlineCheck className="me-2 text-success" size={20} />
              Automated Markdown formatting
            </li>
            <li className="flex items-center">
              <AiOutlineCheck className="me-2 text-success" size={20} />
              GitHub integration
            </li>
            <li className="flex items-center opacity-50">
              <AiOutlineCheck className="me-2 text-base-content/50" size={20} />
              Team collaboration (coming soon)
            </li>
            <li className="flex items-center opacity-50">
              <AiOutlineCheck className="me-2 text-base-content/50" size={20} />
              Priority support (coming soon)
            </li>
          </ul>

          {/* CTA button */}
          <div className="mt-3">
            <button className="btn btn-primary btn-block">
              Start the chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCard;
