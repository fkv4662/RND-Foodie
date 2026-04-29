import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

type GuideItem = {
  title: string;
  description: string;
  summary: string;
  section: string;
  bulletPoints: string[];
  page: number;
  href: string;
};

type FaqItem = {
  question: string;
  answer: string[];
  actionLabel?: string;
  actionHref?: string;
  actionIsExternal?: boolean;
};

const mpiGuideUrl =
  "https://www.mpi.govt.nz/dmsdocument/16684-Simply-safe-and-suitable-food-control-plan-template-colour";

const faqItems: FaqItem[] = [
  {
    question: "How do I record a temperature check?",
    answer: [
      "Open the relevant CCP workflow, such as Rational Oven, Testo Fridge, or the daily CCP checks page.",
      "Enter the temperature reading as soon as the check is taken so the record matches the actual time of control.",
      "Save the entry and review the status or alert result to make sure the check has been recorded properly.",
    ],
    actionLabel: "Open CCP area",
    actionHref: "/ccp",
  },
  {
    question: "What should I do if the temperature is out of the range?",
    answer: [
      "Treat it as a food safety issue immediately and stop relying on the affected food or equipment until it is checked.",
      "Follow the relevant corrective action, such as reheating, cooling, isolating stock, or investigating equipment failure.",
      "Record what happened, what action was taken, and whether the food stayed safe and suitable for use.",
    ],
    actionLabel: "Open temperature guide",
    actionHref: `${mpiGuideUrl}#page=54`,
    actionIsExternal: true,
  },
  {
    question: "How do I complete a daily checklist?",
    answer: [
      "Go to the daily CCP checks page and work through each required item in order.",
      "Complete every field before saving so the verifier can see a full record for the day.",
      "If something is missing or abnormal, add notes and make sure the follow-up action is also recorded.",
    ],
    actionLabel: "Open daily CCP checks",
    actionHref: "/ccp-checks",
  },
  {
    question: "How do I add a diary entry?",
    answer: [
      "Open the Diary page from the left navigation and fill in the incident or issue details.",
      "Include the date, time, who reported it, what happened, and what action was taken.",
      "Save the entry so the business has a clear incident history that can be reviewed later.",
    ],
    actionLabel: "Open diary",
    actionHref: "/diary",
  },
  {
    question: "How do I view the food control plan PDF?",
    answer: [
      "Use the support guide cards below to jump to a specific section of the MPI template.",
      "If you need the full official document, open the MPI source card on this page.",
      "The guide buttons use the relevant page number so you can land closer to the section you need.",
    ],
    actionLabel: "Open official PDF",
    actionHref: mpiGuideUrl,
    actionIsExternal: true,
  },
];

const guideItems: GuideItem[] = [
  {
    title: "Food Safety Basics",
    description: "View guide",
    summary:
      "Covers safe and suitable food, the main hazard types, and the operator responsibilities for managing food safety in daily work.",
    section: "Template overview, risks, and taking responsibility",
    bulletPoints: [
      "Safe food means preventing biological, chemical, and physical hazards from harming customers.",
      "Suitable food means the food matches what customers expect, including correct labelling and truthful claims.",
      "Operators are responsible for identifying risks and showing how those risks are managed every day.",
    ],
    page: 15,
    href: `${mpiGuideUrl}#page=15`,
  },
  {
    title: "HACCP Principles",
    description: "View guide",
    summary:
      "Maps to the plan's risk-based approach: identify hazards, control them in practice, check the plan is working, and troubleshoot when things go wrong.",
    section: "Managing risks and checking the plan",
    bulletPoints: [
      "Identify the food safety hazards that could affect your business and the foods you handle.",
      "Put practical controls in place at each step of the day cycle so risks stay under control.",
      "Verify that the plan is working by checking records, reviewing procedures, and correcting problems early.",
    ],
    page: 20,
    href: `${mpiGuideUrl}#page=20`,
  },
  {
    title: "Pest Management",
    description: "View guide",
    summary:
      "Based on the 'Checking for pests' guidance covering signs of infestation, contamination risks, and safe pest-control practices.",
    section: "Starting: Checking for pests",
    bulletPoints: [
      "Look for signs of rats, mice, cockroaches, and other pests before they contaminate food or food-contact areas.",
      "Keep entry points sealed and remove rubbish or stored items that attract pests.",
      "Use pest-control chemicals carefully so they do not contaminate food, surfaces, or equipment.",
    ],
    page: 41,
    href: `${mpiGuideUrl}#page=41`,
  },
  {
    title: "Temperature Control Guide",
    description: "View guide",
    summary:
      "Brings together keeping food cold, thorough cooking, reheating, defrosting, and hot holding so staff can manage time and temperature safely.",
    section: "Preparing and making plus cooking",
    bulletPoints: [
      "Keep chilled food cold, cook thoroughly, and reheat properly so harmful bugs do not survive or multiply.",
      "Defrost food safely and avoid leaving high-risk foods in unsafe temperature ranges for too long.",
      "Use checks and records to prove your cold holding, cooking, reheating, and hot holding practices are working.",
    ],
    page: 54,
    href: `${mpiGuideUrl}#page=54`,
  },
  {
    title: "Cleaning & Sanitizing",
    description: "View guide",
    summary:
      "Uses the template's cleaning and sanitising expectations for food areas, equipment, handwashing points, and chemical separation.",
    section: "Cleaning, sanitising, and facilities",
    bulletPoints: [
      "Clean and sanitise food areas and equipment so bugs and dirt do not build up over time.",
      "Keep handwashing facilities available and easy to reach where food is handled.",
      "Store cleaning chemicals away from food and food-contact items to prevent contamination.",
    ],
    page: 102,
    href: `${mpiGuideUrl}#page=102`,
  },
  {
    title: "Record Keeping",
    description: "View guide",
    summary:
      "Explains why records matter for verification, complaints, recalls, and proving that required food safety checks were completed.",
    section: "Keeping records",
    bulletPoints: [
      "Records help prove that checks were completed and that your food safety procedures were followed.",
      "Good records support verification visits, complaint handling, and food recalls when something goes wrong.",
      "Without records, it is harder to show that your business made safe and suitable food.",
    ],
    page: 117,
    href: `${mpiGuideUrl}#page=117`,
  },
];

const pageAccent = "#0f6b95";
const pageAccentDark = "#0a4f6e";
const pageAccentSoft = "#e9f6fd";
const pageBorder = "#bfd6e2";
const pageShadow = "0 18px 45px rgba(15, 60, 85, 0.12)";

function cardStyle() {
  return {
    background: "#fff",
    border: `1px solid ${pageBorder}`,
    borderRadius: "24px",
    boxShadow: pageShadow,
  } as const;
}

export default function Support() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeGuide, setActiveGuide] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadRecentActivity() {
      try {
        const response = await fetch("http://localhost:4000/api/notifications");
        const data = await response.json();

        if (!ignore && Array.isArray(data)) {
          setNotifications(data.slice(0, 5));
        }
      } catch {
        if (!ignore) {
          setNotifications([]);
        }
      }
    }

    loadRecentActivity();

    return () => {
      ignore = true;
    };
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredFaqs = useMemo(() => {
    if (!normalizedQuery) {
      return faqItems;
    }

    return faqItems.filter((item) => {
      return `${item.question} ${item.answer.join(" ")}`.toLowerCase().includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  const filteredGuides = useMemo(() => {
    if (!normalizedQuery) {
      return guideItems;
    }

    return guideItems.filter((item) => {
      return `${item.title} ${item.description} ${item.summary} ${item.section} ${item.bulletPoints.join(" ")}`
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  const recentActivity = useMemo(() => {
    if (notifications.length === 0) {
      return ["No recent activity shown"];
    }

    return notifications.map((item) => item.title);
  }, [notifications]);

  return (
    <DashboardLayout title="Support">
      <div
        style={{
          maxWidth: "1180px",
          padding: "10px 8px 28px",
          borderRadius: "34px",
          background:
            "radial-gradient(circle at top left, rgba(15, 107, 149, 0.12), transparent 28%), radial-gradient(circle at bottom right, rgba(14, 86, 119, 0.1), transparent 32%)",
        }}
      >
        <section
          style={{
            ...cardStyle(),
            padding: "28px 30px 20px",
            marginBottom: "18px",
            background: "linear-gradient(135deg, #ffffff 0%, #f7fcff 100%)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "18px", flexWrap: "wrap" }}>
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  color: pageAccent,
                  marginBottom: "8px",
                }}
              >
                SUPPORT HUB
              </div>
              <div style={{ fontSize: "30px", fontWeight: 800, color: "#12222b", marginBottom: "8px" }}>
                Food safety guidance for your team
              </div>
              <div style={{ maxWidth: "680px", color: "#4d606b", fontSize: "15px", lineHeight: 1.6 }}>
                Search common questions, open practical guidance cards, and jump to the official MPI Food Control Plan when you need the full reference.
              </div>
            </div>

            <div
              style={{
                alignSelf: "flex-start",
                padding: "10px 14px",
                borderRadius: "999px",
                background: pageAccentSoft,
                color: pageAccentDark,
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              Based on NZ MPI guidance
            </div>
          </div>

          <div
            style={{
              maxWidth: "520px",
              border: `2px solid ${pageAccent}`,
              borderRadius: "22px",
              display: "flex",
              alignItems: "center",
              padding: "14px 18px",
              gap: "12px",
              background: "#fff",
              marginTop: "24px",
              boxShadow: "0 10px 26px rgba(15, 107, 149, 0.12)",
            }}
          >
            <span style={{ fontSize: "24px", lineHeight: 1, color: pageAccent }}>⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "20px",
                fontWeight: 700,
                background: "transparent",
                color: "#17313d",
              }}
            />
            <span style={{ fontSize: "24px", lineHeight: 1, color: pageAccent }}>◉</span>
          </div>

          <div
            style={{
              marginTop: "12px",
              marginLeft: "12px",
              color: "#5a707d",
              fontSize: "13px",
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#22b573",
                flexShrink: 0,
              }}
            />
            {recentActivity[0]}
          </div>

          <div style={{ marginTop: "18px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => navigate("/business-details")}
              style={{
                border: "none",
                background: "linear-gradient(135deg, #0f6b95 0%, #0a4f6e 100%)",
                color: "#fff",
                borderRadius: "14px",
                padding: "12px 18px",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 12px 24px rgba(10, 79, 110, 0.22)",
              }}
            >
              Open business details form
            </button>
            <div style={{ alignSelf: "center", color: "#607480", fontSize: "14px" }}>
              Complete the MPI business-details pages digitally and save them to the database.
            </div>
          </div>
        </section>

        <section
          style={{
            ...cardStyle(),
            marginBottom: "20px",
            padding: "16px 16px 18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: `3px solid ${pageAccent}`,
                color: pageAccent,
                display: "grid",
                placeItems: "center",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              i
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#12222b" }}>COMMON QUESTIONS</div>
              <div style={{ color: "#607480", fontSize: "13px" }}>Quick answers and shortcuts for common staff tasks.</div>
            </div>
          </div>

          <div style={{ display: "grid", gap: "6px" }}>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((item) => {
                const isOpen = activeFaq === item.question;
                const actionHref = item.actionHref;

                return (
                  <div
                    key={item.question}
                    style={{
                      border: `1px solid ${isOpen ? pageAccent : pageBorder}`,
                      borderRadius: "18px",
                      background: isOpen
                        ? "linear-gradient(180deg, #ffffff 0%, #f3fbff 100%)"
                        : "linear-gradient(180deg, #ffffff 0%, #f9fcfe 100%)",
                      boxShadow: isOpen
                        ? "0 14px 28px rgba(15, 107, 149, 0.14)"
                        : "0 8px 18px rgba(15, 60, 85, 0.06)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : item.question)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "14px 16px",
                        border: "none",
                        background: "transparent",
                        fontSize: "16px",
                        color: "#1d313c",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span>{item.question}</span>
                      <span style={{ color: isOpen ? pageAccentDark : "#21313b", fontSize: "24px", flexShrink: 0 }}>
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>

                    {isOpen ? (
                      <div
                        style={{
                          borderTop: `1px solid ${pageBorder}`,
                          padding: "0 16px 16px 16px",
                        }}
                      >
                        <ul style={{ margin: "14px 0 16px", paddingLeft: "20px", color: "#415762", lineHeight: 1.7 }}>
                          {item.answer.map((answerLine) => (
                            <li key={answerLine} style={{ marginBottom: "8px" }}>
                              {answerLine}
                            </li>
                          ))}
                        </ul>

                        {item.actionLabel && actionHref ? (
                          item.actionIsExternal ? (
                            <a
                              href={actionHref}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: "inline-block",
                                textDecoration: "none",
                                background: `linear-gradient(135deg, ${pageAccent} 0%, ${pageAccentDark} 100%)`,
                                color: "#fff",
                                borderRadius: "12px",
                                padding: "10px 14px",
                                fontWeight: 700,
                              }}
                            >
                              {item.actionLabel}
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => navigate(actionHref)}
                              style={{
                                border: "none",
                                background: `linear-gradient(135deg, ${pageAccent} 0%, ${pageAccentDark} 100%)`,
                                color: "#fff",
                                borderRadius: "12px",
                                padding: "10px 14px",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              {item.actionLabel}
                            </button>
                          )
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <div style={{ padding: "18px 14px", color: "#666" }}>No matching questions found.</div>
            )}
          </div>
        </section>

        <section
          style={{
            ...cardStyle(),
            marginBottom: "22px",
            padding: "24px 26px",
            display: "grid",
            gridTemplateColumns: "minmax(260px, 1fr) minmax(220px, 320px)",
            gap: "20px",
            alignItems: "center",
            background: "linear-gradient(135deg, #ffffff 0%, #f7fbfd 100%)",
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: "22px", marginBottom: "8px", color: "#12222b" }}>Contact support</div>
            <div style={{ color: "#607480", fontSize: "14px", marginBottom: "16px", maxWidth: "560px" }}>
              Reach out when you need help with verification, staff guidance, records, or understanding a food safety requirement.
            </div>

            <div style={{ marginBottom: "10px" }}>
              <div style={{ fontWeight: 700, fontSize: "16px", color: pageAccentDark }}>Email Support</div>
              <div style={{ color: "#444", fontSize: "14px" }}>support@foodiecontrol.com</div>
              <div style={{ color: "#666", fontSize: "13px" }}>Response within 24 hr</div>
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: pageAccentDark }}>Phone Support</div>
              <div style={{ color: "#444", fontSize: "14px" }}>0800 food stuff</div>
              <div style={{ color: "#666", fontSize: "13px" }}>Mon-Fri 8-6 nzst</div>
            </div>
          </div>

          <a
            href="mailto:support@foodiecontrol.com?subject=Support%20Request"
            style={{
              justifySelf: "center",
              background: `linear-gradient(135deg, ${pageAccent} 0%, ${pageAccentDark} 100%)`,
              color: "#fff",
              textDecoration: "none",
              padding: "16px 34px",
              fontWeight: 800,
              fontSize: "18px",
              minWidth: "240px",
              textAlign: "center",
              borderRadius: "16px",
              boxShadow: "0 16px 30px rgba(10, 79, 110, 0.25)",
            }}
          >
            Send Support Request
          </a>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "18px 26px",
          }}
        >
          <a
            href={mpiGuideUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              ...cardStyle(),
              color: "inherit",
              textDecoration: "none",
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "138px",
              gridColumn: "1 / -1",
              background: `linear-gradient(135deg, ${pageAccentSoft} 0%, #ffffff 100%)`,
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.08em", color: pageAccent }}>
              OFFICIAL SOURCE
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "24px", marginBottom: "8px", color: "#12222b" }}>
                MPI Template Food Control Plan: Simply Safe & Suitable
              </div>
              <div style={{ color: "#36454f", fontSize: "14px", maxWidth: "900px", lineHeight: 1.6 }}>
                These support cards are based on the New Zealand Food Safety template and its day-cycle guidance for preparing, cooking, cleaning, pest checks, temperature control, and record keeping.
              </div>
            </div>
            <div style={{ marginTop: "14px", fontWeight: 700, color: pageAccent }}>
              Open official PDF {">"}
            </div>
          </a>

          {filteredGuides.map((item) => {
            const isOpen = activeGuide === item.title;

            return (
            <div
              key={item.title}
              style={{
                ...cardStyle(),
                padding: "18px 22px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                minHeight: isOpen ? "auto" : "132px",
                background: isOpen
                  ? "linear-gradient(180deg, #ffffff 0%, #f4fbff 100%)"
                  : "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
                borderColor: isOpen ? pageAccent : pageBorder,
                boxShadow: isOpen
                  ? "0 22px 40px rgba(15, 107, 149, 0.16)"
                  : pageShadow,
              }}
            >
              <button
                type="button"
                onClick={() => setActiveGuide(isOpen ? null : item.title)}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  width: "100%",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    border: `3px solid ${isOpen ? pageAccentDark : "#1284ff"}`,
                    background: isOpen ? pageAccentSoft : "#f7fbff",
                    color: pageAccent,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 800,
                    fontSize: "18px",
                    flexShrink: 0,
                  }}
                >
                  ▣
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: "17px", marginBottom: "6px", color: "#12222b" }}>{item.title}</div>
                  <div style={{ color: pageAccent, fontSize: "12px", fontWeight: 700, marginBottom: "8px" }}>
                    {item.section}
                  </div>
                  <div style={{ color: "#394d58", fontSize: "13px", lineHeight: 1.55, maxWidth: "340px" }}>
                    {item.summary}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    flexShrink: 0,
                    color: isOpen ? pageAccentDark : "#101010",
                    transform: isOpen ? "translateY(2px)" : "none",
                  }}
                >
                  {isOpen ? "↓" : "→"}
                </div>
              </button>

              {isOpen ? (
                <div
                  style={{
                    borderTop: `1px solid ${pageBorder}`,
                    paddingTop: "16px",
                    marginLeft: "46px",
                  }}
                >
                  <div style={{ color: "#607480", fontSize: "12px", fontWeight: 800, letterSpacing: "0.08em", marginBottom: "10px" }}>
                    QUICK GUIDE
                  </div>
                  <ul style={{ margin: "0 0 18px 0", paddingLeft: "18px", color: "#243841", lineHeight: 1.75, fontSize: "14px" }}>
                    {item.bulletPoints.map((point) => (
                      <li key={point} style={{ marginBottom: "8px" }}>
                        {point}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    title={`Open ${item.title} on page ${item.page} of the MPI guide`}
                    style={{
                      display: "inline-block",
                      background: `linear-gradient(135deg, ${pageAccent} 0%, ${pageAccentDark} 100%)`,
                      color: "#fff",
                      textDecoration: "none",
                      padding: "11px 18px",
                      fontWeight: 700,
                      borderRadius: "12px",
                      boxShadow: "0 12px 24px rgba(10, 79, 110, 0.22)",
                    }}
                  >
                    Open PDF guide
                  </a>
                </div>
              ) : (
                <div style={{ marginLeft: "46px", color: "#596d78", fontSize: "13px", textTransform: "lowercase", fontWeight: 600 }}>
                  {item.description}
                </div>
              )}
            </div>
          );})}
        </section>
      </div>
    </DashboardLayout>
  );
}