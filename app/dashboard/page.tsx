"use client";

import { useEffect, useState } from "react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

import "@/app/assests/dashboard.css";
import axios from "axios";
import { useCallApi } from "../lib/useCallApi";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import Stack from "@mui/material/Stack";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
interface Counts {
  group_count: number;
  entity_count: number;
  message_count: number;
}

export default function DashboardPage() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [rtMessages, setRtMessages] = useState<any[]>([]);
  const [rtStats, setRtStats] = useState<{
    totalCount: number;
    count: number;
  } | null>(null);

  const [search, setSearch] = useState("");
  const [rtLoading, setRtLoading] = useState(true);

  const [page, setPage] = useState(1);
  const limit = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setRtLoading(true);

        console.log("Page:", page);
        console.log("Offset:", (page - 1) * limit);

        const formData = new FormData();
        formData.append("offset", String((page - 1) * limit));
        formData.append("limit", String(limit));


        const [countsRes, rtRes] = await Promise.all([
          useCallApi(
            "https://admin.devp2.iris26.variableq.com/api/dashboard/stats",
            "GET"
          ),
          useCallApi(
            "https://admin.devp2.iris26.variableq.com/api/dashboard/rt-messages",
            "POST",
            formData
          )

        ]);



        const countsData =
          countsRes.data?.counts ||
          countsRes.data?.data?.[0]?.counts;

        if (countsData) {
          setCounts(countsData);
        }

        const apiData = rtRes.data?.data;

        setRtMessages(apiData?.result || []);
        setRtStats({
          totalCount: apiData?.total_count || 0,
          count: apiData?.count || 0,
        });

      } catch (error: any) {
        console.log(" DASHBOARD ERROR ");

        if (error?.response) {
          console.log("Status:", error.response.status);
          console.log("Data:", error.response.data);
        }

        console.log("Full error:", error);


      } finally {
        setRtLoading(false);
      }
    };

    fetchData();
  }, [page]);


  const handleLogout = async () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );
    if (!confirmLogout) return;

    try {
      await axios.post("/api/auth/logout");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const maxGroup = 5000;
  const maxEntity = 1000000;
  const maxMessage = 4000000;

  const createChartData = (value: number, max: number) => [
    {
      name: "progress",
      value: value,
      fill: "#0d6efd",
    },
  ];

  const filteredData = rtMessages.filter((item) =>
    JSON.stringify(item)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (!counts)
    return (
      <div className="loading">
        <span className="loader"></span>
      </div>
    );

  const totalPages = rtStats
    ? Math.ceil(rtStats.totalCount / limit)
    : 0;


  return (
    <div className="dashboard-container container-fluid">
      <div className="dashboard-header d-flex justify-content-between align-items-center mb-4">
        <h2 className="dashboard-title">Dashboard Overview</h2>
        <button
          onClick={handleLogout}
          className="logout-btn btn btn-danger"
        >
          Logout
        </button>
      </div>

      <div className="row dashboard-content">

        <div className="col-md-6 chart-section">
          {[
            { title: "Group Count", value: counts.group_count, max: maxGroup },
            { title: "Entity Count", value: counts.entity_count, max: maxEntity },
            { title: "Message Count", value: counts.message_count, max: maxMessage },
          ].map((item, index) => (
            <div key={index} className="chart-card custom-card">
              <h5 className="card-title">{item.title}</h5>
              <RadialBarChart
                width={250}
                height={250}
                innerRadius="70%"
                outerRadius="100%"
                data={createChartData(item.value, item.max)}
                startAngle={180}
                endAngle={0}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, item.max]}
                  tick={false}
                />
                <RadialBar background dataKey="value" />
              </RadialBarChart>
              <div className="chart-value highlight-value">
                {item.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>


        <div className="col-md-6  redesigned-right">

          <h5 className="section-title mb-3">
            Real-Time Messages
          </h5>

          {rtStats && (
            <div className="rt-summary-card">
              <p>
                <strong>Total Count:</strong>{" "}
                {rtStats.totalCount?.toLocaleString()}
              </p>
              <p>
                <strong>Current Count:</strong>{" "}
                {rtStats.count?.toLocaleString()}
              </p>
            </div>
          )}

          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="message-search"
          />

          {rtLoading ? (
            <div className="skeleton-wrapper">
              {Array(6)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className="skeleton-card"></div>
                ))}
            </div>
          ) : (
            <>
              <div className="row">
                {filteredData.map((msg: any, index: number) => (
                  <div key={index} className="col-md-4 col-sm-6 mb-4">
                    <div className="card rt-bootstrap-card shadow-sm h-100">
                      <div className="card-body text-center">

                        <div className="avatar-wrapper mx-auto mb-3">
                          {msg.entity?.profile_image ? (
                            <img
                              src={msg.entity.profile_image}
                              alt="profile"
                              className="avatar-img"
                            />
                          ) : (
                            <div className="avatar-placeholder">
                              {msg.entity?.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                          )}
                        </div>

                        <h6 className="card-title text-primary mb-2">
                          {msg.entity?.name}
                        </h6>

                        <hr className="divider" />

                        <p className="message-text">
                          <strong>Message:</strong> {msg.text_body}
                        </p>

                        <p><strong>Group:</strong> {msg.group?.name}</p>
                        <p><strong>App:</strong> {msg.entity?.app_type?.join(", ")}</p>

                        <p className="last-active">
                          Last Active: {msg.entity?.last_active_timestamp_readable}
                        </p>

                      </div>
                    </div>
                  </div>
                ))}
              </div>


              {totalPages > 1 && (
                <Stack alignItems="center" sx={{ mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    shape="rounded"
                    size="large"
                    showFirstButton
                    showLastButton
                  
                    sx={{
                      "& .MuiPaginationItem-root": {
                        color: "white",
                        borderColor: "white",
                      },
                      "& .Mui-selected": {
                        backgroundColor: "white",
                        color: "white",
                      },
                    }}
                    renderItem={(item) => (
                      <PaginationItem
                        slots={{
                          previous: ArrowBackIcon,
                          next: ArrowForwardIcon,
                        }}
                        {...item}
                      />
                    )}
                  />
                </Stack>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}