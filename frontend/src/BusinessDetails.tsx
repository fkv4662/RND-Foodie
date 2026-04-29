import { Fragment, type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

type CheckboxGroup = Record<string, boolean>;

type AdditionalSite = {
  streetAddress: string;
  activitiesWaterSupplySource: string;
};

type ContactBlock = {
  name: string;
  physicalAddress: string;
  telephone: string;
  email: string;
};

type BusinessDetailsForm = {
  legalName: string;
  tradingName: string;
  foodService: CheckboxGroup;
  foodServiceOther: string;
  foodRetail: CheckboxGroup;
  foodRetailOther: string;
  postalAddress: string;
  telephone: string;
  email: string;
  locationOneAddress: string;
  waterSupply: string;
  additionalSites: AdditionalSite[];
  operator: ContactBlock;
  operatorEachBusiness: ContactBlock;
  dayToDayManager: {
    nameOrPosition: string;
    telephone: string;
  };
  registrationAuthority: {
    authorityType: "MPI" | "Council";
    councilName: string;
    contactPerson: string;
    address: string;
    telephone: string;
    email: string;
  };
  verifier: {
    verificationAgency: string;
    contactPerson: string;
    address: string;
    telephone: string;
    email: string;
  };
};

type BusinessFormSummary = {
  id: number;
  legalName: string;
  tradingName: string;
  updatedAt: string;
};

const businessDetailsApi = "http://localhost:4000/api/business-details";

const defaultFormData: BusinessDetailsForm = {
  legalName: "",
  tradingName: "",
  foodService: {
    eatIn: false,
    takeaway: false,
    onsiteCatering: false,
    offsiteCatering: false,
  },
  foodServiceOther: "",
  foodRetail: {
    butcher: false,
    delicatessen: false,
    bakery: false,
    fishmonger: false,
    freshProduce: false,
    supermarket: false,
    transportDelivery: false,
    mobileFoodServiceOrRetail: false,
    transportLogistics: false,
    importer: false,
  },
  foodRetailOther: "",
  postalAddress: "",
  telephone: "",
  email: "",
  locationOneAddress: "",
  waterSupply: "",
  additionalSites: [
    { streetAddress: "", activitiesWaterSupplySource: "" },
    { streetAddress: "", activitiesWaterSupplySource: "" },
    { streetAddress: "", activitiesWaterSupplySource: "" },
  ],
  operator: {
    name: "",
    physicalAddress: "",
    telephone: "",
    email: "",
  },
  operatorEachBusiness: {
    name: "",
    physicalAddress: "",
    telephone: "",
    email: "",
  },
  dayToDayManager: {
    nameOrPosition: "",
    telephone: "",
  },
  registrationAuthority: {
    authorityType: "MPI",
    councilName: "",
    contactPerson: "",
    address: "",
    telephone: "",
    email: "",
  },
  verifier: {
    verificationAgency: "",
    contactPerson: "",
    address: "",
    telephone: "",
    email: "",
  },
};

const foodServiceOptions = [
  { key: "eatIn", label: "eat in" },
  { key: "takeaway", label: "takeaway" },
  { key: "onsiteCatering", label: "on-site catering" },
  { key: "offsiteCatering", label: "off-site catering" },
];

const foodRetailOptions = [
  { key: "butcher", label: "butcher" },
  { key: "delicatessen", label: "delicatessen" },
  { key: "bakery", label: "bakery" },
  { key: "fishmonger", label: "fishmonger" },
  { key: "freshProduce", label: "fresh produce" },
  { key: "supermarket", label: "supermarket" },
  { key: "transportDelivery", label: "transport/delivery" },
  { key: "mobileFoodServiceOrRetail", label: "mobile food service or retail" },
  { key: "transportLogistics", label: "transport/logistics" },
  { key: "importer", label: "importer" },
];

const shellCard = {
  background: "linear-gradient(180deg, #ffffff 0%, #f6fbfe 100%)",
  border: "1px solid #b4c6d0",
  borderRadius: "26px",
  boxShadow: "0 20px 42px rgba(12, 58, 83, 0.12)",
};

const headerCellStyle = {
  gridColumn: "1 / -1",
  background: "#c9c9c9",
  border: "1px solid #474747",
  padding: "9px 12px",
  fontSize: "18px",
  fontWeight: 800,
  color: "#111",
} as const;

const noteCellStyle = {
  gridColumn: "1 / -1",
  background: "#d0d0d0",
  border: "1px solid #474747",
  padding: "10px 12px",
  color: "#202020",
  lineHeight: 1.45,
  fontSize: "15px",
} as const;

const labelCellStyle = {
  border: "1px solid #474747",
  background: "#fffdf8",
  padding: "8px 10px",
  fontSize: "15px",
  lineHeight: 1.35,
  color: "#1b1b1b",
} as const;

const valueCellStyle = {
  border: "1px solid #474747",
  background: "#eef3ff",
  padding: "8px 10px",
} as const;

const inputStyle = {
  width: "100%",
  border: "none",
  background: "transparent",
  outline: "none",
  fontSize: "15px",
  color: "#1c2430",
  fontFamily: "inherit",
} as const;

const textareaStyle = {
  ...inputStyle,
  resize: "vertical" as const,
  minHeight: "74px",
};

function mergeFormData(payload: unknown): BusinessDetailsForm {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return defaultFormData;
  }

  const source = payload as Partial<BusinessDetailsForm>;

  return {
    ...defaultFormData,
    ...source,
    foodService: { ...defaultFormData.foodService, ...(source.foodService || {}) },
    foodRetail: { ...defaultFormData.foodRetail, ...(source.foodRetail || {}) },
    additionalSites: defaultFormData.additionalSites.map((site, index) => ({
      ...site,
      ...(source.additionalSites?.[index] || {}),
    })),
    operator: { ...defaultFormData.operator, ...(source.operator || {}) },
    operatorEachBusiness: {
      ...defaultFormData.operatorEachBusiness,
      ...(source.operatorEachBusiness || {}),
    },
    dayToDayManager: {
      ...defaultFormData.dayToDayManager,
      ...(source.dayToDayManager || {}),
    },
    registrationAuthority: {
      ...defaultFormData.registrationAuthority,
      ...(source.registrationAuthority || {}),
    },
    verifier: { ...defaultFormData.verifier, ...(source.verifier || {}) },
  };
}

function formatBusinessName(summary: Pick<BusinessFormSummary, "legalName" | "tradingName">) {
  return summary.legalName || summary.tradingName || "Untitled business";
}

export default function BusinessDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BusinessDetailsForm>(defaultFormData);
  const [savedFormData, setSavedFormData] = useState<BusinessDetailsForm>(defaultFormData);
  const [savedForms, setSavedForms] = useState<BusinessFormSummary[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showSavedDetails, setShowSavedDetails] = useState(false);
  const [message, setMessage] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    void initializePage();
  }, []);

  const selectedFoodService = useMemo(
    () => foodServiceOptions.filter((option) => savedFormData.foodService[option.key]).map((option) => option.label),
    [savedFormData]
  );
  const selectedFoodRetail = useMemo(
    () => foodRetailOptions.filter((option) => savedFormData.foodRetail[option.key]).map((option) => option.label),
    [savedFormData]
  );
  const filledAdditionalSites = useMemo(
    () => savedFormData.additionalSites.filter((site) => site.streetAddress.trim() || site.activitiesWaterSupplySource.trim()),
    [savedFormData]
  );

  async function fetchSummaries(): Promise<BusinessFormSummary[]> {
    const response = await fetch(businessDetailsApi);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not load business forms");
    }

    return Array.isArray(data) ? data : [];
  }

  async function loadFormRecord(id: number) {
    setLoadingRecord(true);

    try {
      const response = await fetch(`${businessDetailsApi}/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load selected business form");
      }

      const mergedData = mergeFormData(data.formData);
      setSelectedFormId(id);
      setFormData(mergedData);
      setSavedFormData(mergedData);
      setUpdatedAt(data.updatedAt || null);
      setShowSavedDetails(true);
    } finally {
      setLoadingRecord(false);
    }
  }

  async function initializePage(targetId?: number | null) {
    setLoading(true);

    try {
      const forms = await fetchSummaries();
      setSavedForms(forms);

      const resolvedId = targetId ?? forms[0]?.id ?? null;

      if (resolvedId !== null) {
        await loadFormRecord(resolvedId);
      } else {
        setSelectedFormId(null);
        setFormData(defaultFormData);
        setSavedFormData(defaultFormData);
        setUpdatedAt(null);
        setShowSavedDetails(false);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load business forms.");
    } finally {
      setLoading(false);
    }
  }

  const updateField = <K extends keyof BusinessDetailsForm>(key: K, value: BusinessDetailsForm[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateContactBlock = (
    block: "operator" | "operatorEachBusiness",
    key: keyof ContactBlock,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [block]: {
        ...prev[block],
        [key]: value,
      },
    }));
  };

  const updateVerifier = (key: keyof BusinessDetailsForm["verifier"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      verifier: {
        ...prev.verifier,
        [key]: value,
      },
    }));
  };

  const updateRegistrationAuthority = (key: keyof BusinessDetailsForm["registrationAuthority"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      registrationAuthority: {
        ...prev.registrationAuthority,
        [key]: value,
      },
    }));
  };

  const updateDayToDayManager = (key: keyof BusinessDetailsForm["dayToDayManager"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      dayToDayManager: {
        ...prev.dayToDayManager,
        [key]: value,
      },
    }));
  };

  const updateCheckboxGroup = (group: "foodService" | "foodRetail", key: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: value,
      },
    }));
  };

  const updateAdditionalSite = (index: number, key: keyof AdditionalSite, value: string) => {
    setFormData((prev) => ({
      ...prev,
      additionalSites: prev.additionalSites.map((site, siteIndex) =>
        siteIndex === index ? { ...site, [key]: value } : site
      ),
    }));
  };

  const startNewForm = () => {
    setSelectedFormId(null);
    setFormData(defaultFormData);
    setSavedFormData(defaultFormData);
    setUpdatedAt(null);
    setShowSavedDetails(false);
    setMessage("Creating a new business form.");
  };

  const selectExistingForm = async (id: number) => {
    setMessage("");

    try {
      await loadFormRecord(id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not open business form.");
    }
  };

  const saveForm = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        selectedFormId === null ? businessDetailsApi : `${businessDetailsApi}/${selectedFormId}`,
        {
          method: selectedFormId === null ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Save failed");
      }

      const resolvedId = Number(data.id ?? selectedFormId);
      const mergedData = mergeFormData(formData);
      setSelectedFormId(resolvedId);
      setSavedFormData(mergedData);
      setUpdatedAt(data.updatedAt || null);
      setShowSavedDetails(true);
      setMessage(selectedFormId === null ? "Business form created successfully." : "Business form updated successfully.");

      const forms = await fetchSummaries();
      setSavedForms(forms);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteSavedDetails = async () => {
    if (selectedFormId === null) {
      return;
    }

    const activeSummary = savedForms.find((item) => item.id === selectedFormId);
    const confirmed = window.confirm(
      `Delete ${formatBusinessName(activeSummary || { legalName: "", tradingName: "" })} from the database?`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setMessage("");

    try {
      const response = await fetch(`${businessDetailsApi}/${selectedFormId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Delete failed");
      }

      const forms = await fetchSummaries();
      setSavedForms(forms);

      if (forms.length > 0) {
        await loadFormRecord(forms[0].id);
      } else {
        setSelectedFormId(null);
        setFormData(defaultFormData);
        setSavedFormData(defaultFormData);
        setUpdatedAt(null);
        setShowSavedDetails(false);
      }

      setMessage("Business form deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const hasSavedRecord = selectedFormId !== null;

  return (
    <DashboardLayout title="Business Details">
      <div style={{ maxWidth: "1240px" }}>
        <div style={{ ...shellCard, padding: "26px 28px", marginBottom: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#0f6b95", marginBottom: "8px" }}>
                DIGITAL TEMPLATE
              </div>
              <div style={{ fontSize: "34px", fontWeight: 800, color: "#0f5d8a", marginBottom: "8px" }}>
                Business details
              </div>
              <div style={{ maxWidth: "760px", color: "#4f6370", fontSize: "15px", lineHeight: 1.6 }}>
                Each business can now keep its own saved form. Create a new business record, reopen an existing one, update it, or delete it without overwriting the others.
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => navigate("/support")}
                style={{
                  border: "1px solid #86b6cf",
                  background: "#ffffff",
                  color: "#0f5d8a",
                  borderRadius: "14px",
                  padding: "12px 16px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Back to Support
              </button>
              <button
                type="button"
                onClick={startNewForm}
                style={{
                  border: "1px solid #86b6cf",
                  background: "#f5fbff",
                  color: "#0f5d8a",
                  borderRadius: "14px",
                  padding: "12px 16px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                New business form
              </button>
              <button
                type="submit"
                form="business-details-form"
                disabled={saving || loading || loadingRecord}
                style={{
                  border: "none",
                  background: "linear-gradient(135deg, #0f6b95 0%, #0a4f6e 100%)",
                  color: "#fff",
                  borderRadius: "14px",
                  padding: "12px 18px",
                  fontWeight: 800,
                  cursor: saving || loading || loadingRecord ? "default" : "pointer",
                  opacity: saving || loading || loadingRecord ? 0.7 : 1,
                }}
              >
                {saving ? "Saving..." : selectedFormId === null ? "Save new business" : "Update business"}
              </button>
              <button
                type="button"
                onClick={() => setShowSavedDetails((current) => !current)}
                disabled={!hasSavedRecord}
                style={{
                  border: "1px solid #86b6cf",
                  background: hasSavedRecord ? "#f5fbff" : "#eef2f4",
                  color: hasSavedRecord ? "#0f5d8a" : "#7c8b95",
                  borderRadius: "14px",
                  padding: "12px 16px",
                  fontWeight: 700,
                  cursor: hasSavedRecord ? "pointer" : "default",
                }}
              >
                {showSavedDetails ? "Hide saved details" : "View saved details"}
              </button>
              <button
                type="button"
                onClick={deleteSavedDetails}
                disabled={!hasSavedRecord || deleting}
                style={{
                  border: "1px solid #df8e8e",
                  background: hasSavedRecord ? "#fff5f5" : "#f3eeee",
                  color: hasSavedRecord ? "#a43d3d" : "#a6a0a0",
                  borderRadius: "14px",
                  padding: "12px 16px",
                  fontWeight: 700,
                  cursor: hasSavedRecord && !deleting ? "pointer" : "default",
                }}
              >
                {deleting ? "Deleting..." : "Delete current business"}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: "18px", flexWrap: "wrap", marginTop: "18px", color: "#546a77", fontSize: "14px" }}>
            <div>
              <strong>Status:</strong> {loading ? "Loading business forms..." : loadingRecord ? "Opening selected business..." : "Ready"}
            </div>
            <div>
              <strong>Current business:</strong> {selectedFormId === null ? "New unsaved form" : formatBusinessName(savedForms.find((item) => item.id === selectedFormId) || { legalName: formData.legalName, tradingName: formData.tradingName })}
            </div>
            <div>
              <strong>Last saved:</strong> {updatedAt ? new Date(updatedAt).toLocaleString() : "Not saved yet"}
            </div>
            {message ? <div><strong>Message:</strong> {message}</div> : null}
          </div>
        </div>

        <div style={{ ...shellCard, padding: "22px", marginBottom: "18px" }}>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#12222b", marginBottom: "14px" }}>
            Saved business forms
          </div>

          {savedForms.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
              {savedForms.map((item) => {
                const isActive = item.id === selectedFormId;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => void selectExistingForm(item.id)}
                    style={{
                      textAlign: "left",
                      border: isActive ? "2px solid #0f6b95" : "1px solid #c7d6de",
                      background: isActive ? "linear-gradient(180deg, #eef8fd 0%, #ffffff 100%)" : "#ffffff",
                      borderRadius: "18px",
                      padding: "16px 18px",
                      cursor: "pointer",
                      boxShadow: isActive ? "0 12px 28px rgba(15, 107, 149, 0.14)" : "0 8px 18px rgba(12, 58, 83, 0.06)",
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.08em", color: "#0f6b95", marginBottom: "8px" }}>
                      BUSINESS #{item.id}
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#18313d", marginBottom: "6px" }}>
                      {formatBusinessName(item)}
                    </div>
                    <div style={{ color: "#5e7480", fontSize: "14px", marginBottom: "6px" }}>
                      Trading name: {item.tradingName || "-"}
                    </div>
                    <div style={{ color: "#78909c", fontSize: "13px" }}>
                      Saved {new Date(item.updatedAt).toLocaleString()}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ color: "#607480", fontSize: "15px" }}>
              No business forms are saved yet. Start a new one and save it.
            </div>
          )}
        </div>

        {showSavedDetails ? (
          <div style={{ ...shellCard, padding: "22px", marginBottom: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.12em", color: "#0f6b95", marginBottom: "6px" }}>
                  SAVED RECORD
                </div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#1c2b34" }}>
                  Current database copy of the selected business
                </div>
              </div>
              <div style={{ color: "#546a77", fontSize: "14px", alignSelf: "center" }}>
                {updatedAt ? `Saved ${new Date(updatedAt).toLocaleString()}` : "No saved record"}
              </div>
            </div>

            {hasSavedRecord ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
                <SavedPreviewCard
                  title="Business"
                  lines={[
                    `Legal name: ${savedFormData.legalName || "-"}`,
                    `Trading name: ${savedFormData.tradingName || "-"}`,
                    `Phone: ${savedFormData.telephone || "-"}`,
                    `Email: ${savedFormData.email || "-"}`,
                  ]}
                />
                <SavedPreviewCard
                  title="Activity"
                  lines={[
                    `Food service: ${selectedFoodService.join(", ") || savedFormData.foodServiceOther || "-"}`,
                    `Food retail: ${selectedFoodRetail.join(", ") || savedFormData.foodRetailOther || "-"}`,
                    `Retail other: ${savedFormData.foodRetailOther || "-"}`,
                    `Service other: ${savedFormData.foodServiceOther || "-"}`,
                  ]}
                />
                <SavedPreviewCard
                  title="Locations"
                  lines={[
                    `Main site: ${savedFormData.locationOneAddress || "-"}`,
                    `Water supply: ${savedFormData.waterSupply || "-"}`,
                    `Additional sites: ${filledAdditionalSites.length}`,
                    `Postal address: ${savedFormData.postalAddress || "-"}`,
                  ]}
                />
                <SavedPreviewCard
                  title="Management"
                  lines={[
                    `Operator: ${savedFormData.operator.name || "-"}`,
                    `Per-site operator: ${savedFormData.operatorEachBusiness.name || "-"}`,
                    `Day-to-day manager: ${savedFormData.dayToDayManager.nameOrPosition || "-"}`,
                    `Manager phone: ${savedFormData.dayToDayManager.telephone || "-"}`,
                  ]}
                />
                <SavedPreviewCard
                  title="Authority"
                  lines={[
                    `Authority: ${savedFormData.registrationAuthority.authorityType}`,
                    `Council name: ${savedFormData.registrationAuthority.councilName || "-"}`,
                    `Contact: ${savedFormData.registrationAuthority.contactPerson || "-"}`,
                    `Phone: ${savedFormData.registrationAuthority.telephone || "-"}`,
                  ]}
                />
                <SavedPreviewCard
                  title="Verifier"
                  lines={[
                    `Agency: ${savedFormData.verifier.verificationAgency || "-"}`,
                    `Contact: ${savedFormData.verifier.contactPerson || "-"}`,
                    `Phone: ${savedFormData.verifier.telephone || "-"}`,
                    `Email: ${savedFormData.verifier.email || "-"}`,
                  ]}
                />
              </div>
            ) : (
              <div style={{ color: "#607480", fontSize: "15px" }}>
                There is no saved record selected right now.
              </div>
            )}
          </div>
        ) : null}

        <form id="business-details-form" onSubmit={saveForm}>
          <div style={{ ...shellCard, padding: "22px" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#111", marginBottom: "18px" }}>
              Fill out your business details below
            </div>

            <div style={{ display: "grid", gap: "18px" }}>
              <SectionGrid title="Business details">
                <TextRow label="Legal name" value={formData.legalName} onChange={(value) => updateField("legalName", value)} />
                <TextRow label="Trading name" value={formData.tradingName} onChange={(value) => updateField("tradingName", value)} />
                <ValueRow label="Activity [tick as appropriate]">
                  <ActivityBlock title="Food Service:" options={foodServiceOptions} values={formData.foodService} onToggle={(key, value) => updateCheckboxGroup("foodService", key, value)} />
                  <OtherField label="other [specify]:" value={formData.foodServiceOther} onChange={(value) => updateField("foodServiceOther", value)} />
                  <ActivityBlock title="Food Retail:" options={foodRetailOptions} values={formData.foodRetail} onToggle={(key, value) => updateCheckboxGroup("foodRetail", key, value)} />
                  <OtherField label="other [specify]:" value={formData.foodRetailOther} onChange={(value) => updateField("foodRetailOther", value)} />
                </ValueRow>
                <TextAreaRow label="Postal address" value={formData.postalAddress} onChange={(value) => updateField("postalAddress", value)} rows={3} />
                <TextRow label="Telephone" value={formData.telephone} onChange={(value) => updateField("telephone", value)} />
                <TextRow label="Email" value={formData.email} onChange={(value) => updateField("email", value)} />
                <TextAreaRow label={"Street address (1)\n(premises where\nfood business\noperates)"} value={formData.locationOneAddress} onChange={(value) => updateField("locationOneAddress", value)} rows={5} />
                <TextAreaRow label="Water supply" value={formData.waterSupply} onChange={(value) => updateField("waterSupply", value)} rows={3} />
              </SectionGrid>

              <SectionGrid
                note={
                  <span>
                    <strong>Additional sites</strong> [continue on a separate sheet if needed and attach] List below any other premises that are used in connection with the food business. Note any activities that will take place and the water supply source you will use for food purposes.
                  </span>
                }
              >
                {formData.additionalSites.map((site, index) => (
                  <Fragment key={`site-${index}`}>
                    <TextAreaRow
                      label={`Street address (${index + 2})`}
                      value={site.streetAddress}
                      onChange={(value) => updateAdditionalSite(index, "streetAddress", value)}
                      rows={4}
                    />
                    <TextAreaRow
                      label="Activities/water supply source"
                      value={site.activitiesWaterSupplySource}
                      onChange={(value) => updateAdditionalSite(index, "activitiesWaterSupplySource", value)}
                      rows={3}
                    />
                  </Fragment>
                ))}
              </SectionGrid>

              <SectionGrid
                note={
                  <span>
                    <strong>Operator:</strong> The operator is the owner or other person in control of the food business. If your plan applies to more than one food business, the operator is the person responsible for ensuring the Food Control Plan requirements are met at each food business.
                  </span>
                }
              >
                <TextRow label="Name" value={formData.operator.name} onChange={(value) => updateContactBlock("operator", "name", value)} />
                <TextAreaRow label={"Physical address\n(Business or\nResidential)"} value={formData.operator.physicalAddress} onChange={(value) => updateContactBlock("operator", "physicalAddress", value)} rows={4} />
                <TextRow label="Telephone" value={formData.operator.telephone} onChange={(value) => updateContactBlock("operator", "telephone", value)} />
                <TextRow label="Email" value={formData.operator.email} onChange={(value) => updateContactBlock("operator", "email", value)} />
              </SectionGrid>

              <SectionGrid
                note={
                  <span>
                    <strong>Operator of each food business</strong> (if plan applies to more than one food business). Add additional rows as necessary.
                  </span>
                }
              >
                <TextRow label="Name" value={formData.operatorEachBusiness.name} onChange={(value) => updateContactBlock("operatorEachBusiness", "name", value)} />
                <TextAreaRow label={"Physical address\n(Business or\nResidential)"} value={formData.operatorEachBusiness.physicalAddress} onChange={(value) => updateContactBlock("operatorEachBusiness", "physicalAddress", value)} rows={4} />
                <TextRow label="Telephone" value={formData.operatorEachBusiness.telephone} onChange={(value) => updateContactBlock("operatorEachBusiness", "telephone", value)} />
                <TextRow label="Email" value={formData.operatorEachBusiness.email} onChange={(value) => updateContactBlock("operatorEachBusiness", "email", value)} />
              </SectionGrid>

              <SectionGrid
                note={
                  <span>
                    <strong>Day-to-day manager</strong> [write 'as above' if the day-to-day manager is the operator] The day-to-day manager is the person who has the overall responsibility to make sure the Food Control Plan is being followed and the appropriate checks and records are completed.
                  </span>
                }
              >
                <TextRow label={"Name and/or\nposition"} value={formData.dayToDayManager.nameOrPosition} onChange={(value) => updateDayToDayManager("nameOrPosition", value)} />
                <TextRow label="Telephone" value={formData.dayToDayManager.telephone} onChange={(value) => updateDayToDayManager("telephone", value)} />
              </SectionGrid>

              <SectionGrid
                note={
                  <span>
                    <strong>Registration authority</strong> (this will be your local council unless your plan covers multiple premises in more than one council jurisdiction, then it will be MPI).
                  </span>
                }
              >
                <ValueRow label="Registration authority">
                  <div style={{ display: "flex", gap: "22px", flexWrap: "wrap", marginBottom: "10px" }}>
                    {(["MPI", "Council"] as const).map((option) => (
                      <label key={option} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px" }}>
                        <input
                          type="radio"
                          checked={formData.registrationAuthority.authorityType === option}
                          onChange={() => updateRegistrationAuthority("authorityType", option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "170px 1fr", gap: "8px", alignItems: "center" }}>
                    <div style={{ fontSize: "15px" }}>[Council name]:</div>
                    <input
                      value={formData.registrationAuthority.councilName}
                      onChange={(event) => updateRegistrationAuthority("councilName", event.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </ValueRow>
                <TextRow label="Contact person" value={formData.registrationAuthority.contactPerson} onChange={(value) => updateRegistrationAuthority("contactPerson", value)} />
                <TextAreaRow label="Address" value={formData.registrationAuthority.address} onChange={(value) => updateRegistrationAuthority("address", value)} rows={4} />
                <TextRow label="Telephone" value={formData.registrationAuthority.telephone} onChange={(value) => updateRegistrationAuthority("telephone", value)} />
                <TextRow label="Email" value={formData.registrationAuthority.email} onChange={(value) => updateRegistrationAuthority("email", value)} />
              </SectionGrid>

              <SectionGrid note={<span><strong>Verifier</strong> (if not local council)</span>}>
                <TextAreaRow label="Verification agency" value={formData.verifier.verificationAgency} onChange={(value) => updateVerifier("verificationAgency", value)} rows={3} />
                <TextRow label="Contact person" value={formData.verifier.contactPerson} onChange={(value) => updateVerifier("contactPerson", value)} />
                <TextAreaRow label="Address" value={formData.verifier.address} onChange={(value) => updateVerifier("address", value)} rows={4} />
                <TextRow label="Telephone" value={formData.verifier.telephone} onChange={(value) => updateVerifier("telephone", value)} />
                <TextRow label="Email" value={formData.verifier.email} onChange={(value) => updateVerifier("email", value)} />
              </SectionGrid>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

function SectionGrid({ title, note, children }: { title?: string; note?: ReactNode; children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "170px minmax(0, 1fr)" }}>
      {title ? <div style={headerCellStyle}>{title}</div> : null}
      {note ? <div style={noteCellStyle}>{note}</div> : null}
      {children}
    </div>
  );
}

function TextRow({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <>
      <div style={{ ...labelCellStyle, whiteSpace: "pre-line" }}>{label}</div>
      <div style={valueCellStyle}>
        <input value={value} onChange={(event) => onChange(event.target.value)} style={inputStyle} />
      </div>
    </>
  );
}

function TextAreaRow({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <>
      <div style={{ ...labelCellStyle, whiteSpace: "pre-line" }}>{label}</div>
      <div style={valueCellStyle}>
        <textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} style={textareaStyle} />
      </div>
    </>
  );
}

function ValueRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <div style={{ ...labelCellStyle, whiteSpace: "pre-line" }}>{label}</div>
      <div style={{ ...valueCellStyle, lineHeight: 1.55 }}>{children}</div>
    </>
  );
}

function ActivityBlock({
  title,
  options,
  values,
  onToggle,
}: {
  title: string;
  options: Array<{ key: string; label: string }>;
  values: CheckboxGroup;
  onToggle: (key: string, value: boolean) => void;
}) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ fontSize: "15px", marginBottom: "8px" }}>{title}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px" }}>
        {options.map((option) => (
          <label key={option.key} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "15px" }}>
            <input type="checkbox" checked={Boolean(values[option.key])} onChange={(event) => onToggle(option.key, event.target.checked)} />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function OtherField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px", alignItems: "center", marginBottom: "14px" }}>
      <div style={{ fontSize: "15px" }}>{label}</div>
      <input value={value} onChange={(event) => onChange(event.target.value)} style={inputStyle} />
    </div>
  );
}

function SavedPreviewCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f9fcfe 100%)",
        border: "1px solid #c8d7de",
        borderRadius: "18px",
        padding: "16px 18px",
        boxShadow: "0 10px 24px rgba(12, 58, 83, 0.08)",
      }}
    >
      <div style={{ fontSize: "16px", fontWeight: 800, color: "#153747", marginBottom: "10px" }}>{title}</div>
      <div style={{ display: "grid", gap: "8px", color: "#4c616d", fontSize: "14px", lineHeight: 1.5 }}>
        {lines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
    </div>
  );
}